const ticketCoreData = require('../../core/ticket.js');
const rssProvider = require('./provider.js');
const config = require('../../config.js');
const common = require('../../common/common.js');
const mailer = require('../../mailer/mailer.js');
const scheduleTime = require('./schedule.js');

const RssParser = require('rss-parser');
const schedule = require('node-schedule');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
const isToday = require('dayjs/plugin/isToday');
dayjs.extend(dayjsCustomParseFormat);
dayjs.extend(isToday);

const parser = new RssParser();
const SUCCESS = 0;
const FAIL = 1;
const IN_PROGRESS = 2;

module.exports = {
    start: function () {
        let crawlData = {
            crawledTicketType: 0,
        };
        addTicketData(crawlData);
        addPublisherData(crawlData);
        let typeId = Object.keys(crawlData.ticketType);
        for (let i = 0; i < typeId.length; i++) {
            let aTypeId = typeId[i];
            let aTicketTypeData = crawlData.ticketType[aTypeId];
            let publisherId = Object.keys(aTicketTypeData.publisher);
            if (publisherId.length < 1) {
                continue;
            }
            if (scheduleTime[aTypeId].schedule === false) {
                crawlATicketType(crawlData, aTicketTypeData);
                continue;
            }
            let scheduleDate = createScheduleDate(aTicketTypeData);
            scheduleToCrawlATicketType(crawlData, aTicketTypeData, scheduleDate);
        }
    },
}

//#region Common functions
function addTicketData(crawlData) {
    crawlData.ticketType = {};
    let ticketTypeIds = Object.keys(ticketCoreData.type);
    for (let i = 0; i < ticketTypeIds.length; i++) {
        let typeId = ticketTypeIds[i];
        let aType = ticketCoreData.type[typeId];
        if (aType.crawlRss == true) {
            let aTicketType = common.cloneObject(aType);
            aTicketType.publisher = {};
            aTicketType.createResultData = aType.createResultData;
            crawlData.ticketType[typeId] = aTicketType;
        };
    }
};

function addPublisherData(crawlData) {
    let weekday = dayjs().day();
    let publisherId = Object.keys(ticketCoreData.publisher);
    let ticketTypeId = Object.keys(crawlData.ticketType);
    for (let i = 0; i < ticketTypeId.length; i++) {
        let typeId = ticketTypeId[i];
        let aCrawlData = crawlData.ticketType[typeId];
        let publisherNameArray = [];
        for (let j = 0; j < publisherId.length; j++) {
            let aPublisherId = publisherId[j];
            let aPublisher = ticketCoreData.publisher[aPublisherId];
            if (aPublisher.type == typeId && aPublisher.callDay.includes(weekday)) {
                let aClonePublisher = common.cloneObject(aPublisher);
                aCrawlData.publisher[aPublisherId] = aClonePublisher;
                aClonePublisher.crawlStatus = IN_PROGRESS;
                publisherNameArray.push(aClonePublisher.name);
            }
        }
        aCrawlData.publisherName = publisherNameArray.join(', ');
    }
};

function createScheduleDate(ticketTypeData) {
    let today = dayjs();
    let todayDatePart = today.format(config.dayjsFormatDateOnly);
    let crawlTime = dayjs(todayDatePart + ' ' + ticketTypeData.crawlTime);
    if (today.isAfter(crawlTime)) {
        let tomorrow = today.add(1, 'day');
        let tomorrowDatePart = tomorrow.format(config.dayjsFormatDateOnly);
        crawlTime = dayjs(tomorrowDatePart + ' ' + ticketTypeData.crawlTime);
    }
    return new Date(crawlTime.format(config.dayjsFormatFull));
};

async function crawlATicketType(crawlData, ticketTypeData) {
    common.consoleLog('Begin to crawl ' + ticketTypeData.name +
        ' (' + ticketTypeData.publisherName + ')',
        config.consoleColor);
    let rssProviderId = ticketTypeData.rssProvider;
    let publisherId = Object.keys(ticketTypeData.publisher);
    for (let i = 0; i < publisherId.length; i++) {
        let aPublisherId = publisherId[i];
        let aPublisher = ticketTypeData.publisher[aPublisherId];
        preparePublisherAndProviderData(aPublisher, rssProviderId);
        await crawlAPublisher(crawlData, ticketTypeData, aPublisher);
    }
};

function preparePublisherAndProviderData(publisher, rssProviderId) {
    publisher.providerCrawlData = {};
    for (let i = 0; i < rssProviderId.length; i++) {
        let aRssProviderId = rssProviderId[i];
        let providerData = rssProvider.provider[aRssProviderId];
        if (providerData == null) {
            continue;
        }
        let keyURL = publisher.rssURLKey[aRssProviderId];
        let baseURL = providerData.baseURLFunction();
        let url = baseURL.replace(rssProvider.RSSIDKEYSTRING, keyURL);
        publisher.providerCrawlData[aRssProviderId] = {
            crawlTime: 0,
            url,
        };
    }
};

function scheduleToCrawlATicketType(crawlData, ticketTypeData, scheduleTime) {
    common.consoleLog('Scheduled to crawl ' + ticketTypeData.name +
        ' (' + ticketTypeData.publisherName + ')' + ' at ' +
        dayjs(scheduleTime).format(config.dayjsFormatFull), config.consoleColor);
    schedule.scheduleJob(scheduleTime, function () {
        crawlATicketType(crawlData, ticketTypeData);
    });
};

