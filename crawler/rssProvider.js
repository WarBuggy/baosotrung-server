const dayjs = require('dayjs');

module.exports = {
    rssProvider: {
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
    },
};

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
