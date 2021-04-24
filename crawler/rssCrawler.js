const RssProvider = require('./rssProvider.js');
const TicketCoreData = require('../data/ticketCoreData.js');
const Common = require('../common/common.js');


const RssParser = require('rss-parser');
const schedule = require('node-schedule');
const scheduleTime = require('./scheduleTime.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
const isToday = require('dayjs/plugin/isToday');
dayjs.extend(dayjsCustomParseFormat);
dayjs.extend(isToday);

const dateFormat = 'YYYY-MM-DD';
const systemConsoleColor = '\x1b[5m\x1b[43m\x1b[31m';
const RSSIDKEYSTRING = '|||RSSID|||';

//#region core data
const emailData = {
    username: 'pxdctest1@gmail.com',
    password: 'kryzjbenzlnblktv',
    sender: 'pxdctest1',
    sendFrom: 'pxdctest1@gmail.com',

};
//#endregion

const transporter = createEmailTransporter();
const parser = new RssParser();
let crawlSchedule = null;

if (scheduleTime.schedule === false) {
    parseAllRssDomain();
    return;
}

consoleLog('Scheduled to parse at ' +
    scheduleTime.hour + ':' + scheduleTime.minute + ' daily', systemConsoleColor);
const rule = new schedule.RecurrenceRule();
rule.hour = [scheduleTime.hour];
rule.minute = [scheduleTime.minute];
crawlSchedule = schedule.scheduleJob(rule, function () {
    cancelSchedule();
    parseAllRssDomain();
});

//#region Common functions
function findRssToParse() {
    let weekday = dayjs().day();
    let rssIds = Object.keys(rssData);
    let result = [];
    let provinces = [];
    for (let i = 0; i < rssIds.length; i++) {
        let anRssId = rssIds[i];
        let aRssData = rssData[anRssId];
        if (aRssData.callDay.includes(weekday)) {
            result.push(aRssData);
            provinces.push(aRssData.name);
        }
    }
    consoleLog('Parsing RSS for ' + provinces.join(', '), systemConsoleColor);
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
        consoleLog('Retrieve rss for ' + rssName + ', ' + rssDomain, domainColor, startTime);
        let feed = await parser.parseURL(aDataObject.url);
        let feededTime = getCurrentTime();
        let parseResult = parseFunction(feed);
        if (parseResult == null) {
            errorLog('Error while parsing ' + rssName + ', ' + rssDomain, domainColor);
            return;
        }

        if (!parseResult.feedPubDay.isToday()) {
            consoleLog('No new data for ' + rssName + ', ' + rssDomain + '. Last publish date is ' +
                parseResult.feedPubDay.format(dateFormat), domainColor, feededTime);
            continue;
        }
        consoleLog('New data found for ' + rssName + ', ' + rssDomain, domainColor + '\x1b[4m', feededTime);
        aDataObject.data = true;
        dataFound = dataFound + 1;
        sendEmail(transporter, rssDomain, rssName, startTime, feededTime, domainColor);
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
    consoleLog('FINISH PARSING', systemConsoleColor);
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

function sendEmail(transporter, domain, rssName, startTime, feededTime, domainColor) {
    let mailInfo = {
        from: emailData.sender + '<' + emailData.sendFrom + '>',
        to: 'hovanbuu@gmail.com',
        subject: 'RSS from ' + domain + ', ' + rssName + ' received',
    };
    mailInfo.text =
        'Domain:' + domain + '\n' +
        'Date: ' + dayjs().format(dateFormat) + '\n' +
        'Start time: ' + startTime + '\n' +
        'Feed time: ' + feededTime;
    consoleLog('Sending email for ' + domain + ', ' + rssName + '..', domainColor);
    transporter.sendMail(mailInfo)
        .then(function () {
            consoleLog('Email sent', domainColor);
        })
        .catch(function (error) {
            let errorMessage = 'Unknown error';
            if (error.errno) {
                errorMessage = error.errno;
            } else if (error.code) {
                errorMessage = error.code;
            } else if (error.message) {
                errorMessage = error.message;
            }
            errorLog('Email could not be sent. Error: ' + errorMessage, domainColor);
        });
};



function cancelSchedule() {
    if (crawlSchedule != null) {
        consoleLog('Crawl schedule is cancelled', systemConsoleColor);
        crawlSchedule.cancel();
    }
};
//#endregion