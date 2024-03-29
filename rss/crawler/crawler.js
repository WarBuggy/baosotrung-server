const ticketCoreData = require('../../core/ticket.js');
const rssProvider = require('./provider.js');
const crawlerConfig = require('./config.js');
const systemConfig = require('../../systemConfig.js');
const common = require('../../common/common.js');
const db = require('../../db/db.js');
const mailer = require('../../mailer/mailer.js');
const series = require('../../core/series.js');

const Https = require('https');
const RssParser = require('rss-parser');
const schedule = require('node-schedule');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
const isToday = require('dayjs/plugin/isToday');
dayjs.extend(dayjsCustomParseFormat);
dayjs.extend(isToday);

const parser = new RssParser();

module.exports = {
    start: function () {
        if (crawlerConfig.setupCrawlSchedule.instant === true) {
            setupCrawlSchedule();
            return;
        }
        let hour = crawlerConfig.setupCrawlSchedule.hour;
        let minute = crawlerConfig.setupCrawlSchedule.minute;
        common.consoleLog('Crawl schedule will be setup daily at ' + hour + ':' + minute + '.');
        let cronTime = minute + ' ' + hour + ' * * *';
        schedule.scheduleJob(cronTime, function () {
            setupCrawlSchedule();
        });
    },

    crawlSpecificDate: async function (dateString, delayTime) {
        try {
            let date = dayjs(dateString);
            if (!date.isValid()) {
                common.consoleLog('Crawl a specific date received invalid date string (' + dateString + ').');
                return;
            }
            let formatDateString = date.format(systemConfig.dayjsFormatDateOnly);
            common.consoleLog('Begin to crawl result of ' + formatDateString + '.');
            let crawlObject = createSpecificCrawlDataObject(date);
            addSpecificCrawPublisher(crawlObject);
            for (let i = 0; i < crawlObject.typeList.length; i++) {
                let aType = crawlObject.typeList[i];
                let typeObject = crawlObject.ticketType[aType];
                if (typeObject.publisherList.length < 1) {
                    continue;
                }
                await crawlSpecificType(crawlObject, typeObject, delayTime);
            }
            common.consoleLog('Finish crawling result of ' + formatDateString + '.');
        } catch (error) {
            common.consoleLogError('Error when crawling the specific date of ' + formatDateString + '. Error: ' + error);
        }
    },

    crawlSpecificDateFromConfig: async function () {
        for (let i = 0; i < crawlerConfig.crawlSpecificDate.length; i++) {
            let aSpecificDate = crawlerConfig.crawlSpecificDate[i];
            await module.exports.crawlSpecificDate(aSpecificDate, 5000);
        }
    },
};

//#region Function to handle the craw schedule
function createBaseCrawlDataObject(date,
    sendCrawlResultEmail, startCheckingProcess, checkTodayAsCrawlDate) {
    if (date == null) {
        date = dayjs();
    }
    if (sendCrawlResultEmail == null) {
        sendCrawlResultEmail = crawlerConfig.sendCrawlResultEmail;
    }
    if (startCheckingProcess == null) {
        startCheckingProcess = crawlerConfig.startCheckingProcess;
    }
    if (checkTodayAsCrawlDate == null) {
        checkTodayAsCrawlDate = crawlerConfig.checkTodayAsCrawlDate;
    }
    let crawlData = {
        successCrawl: [],
        failCrawl: [],
        typeNum: 0,
        message: [],
        crawlDate: date,
        crawlDateFull: date.format(systemConfig.dayjsFormatFull),
        crawlDatePartial: date.format(systemConfig.dayjsFormatDateOnly),
        sendCrawlResultEmail,
        startCheckingProcess,
        checkTodayAsCrawlDate,
    };
    return crawlData;
};

function setupCrawlSchedule() {
    let crawlData = createBaseCrawlDataObject();
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
        if (crawlerConfig.ticketType[aTypeId].schedule === false) {
            crawlATicketType(crawlData, aTicketTypeData);
            continue;
        }
        let scheduleDate = createScheduleDate(crawlData, aTicketTypeData);
        scheduleToCrawlATicketType(crawlData, aTicketTypeData, scheduleDate);
    }
};

function addTicketData(crawlData) {
    crawlData.ticketType = {};
    let ticketTypeIds = Object.keys(ticketCoreData.type);
    for (let i = 0; i < ticketTypeIds.length; i++) {
        let typeId = ticketTypeIds[i];
        let aType = ticketCoreData.type[typeId];
        if (aType.crawlRss == true) {
            let aTicketType = common.cloneObject(aType);
            aTicketType.id = typeId;
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
    let weekday = crawlData.crawlDate.day();
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
                publisherNameArray.push(aClonePublisher.name);
                aTicketType.publisherNum++;
            }
        }
        aTicketType.publisherName = publisherNameArray.join(', ');
    }
};

