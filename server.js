const nodemailer = require('nodemailer');
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
const rssDomainData = {
    1: {
        name: 'xosodaiphat.com',
        parseFunction: parseDPFeed,
        baseURLFunction: createDPBaseURL,
        consoleColor: '\x1b[43m',
    },
    2: {
        name: 'xskt.com.vn',
        parseFunction: parseXSKTFeed,
        baseURLFunction: createXSKTBaseURL,
        consoleColor: '\x1b[44m',
    },
    3: {
        name: 'kqxs.me',
        parseFunction: parseKQXSMeFeed,
        baseURLFunction: createKQXSMeBaseURL,
        consoleColor: '\x1b[42m',
    },
};

const rssData = {
    1: {
        name: 'TPHCM',
        rssId: {
            1: 'tp.hcm-hcm',
            2: 'tp-hcm-xshcm',
            3: 'xsHCM',
        },
        callDay: [1, 6],
    },
    2: {
        name: 'Đồng Tháp',
        rssId: {
            1: 'dong-thap-dt',
            2: 'dong-thap-xsdt',
            3: 'xsDT',
        },
        callDay: [1],
    },
    3: {
        name: 'Cà Mau',
        rssId: {
            1: 'ca-mau-cm',
            2: 'ca-mau-xscm',
            3: 'xsCM',
        },
        callDay: [1],
    },
    4: {
        name: 'Bến Tre',
        rssId: {
            1: 'ben-tre-btr',
            2: 'ben-tre-xsbt',
            3: 'xsBT',
        },
        callDay: [2],
    },
    5: {
        name: 'Vũng Tàu',
        rssId: {
            1: 'vung-tau-vt',
            2: 'vung-tau-xsvt',
            3: 'xsVT',
        },
        callDay: [2],
    },
    6: {
        name: 'Bạc Liêu',
        rssId: {
            1: 'bac-lieu-bl',
            2: 'bac-lieu-xsbl',
            3: 'xsBL',
        },
        callDay: [2],
    },
    7: {
        name: 'Đồng Nai',
        rssId: {
            1: 'dong-nai-dn',
            2: 'dong-nai-xsdn',
            3: 'xsDN',
        },
        callDay: [3],
    },
    8: {
        name: 'Cần Thơ',
        rssId: {
            1: 'can-tho-ct',
            2: 'can-tho-xsct',
            3: 'xsCT',
        },
        callDay: [3],
    },
    9: {
        name: 'Sóc Trăng',
        rssId: {
            1: 'soc-trang-st',
            2: 'soc-trang-xsst',
            3: 'xsST',
        },
        callDay: [3],
    },
    10: {
        name: 'Tây Ninh',
        rssId: {
            1: 'tay-ninh-tn',
            2: 'tay-ninh-xstn',
            3: 'xsTN',
        },
        callDay: [4],
    },
    11: {
        name: 'An Giang',
        rssId: {
            1: 'an-giang-ag',
            2: 'an-giang-xsag',
            3: 'xsAG',
        },
        callDay: [4],
    },
    12: {
        name: 'Bình Thuận',
        rssId: {
            1: 'binh-thuan-bth',
            2: 'binh-thuan-xsbth',
            3: 'xsBTH',
        },
        callDay: [4],
    },
    13: {
        name: 'Vĩnh Long',
        rssId: {
            1: 'vinh-long-vl',
            2: 'vinh-long-xsvl',
            3: 'xsVL',
        },
        callDay: [5],
    },
    14: {
        name: 'Bình Dương',
        rssId: {
            1: 'binh-duong-bd',
            2: 'binh-duong-xsbd',
            3: 'xsBD',
        },
        callDay: [5],
    },
    15: {
        name: 'Trà Vinh',
        rssId: {
            1: 'tra-vinh-tv',
            2: 'tra-vinh-xstv',
            3: 'xsTV',
        },
        callDay: [5],
    },
    16: {
        name: 'Long An',
        rssId: {
            1: 'long-an-la',
            2: 'long-an-xsla',
            3: 'xsLA',
        },
        callDay: [6],
    },
    17: {
        name: 'Bình Phước',
        rssId: {
            1: 'binh-phuoc-bp',
            2: 'binh-phuoc-xsbp',
            3: 'xsBP',
        },
        callDay: [6],
    },
    18: {
        name: 'Hậu Giang',
        rssId: {
            1: 'hau-giang-hg',
            2: 'hau-giang-xshg',
            3: 'xsHG',
        },
        callDay: [6],
    },
    19: {
        name: 'Tiền Giang',
        rssId: {
            1: 'tien-giang-tg',
            2: 'tien-giang-xstg',
            3: 'xsTG',
        },
        callDay: [0],
    },
    20: {
        name: 'Kiên Giang',
        rssId: {
            1: 'kien-giang-kg',
            2: 'kien-giang-xskg',
            3: 'xsKG',
        },
        callDay: [0],
    },
    21: {
        name: 'Lâm Đồng',
        rssId: {
            1: 'da-lat-dl',
            2: 'lam-dong-xsld',
            3: 'xsLD',
        },
        callDay: [0],
    },
};

