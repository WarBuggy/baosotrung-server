const RSSIDKEYSTRING = '|||RssKeyId|||';

module.exports = {
    provider: {
        1: {
            name: 'xosodaiphat.com',
            parsePubDayFunction: parsePubDayDPFeed,
            baseURLFunction: createDPBaseURL,
            parseFunction: parseDPFeed,
            consoleColor: '\x1b[43m',
            specificDateURLFunction: createDPSpecificDateURL,
            parseSpecificFunction: parseDPSpecificHTML,
        },
        2: {
            name: 'xskt.com.vn',
            parsePubDayFunction: parsePubDayXSKTFeed,
            baseURLFunction: createXSKTBaseURL,
            parseFunction: parseXSKTFeed,
            consoleColor: '\x1b[44m',
        },
        3: {
            name: 'kqxs.me',
            parsePubDayFunction: parsePubDayKQXSMeFeed,
            baseURLFunction: createKQXSMeBaseURL,
            parseFunction: parseKQXSMeFeed,
            consoleColor: '\x1b[42m',
        },
    },
    RSSIDKEYSTRING: RSSIDKEYSTRING,
};

//#region RSS Dai Phat
function parsePubDayDPFeed(feed) {
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
    return pubDateString;
};

function createDPBaseURL() {
    return 'https://xosodaiphat.com/' + RSSIDKEYSTRING + '.rss';
};

function createDPSpecificDateURL(rssURLKey, vnDateString) {
    let parts = rssURLKey.split('-');
    let publisherShortName = parts.pop();
    return 'https://xosodaiphat.com/xs' + publisherShortName + '-' + vnDateString + '.html';
};

function parseDPSpecificHTML(htmlString) {
    let array2Digit = findStringInHtml(htmlString,
        /<tr>\s*<td>G\.8<\/td>\s*<td class="text-center"><span class="special-prize-lg">\d{2}<\/span><\/td>\s*<\/tr>/,
        /\d{2}/g
    );
    let array3Digit = findStringInHtml(htmlString,
        /<tr>\s*<td>G\.7<\/td>\s*<td class="text-center"><span class="number-black-bold">\d{3}<\/span><\/td>\s*<\/tr>/,
        /\d{3}/g
    );
    let array4Digit = findStringInHtml(htmlString,
        /<tr>\s*<td>G\.6<\/td>\s*<td>\s*(<span class="col-xs-4 number-black-bold">\d{4}<\/span>\s*){3}<\/td>\s*<\/tr>\s*<tr>\s*<td>G\.5<\/td>\s*<td class="text-center"><span class="number-black-bold">\d{4}<\/span><\/td>\s*<\/tr>/,
        /\d{4}/g
    );
    let array5Digit = findStringInHtml(htmlString,
        /<tr>\s*<td>G\.4<\/td>\s*<td>\s*(<span class="col-sm-3 col-xs-6 number-black-bold">\d{5}<\/span>\s*){4}(<span class="col-sm-4 col-xs-4 number-black-bold">\d{5}<\/span>\s*){3}<\/td>\s*<\/tr>\s*<tr>\s*<td>G\.3<\/td>\s*<td>\s*(<span class="col-xs-6 number-black-bold">\d{5}<\/span>\s*){2}<\/td>\s*<\/tr>\s*<tr>\s*<td>G\.2<\/td>\s*<td class="text-center"><span class="number-black-bold">\d{5}<\/span><\/td>\s*<\/tr>\s*<tr>\s*<td>G\.1<\/td>\s*<td class="text-center"><span class="number-black-bold">\d{5}<\/span><\/td>\s*<\/tr>/,
        /\d{5}/g
    );
    let array6Digit = findStringInHtml(htmlString,
        /<tr>\s*<td>G\.ĐB<\/td>\s*<td class="text-center"><span class="special-prize-lg">\d{6}<\/span><\/td>\s*<\/tr>/,
        /\d{6}/g
    );
    let result = createResultObject(
        array2Digit, array3Digit, array4Digit, array5Digit, array6Digit);
    return result;
};

function parseDPFeed(feed) {
    // 'G.8: 49 G.7: 202 G.6: 7274 - 9067 - 7310 G.5: 8911 G.4: 17641 - 73114 - 37211 - 41186 - 17548 - 73482 - 36011 G.3: 28250 - 86264 G.2: 93284 G.1: 26905 DB6: 308101'
    let callResult = feed.items[0].contentSnippet || '';
    let array2Digit = callResult.match(/\s\d{2}\s/g);
    let array3Digit = callResult.match(/\s\d{3}\s/g);
    let array4Digit = callResult.match(/\s\d{4}\s/g);
    let array5Digit = callResult.match(/\s\d{5}\s/g);
    let array6Digit = callResult.match(/\s\d{6}/g);
    let result = createResultObject(
        array2Digit, array3Digit, array4Digit, array5Digit, array6Digit);
    return result;
};
//#endregion

//#region RSS xskt.com.vn
function parsePubDayXSKTFeed(feed) {
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
    return pubDateString;
};

function createXSKTBaseURL() {
    return 'https://xskt.com.vn/rss-feed/' + RSSIDKEYSTRING + '.rss';
};

function parseXSKTFeed(feed) {
    // ĐB: 308101 1: 26905 2: 93284 3: 28250 - 86264 4: 17641 - 73114 - 37211 - 41186 - 17548 - 73482 - 36011 5: 8911 6: 7274 - 9067 - 7310 7: 2028: 49
    let callResult = feed.items[0].contentSnippet || '';
    let array4Digit = callResult.match(/\s\d{4}\s/g).reverse();
    let array5Digit = callResult.match(/\s\d{5}\s/g).reverse();
    let array6Digit = callResult.match(/\s\d{6}/g);
    let string3Digit = callResult.match(/7:\s\d{3}8:/g)[0];
    let array3Digit = string3Digit.match(/\d{3}/g);
    let string2Digit = callResult.match(/8:\s\d{2}/g)[0];
    let part2Digit = string2Digit.split(' ');
    let array2Digit = [part2Digit[1]];
    let result = createResultObject(
        array2Digit, array3Digit, array4Digit, array5Digit, array6Digit);
    return result;
};
//#endregion 

//#region RSS kqxs.me
function parsePubDayKQXSMeFeed(feed) {
    let lastPubLink = feed.items[0].link || '';
    let parts = lastPubLink.split('-');
    if (parts.length != 5) {
        return null;
    }
    let pubDateString = parts[4] + '-' + parts[3] + '-' + parts[2];
    return pubDateString;
};

function createKQXSMeBaseURL() {
    return 'https://kqxs.me/rssfeed/' + RSSIDKEYSTRING + '.rss';
};

function parseKQXSMeFeed(feed) {
    // same RSS format as xskt.com.vn
    return parseXSKTFeed(feed);
}
//#endregion

function createResultObject(array2Digit, array3Digit,
    array4Digit, array5Digit, array6Digit) {
    return {
        2: array2Digit,
        3: array3Digit,
        4: array4Digit,
        5: array5Digit,
        6: array6Digit,
    };
};

function findStringInHtml(htmlString, stringExpression, digit) {
    let result = [];
    let subString = htmlString.match(stringExpression);
    if (subString.length >= 1) {
        result = subString[0].match(digit);
    }
    return result;
};