function createScheduleDate(crawlData, ticketTypeData) {
    let today = crawlData.crawlDate;
    let crawlTime = dayjs(crawlData.crawlDatePartial + ' ' + ticketTypeData.crawlTime);
    if (today.isAfter(crawlTime)) {
        let tomorrow = today.add(1, 'day');
        let tomorrowDatePart = tomorrow.format(systemConfig.dayjsFormatDateOnly);
        crawlTime = dayjs(tomorrowDatePart + ' ' + ticketTypeData.crawlTime);
    }
    return new Date(crawlTime.format(systemConfig.dayjsFormatFull));
};

function scheduleToCrawlATicketType(crawlData, ticketTypeData, scheduleTime) {
    common.consoleLog('Scheduled to crawl ' + ticketTypeData.name +
        ' (' + ticketTypeData.publisherName + ')' + ' at ' +
        dayjs(scheduleTime).format(systemConfig.dayjsFormatFull) + '.');
    schedule.scheduleJob(scheduleTime, function () {
        crawlATicketType(crawlData, ticketTypeData);
    });
};
//#endregion

//#region Functions to handle the actual crawling
async function crawlATicketType(crawlData, ticketTypeData) {
    let message = 'Begin to crawl ' + ticketTypeData.name +
        ' (' + ticketTypeData.publisherName + ').';
    common.consoleLog(message);
    addToEmailMessage(crawlData, message);
    let rssProviderId = ticketTypeData.rssProvider;
    let publisherId = Object.keys(ticketTypeData.publisher);
    for (let i = 0; i < publisherId.length; i++) {
        let aPublisherId = publisherId[i];
        let aPublisher = ticketTypeData.publisher[aPublisherId];
        preparePublisherAndProviderData(aPublisher, aPublisherId, rssProviderId);
        crawlAPublisher(crawlData, ticketTypeData, aPublisher);
    }
};

function preparePublisherAndProviderData(publisher, publisherId, rssProviderId) {
    publisher.crawlTime = 0;
    publisher.id = publisherId;
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
    }
};

async function crawlAPublisher(crawlData, ticketTypeData, publisher) {
    common.consoleLog('Crawling for ' +
        publisher.name + ' (cycle: ' + (publisher.crawlTime + 1) + ').');
    let rssProviderId = Object.keys(publisher.providerCrawlData);
    for (let i = 0; i < rssProviderId.length; i++) {
        let aRssProviderId = rssProviderId[i];
        let result = await crawlAProvider(ticketTypeData, publisher, aRssProviderId,
            crawlData.checkTodayAsCrawlDate);
        if (result === false) {
            continue;
        }
        ticketTypeData.successCrawl.push(publisher);
        checkCrawlingCompletion(crawlData, ticketTypeData);
        return;
    }
    publisher.crawlTime++;
    if (publisher.crawlTime < crawlerConfig.crawlTimeEachRssProvider) {
        await common.sleep(crawlerConfig.crawlInterval);
        crawlAPublisher(crawlData, ticketTypeData, publisher);
        return;
    }
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
    let string = 'ALL CRAWLING FINISHED. Success: ' + successNum + '. Fail: ' + failNum + '.';
    if (failNum > 0) {
        let failType = [];
        for (let i = 0; i < crawlData.failCrawl.length; i++) {
            failType.push(crawlData.failCrawl[i].name);
        }
        string = string + ' (' + failType.join(', ') + ')';
    }
    common.consoleLog(string);
    addToEmailMessage(crawlData, string);
    sendCrawlResultEmail(crawlData);
};

function checkPublisherCrawlingCompletion(crawlData, ticketTypeData) {
    let successNum = ticketTypeData.successCrawl.length;
    let failNum = ticketTypeData.failCrawl.length;
    if (successNum + failNum != ticketTypeData.publisherNum) {
        return;
    }
    if (crawlData.startCheckingProcess == true) {
        series.startCheckingProcess(ticketTypeData, crawlData.crawlDatePartial);
    }
    let string = 'Finish crawling for ' + ticketTypeData.name +
        '. Success: ' + successNum + '. Fail: ' + failNum + '.';
    if (failNum > 0) {
        let failType = [];
        for (let i = 0; i < ticketTypeData.failCrawl.length; i++) {
            failType.push(ticketTypeData.failCrawl[i].name);
        }
        string = string + ' (' + failType.join(', ') + ')';
    }
    common.consoleLog(string);
    addToEmailMessage(crawlData, string);
    if (successNum > 0) {
        crawlData.successCrawl.push(ticketTypeData);
    } else {
        crawlData.failCrawl.push(ticketTypeData);
        let criticalEmailMessage =
            'CRITICAL ERROR: All crawling fails for ' + ticketTypeData.name + ' ('
            + ticketTypeData.publisherName + ').';
        common.consoleLogError(criticalEmailMessage);
        mailer.sendMail(common.getCurrentTime() + ': ' + criticalEmailMessage,
            false, null,
            crawlData.crawlDatePartial + ' Báo Trúng Số Critical Crawl Error', 'crawling critical error');
    }
};