const emailData = {
    username: 'pxdctest1@gmail.com',
    password: 'kryzjbenzlnblktv',
    sender: 'pxdctest1',
    sendFrom: 'pxdctest1@gmail.com',

};
//#endregion

const transporter = createEmailTransporter();
const parser = new RssParser();

if (scheduleTime.schedule === false) {
    parseAllRssDomain();
    return;
}

consoleLog('Scheduled to parse at ' +
    scheduleTime.hour + ':' + scheduleTime.minute + ' daily', systemConsoleColor);
const rule = new schedule.RecurrenceRule();
rule.hour = [scheduleTime.hour];
rule.minute = [scheduleTime.minute];
schedule.scheduleJob(rule, function () {
    parseAllRssDomain();
});

//#region RSS Dai Phat
function parseDPFeed(feed) {
    let lastPubLink = feed.items[0].link || '';
    let datePart = lastPubLink.match(/\d+-\d+-\d+/g);
    if (datePart.length != 1) {
        return null;
    }
    let parts = datePart[0].split('-');
    if (parts.length != 3) {
        return null;
    }
    let pubDateString = parts[2] + '-' + parts[1] + '-' + parts[0];
    let result = {
        feedPubDay: dayjs(pubDateString),
    };
    return result;
};

function createDPBaseURL() {
    return 'https://xosodaiphat.com/' + RSSIDKEYSTRING + '.rss';
};
//#endregion

//#region RSS xskt.com.vn
function parseXSKTFeed(feed) {
    let lastPubLink = feed.items[0].link || '';
    let datePart = lastPubLink.match(/ngay-\d+-\d+-\d+/g);
    if (datePart.length != 1) {
        return null;
    }
    let parts = datePart[0].split('-');
    if (parts.length != 4) {
        return null;
    }
    let pubDateString = parts[3] + '-' + parts[2] + '-' + parts[1];
    let result = {
        feedPubDay: dayjs(pubDateString),
    };
    return result;
};

function createXSKTBaseURL() {
    return 'https://xskt.com.vn/rss-feed/' + RSSIDKEYSTRING + '.rss';
};
//#endregion 

//#region RSS kqxs.me
function parseKQXSMeFeed(feed) {
    let lastPubLink = feed.items[0].link || '';
    let parts = lastPubLink.split('-');
    if (parts.length != 5) {
        return null;
    }
    let pubDateString = parts[4] + '-' + parts[3] + '-' + parts[2];
    let result = {
        feedPubDay: dayjs(pubDateString),
    };
    return result;
};

function createKQXSMeBaseURL() {
    return 'https://kqxs.me/rssfeed/' + RSSIDKEYSTRING + '.rss';
};
//#endregion 

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

function getCurrentTime() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
};

function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, ms)
    });
};

function createEmailTransporter() {
    let transporterInfo = {
        service: 'gmail',
        auth: {
            user: emailData.username,
            pass: emailData.password,
        },
    };
    let transporter = nodemailer.createTransport(transporterInfo);
    return transporter;
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

function consoleLog(string, consoleColor, time) {
    if (time == null) {
        time = getCurrentTime();
    }
    console.log(consoleColor + '%s\x1b[0m', time + ': ' + string + '.');
};

function errorLog(string, consoleColor, time) {
    if (time == null) {
        time = getCurrentTime();
    }
    console.log(consoleColor + '\x1b[31m%s\x1b[0m', time + ': ' + string + '.');
};
//#endregion