async function crawlAPublisher(crawlData, ticketTypeData, publisher) {
    let rssProviderId = Object.keys(publisher.providerCrawlData);
    for (let i = 0; i < rssProviderId.length; i++) {
        let aRssProviderId = rssProviderId[i];
        let result = await crawlAProvider(ticketTypeData, publisher, aRssProviderId);
        if (result === false) {

            continue;
        }
        publisher.crawlStatus = SUCCESS;
    }
};

async function crawlAProvider(ticketTypeData, publisher, rssProviderId) {
    let providerData = rssProvider.provider[rssProviderId];
    let providerCrawlData = publisher.providerCrawlData[rssProviderId];
    let startTime = common.getCurrentTime();
    common.consoleLog('Retrieve rss for ' + publisher.name + ', ' +
        providerData.name, providerData.consoleColor, startTime);
    let feed = await parser.parseURL(providerCrawlData.url);
    let feededTime = common.getCurrentTime();
    let feedPubDayString = providerData.parsePubDayFunction(feed);
    let feedPubDay = dayjs(feedPubDayString);
    if (!feedPubDay.isValid()) {
        common.errorLog('Error while parsing ' + publisher.name + ', ' + providerData.name + '.' +
            'Invalid feed published date (' + feedPubDayString + ')', providerData.consoleColor);
        return false;
    }
    if (!feedPubDay.isToday()) {
        common.consoleLog('No new data for ' + publisher.name + ', ' + providerData.name +
            '. Last publish date is ' + feedPubDay.format(config.dayjsFormatFull),
            providerData.consoleColor, feededTime);
        return false;
    }
    common.consoleLog('New data found for ' + publisher.name + ', ' + providerData.name + '.' +
        'Begin to parse feed data..',
        providerData.consoleColor + '\x1b[4m', feededTime);
    let parseData = providerData.parseFunction(feed);
    let result = ticketTypeData.createResultData(parseData);
    if (result == null) {
        return false;
    }
    // write to db
    return result;
};




function parseAllRssDomain() {
    let allDataArray = [];
    let rssToBeParsed = findRssToParse();
    let domainIds = Object.keys(rssDomainData);
    for (let i = 0; i < domainIds.length; i++) {
        let domainId = domainIds[i];
        let aDomainData = rssDomainData[domainId];
        parseRSSFromDomain(allDataArray, rssToBeParsed, aDomainData, domainId);
    };
};

function parseRSSFromDomain(allDataArray, rssToBeParsed, domainData, domainId) {
    let domain = domainData.name;
    let consoleColor = domainData.consoleColor || '';
    let rssDataArray = createRssDataArray(rssToBeParsed, domainId);
    allDataArray.push(rssDataArray);
    parseRSS(allDataArray, rssDataArray,
        domainData.parseFunction, domain, consoleColor);
};

async function parseRSS(allDataArray, dataArray,
    parseFunction, rssDomain, domainColor) {
    let dataFound = 0;
    for (let i = 0; i < dataArray.length; i++) {
        let aDataObject = dataArray[i];
        if (aDataObject.data == true) {
            continue;
        }
        let rssName = aDataObject.name;
        let startTime = getCurrentTime();
        common.consoleLog('Retrieve rss for ' + rssName + ', ' + rssDomain, domainColor, startTime);
        let feed = await parser.parseURL(aDataObject.url);
        let feededTime = getCurrentTime();
        let parseResult = parseFunction(feed);
        if (parseResult == null) {
            common.errorLog('Error while parsing ' + rssName + ', ' + rssDomain, domainColor);
            return;
        }

        if (!parseResult.feedPubDay.isToday()) {
            common.consoleLog('No new data for ' + rssName + ', ' + rssDomain + '. Last publish date is ' +
                parseResult.feedPubDay.format(dateFormat), domainColor, feededTime);
            continue;
        }
        common.consoleLog('New data found for ' + rssName + ', ' + rssDomain, domainColor + '\x1b[4m', feededTime);
        aDataObject.data = true;
        dataFound = dataFound + 1;
        mailer.sendRssParsedEmail(transporter, rssDomain, rssName, startTime, feededTime, domainColor);
    }
    if (dataFound == dataArray.length) {
        checkForCompletion(allDataArray);
        return;
    }
    await sleep(60 * 1000);
    parseRSS(allDataArray, dataArray, parseFunction, rssDomain, domainColor);
};

function checkForCompletion(allDataArray) {
    for (let i = 0; i < allDataArray.length; i++) {
        let aDataArray = allDataArray[i];
        for (let j = 0; j < aDataArray.length; j++) {
            if (aDataArray[j].data != true) {
                return;
            }
        }
    }
    common.consoleLog('FINISH PARSING', config.consoleColor);
};

function createRssDataArray(rssToBeParsed, domainId) {
    let baseURL = rssDomainData[domainId].baseURLFunction();
    let result = [];
    for (let i = 0; i < rssToBeParsed.length; i++) {
        let aRssData = rssToBeParsed[i];
        let rssDomainId = aRssData.rssId[domainId];
        if (rssDomainId == null) {
            continue;
        }
        let url = baseURL.replace(RSSIDKEYSTRING, rssDomainId);
        let aResultObject = {
            data: false,
            name: aRssData.name,
            url,
        };
        result.push(aResultObject);
    }
    return result;
};

function cancelSchedule() {
    let scheduleIds = Object.keys(crawlSchedule);
    for (let i = 0; i < scheduleIds.length; i++) {
        let aScheduleId = scheduleIds[i];
        let aSchedule = crawlSchedule[aScheduleId];
        if (aSchedule == null) {
            continue;
        }
        // common.consoleLog('Cancelled ' + crawlSchedule, length + ' crawl schedule(s)', config.consoleColor);
        aSchedule.cancel();
    }
};
//#endregion

/*


*/