async function crawlAProvider(ticketTypeData, publisher, rssProviderId, checkTodayAsCrawlDate) {
    let providerData = rssProvider.provider[rssProviderId];
    let providerCrawlData = publisher.providerCrawlData[rssProviderId];
    let startTime = common.getCurrentTime();
    common.consoleLog('Retrieve RSS for ' + publisher.name + ', ' +
        providerData.name + '...', providerData.consoleColor, startTime);
    let feed = await parser.parseURL(providerCrawlData.url);
    let feededTime = common.getCurrentTime();
    let feedPubDayString = providerData.parsePubDayFunction(feed);
    let feedPubDay = dayjs(feedPubDayString);
    if (!feedPubDay.isValid()) {
        common.consoleLogError('Error while parsing ' + publisher.name + ', ' + providerData.name + '.' +
            'Invalid feed published date (' + feedPubDayString + ').', providerData.consoleColor);
        return false;
    }
    if (checkTodayAsCrawlDate == true) {
        if (!feedPubDay.isToday()) {
            common.consoleLog('No new data for ' + publisher.name + ', ' + providerData.name +
                '. Last publish date is ' + feedPubDay.format(systemConfig.dayjsFormatFull) + '.',
                providerData.consoleColor, feededTime);
            return false;
        }
    }
    common.consoleLog('New data found for ' + publisher.name + ', ' + providerData.name + '.' +
        'Begin to parse feed data...',
        providerData.consoleColor + '\x1b[4m', feededTime);
    let parseData = providerData.parseFunction(feed);
    let result = ticketTypeData.createResultData(parseData, publisher, providerData);
    if (result == null) {
        return false;
    }
    let writeResult = await writeResultToDB(result, publisher.type, ticketTypeData.defaultPrize,
        publisher.id, rssProviderId, feedPubDay);
    if (writeResult == false) {
        return false;
    }
    return result;
};
//#endregion

//#region Functions to handle the task of emailing the crawl result summary
function addToEmailMessage(crawlData, string) {
    crawlData.message.push(common.getCurrentTime() + ': ' + string + '.');
};

function sendCrawlResultEmail(crawlData) {
    if (crawlData.sendCrawlResultEmail == false) {
        return;
    }
    let message = crawlData.message.join('\n');
    mailer.sendMail(message, false, null,
        crawlData.crawlDatePartial + ' Báo Trúng Số Crawl Result', 'crawl result');
};
//#endregion

//#region Functions to handle database tasks 
async function findPublisherResult(ticketType, publisherId, date) {
    let params = [
        'localhost',
        ticketType,
        publisherId,
        date,
    ];
    let logInfo = {
        username: '',
        source: '`baosotrung_data`.`SP_FIND_PUBLISHER_RESULT`',
        userIP: 'locahost',
    };
    let publisherResult = await db.query(params, logInfo);
    if (publisherResult.resultCode != 0) {
        return null;
    }
    let record = publisherResult.sqlResults[1][0];
    if (record == null) {
        return null;
    }
    return record.id;
};

function createInsertResultDetailQuery(result) {
    let insertQuery = 'INSERT INTO `baosotrung_data`.`result_detail` ' +
        '(`prize`, `series`, `result`) VALUES ';
    let prizeId = Object.keys(result);
    let queryParts = [];
    for (let i = 0; i < prizeId.length; i++) {
        let aPrizeId = prizeId[i];
        let series = result[aPrizeId];
        for (let j = 0; j < series.length; j++) {
            let aSeries = series[j];
            let aQueryPart = '(' + aPrizeId + ',"' + aSeries + '",<resultId>)';
            queryParts.push(aQueryPart);
        }
    }
    insertQuery = insertQuery + queryParts.join(',');
    return insertQuery;
};

