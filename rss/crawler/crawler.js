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
            successCrawl: [],
            failCrawl: [],
            typeNum: 0,
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
            aTicketType.successCrawl = [];
            aTicketType.failCrawl = [];
            aTicketType.publisherNum = 0;
            crawlData.ticketType[typeId] = aTicketType;
            crawlData.typeNum++;
        };
    }
};

function addPublisherData(crawlData) {
    let weekday = dayjs().day();
    let publisherId = Object.keys(ticketCoreData.publisher);
    let ticketTypeId = Object.keys(crawlData.ticketType);
    for (let i = 0; i < ticketTypeId.length; i++) {
        let typeId = ticketTypeId[i];
        let aTicketType = crawlData.ticketType[typeId];
        let publisherNameArray = [];
        for (let j = 0; j < publisherId.length; j++) {
            let aPublisherId = publisherId[j];
            let aPublisher = ticketCoreData.publisher[aPublisherId];
            if (aPublisher.type == typeId && aPublisher.callDay.includes(weekday)) {
                let aClonePublisher = common.cloneObject(aPublisher);
                aTicketType.publisher[aPublisherId] = aClonePublisher;
                aClonePublisher.crawlStatus = IN_PROGRESS;
                publisherNameArray.push(aClonePublisher.name);
                aTicketType.publisherNum++;
            }
        }
        aTicketType.publisherName = publisherNameArray.join(', ');
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
        crawlAPublisher(crawlData, ticketTypeData, aPublisher);
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
            url,
        };
        publisher.crawlTime = 0;
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
    common.consoleLog('Crawling for ' +
        publisher.name + ' (cycle: ' + (publisher.crawlTime + 1) + ')', config.consoleColor);
    let rssProviderId = Object.keys(publisher.providerCrawlData);
    for (let i = 0; i < rssProviderId.length; i++) {
        let aRssProviderId = rssProviderId[i];
        let result = await crawlAProvider(ticketTypeData, publisher, aRssProviderId);
        if (result === false) {
            continue;
        }
        publisher.crawlStatus = SUCCESS;
    }
    if (publisher.crawlStatus == SUCCESS) {
        ticketTypeData.successCrawl.push(publisher);
        checkCrawlingCompletion(crawlData, ticketTypeData);
        return;
    }
    publisher.crawlTime++;
    if (publisher.crawlTime < config.rssCrawler.crawlTimeEachRssProvider) {
        await common.sleep(config.rssCrawler.crawlInterval);
        crawlAPublisher(crawlData, ticketTypeData, publisher);
        return;
    }
    publisher.crawlStatus == FAIL;
    ticketTypeData.failCrawl.push(publisher);
    checkCrawlingCompletion(crawlData, ticketTypeData);
};

function checkCrawlingCompletion(crawlData, ticketTypeData) {
    checkPublisherCrawlingCompletion(crawlData, ticketTypeData);
    let successNum = crawlData.successCrawl.length;
    let failNum = crawlData.failCrawl.length;
    if (successNum + failNum != crawlData.typeNum) {
        return;
    }
    let string = 'ALL CRAWLING FINISHED. Success: ' + successNum + '. Fail: ' + failNum;
    if (failNum > 0) {
        let failType = [];
        for (let i = 0; i < crawlData.failCrawl.length; i++) {
            failType.push(crawlData.failCrawl[i].name);
        }
        string = string + ' (' + failType.join(', ') + ')';
    }
    common.consoleLog(string, config.consoleColor);
};

function checkPublisherCrawlingCompletion(crawlData, ticketTypeData) {
    let successNum = ticketTypeData.successCrawl.length;
    let failNum = ticketTypeData.failCrawl.length;
    if (successNum + failNum != ticketTypeData.publisherNum) {
        return;
    }
    let string = 'Finish crawling for ' + ticketTypeData.name +
        '. Success: ' + successNum + '. Fail: ' + failNum;
    if (failNum > 0) {
        let failType = [];
        for (let i = 0; i < ticketTypeData.failCrawl.length; i++) {
            failType.push(ticketTypeData.failCrawl[i].name);
        }
        string = string + ' (' + failType.join(', ') + ')';
    }
    common.consoleLog(string, config.consoleColor);
    if (successNum > 0) {
        crawlData.successCrawl.push(ticketTypeData);
    } else {
        crawlData.failCrawl.push(ticketTypeData);
    }

};

async function crawlAProvider(ticketTypeData, publisher, rssProviderId) {
    let providerData = rssProvider.provider[rssProviderId];
    let providerCrawlData = publisher.providerCrawlData[rssProviderId];
    let startTime = common.getCurrentTime();
    common.consoleLog('Retrieve RSS for ' + publisher.name + ', ' +
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