async function writeResultToDB(result, ticketType, prizeFormat,
    publisherId, rssProviderId, feedPubDay) {
    let date = feedPubDay.format(systemConfig.dayjsFormatDateOnly);
    let resultId = await findPublisherResult(ticketType, publisherId, date);
    let insertQuery = createInsertResultDetailQuery(result);
    let params = [
        'localhost',
        date,
        publisherId,
        rssProviderId,
        ticketType,
        prizeFormat,
        resultId,
        insertQuery,
    ];
    let logInfo = {
        username: '',
        source: '`baosotrung_data`.`SP_WRITE_PUBLISHER_RESULT`',
        userIP: 'locahost',
    };
    let writeResult = await db.query(params, logInfo);
    if (writeResult.resultCode != 0) {
        return false;
    }
    return true;
};
//#endregion

//#region Function to crawl a specific date

function createSpecificCrawlDataObject(date) {
    let result = {
        date,
        vnDateString: date.format(systemConfig.dayjsVNFormatDateOnly),
        dayOfWeek: date.day(),
        typeList: Object.keys(ticketCoreData.type),
        ticketType: {},
    };
    for (let i = 0; i < result.typeList.length; i++) {
        let aType = result.typeList[i];
        result.ticketType[aType] = {
            base: ticketCoreData.type[aType],
            publisherList: [],
            id: aType,
        };
    }
    return result;
};

function addSpecificCrawPublisher(crawlObject) {
    let publisherList = Object.keys(ticketCoreData.publisher);
    for (let i = 0; i < publisherList.length; i++) {
        let aPublisherId = publisherList[i];
        let aPublisher = ticketCoreData.publisher[aPublisherId];
        let publisherType = aPublisher.type;
        if (!aPublisher.callDay.includes(crawlObject.dayOfWeek)) {
            continue;
        }
        if (!crawlObject.typeList.includes(String(publisherType))) {
            continue;
        }
        let publisherObject = {
            id: aPublisherId,
            base: aPublisher,
        }
        crawlObject.ticketType[publisherType].publisherList.push(publisherObject);
    }
};

async function crawlSpecificType(crawlObject, typeObject, delayTime) {
    delayTime = Math.max(delayTime, 300);
    try {
        for (let i = 0; i < typeObject.publisherList.length; i++) {
            let aPublisherObject = typeObject.publisherList[i];
            let singleCrawlRssProviderId = typeObject.base.singleCrawl.rssProvider;
            let rssProviderObject = rssProvider.provider[singleCrawlRssProviderId];
            let rssURLKey = aPublisherObject.base.rssURLKey[singleCrawlRssProviderId];
            aPublisherObject.url =
                rssProviderObject.specificDateURLFunction(rssURLKey, crawlObject.vnDateString);
            await crawlSpecificPublisher(typeObject, aPublisherObject,
                rssProviderObject, singleCrawlRssProviderId, crawlObject.date);
            await common.sleep(delayTime);
        }
    } catch (error) {
        common.consoleLogError('Error when crawling a specific type (' +
            typeObject.base.name + '). Error: ' + error);
    }
};

function crawlSpecificPublisher(typeObject, publisherObject,
    rssProviderObject, rssProviderId, date) {
    return new Promise(function (resolve) {
        let targetString = publisherObject.base.name + ', ' + typeObject.base.name;
        common.consoleLog('Begin to crawl ' + targetString + '...');
        Https.get(publisherObject.url, function (response) {
            let data = '';
            response.on('data', function (chunk) {
                data = data + chunk;
            });
            response.on('end', async function () {
                let parseData =
                    rssProviderObject.parseSpecificFunction(data.toString());
                let result =
                    typeObject.base.createResultData(parseData, publisherObject.base, rssProviderObject);
                if (result == null) {
                    common.consoleLogError('Error when creating result data for ' + targetString + '.');
                    resolve();
                    return;
                }
                try {
                    let writeResult =
                        await writeResultToDB(result, publisherObject.base.type, typeObject.base.defaultPrize,
                            publisherObject.id, rssProviderId, date);
                    if (writeResult == false) {
                        common.consoleLogError('Error when writing result to DB for ' + targetString + '.');
                        resolve();
                        return;
                    }
                    common.consoleLog('Finish crawling and writing to DB ' + targetString + '.');
                    resolve();
                    return;
                } catch (error) {
                    common.consoleLogError('Error when writting to result for ' + targetString +
                        '. Error: ' + error);
                    resolve();
                    return;
                }
            });
        }).on('error', (error) => {
            common.consoleLogError('Error when crawling ' + targetString + '. Error: ' + error);
            resolve();
        });
    });
};
//#endregion

