const db = require('./db/db.js');
const common = require('./common/common.js');
const rssCrawler = require('./rss/crawler/crawler.js');
const series = require('./core/series.js');

const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(dayjsCustomParseFormat);

let today = dayjs();
let todayDayOfWeek = String(today.day());

findDateOf(0, 4, today, todayDayOfWeek);
findDateOf(1, 2, today, todayDayOfWeek);
findDateOf(3, 0, today, todayDayOfWeek);

async function start() {
    let prepareDbConnectionResult = await prepareDbConnection();
    if (prepareDbConnectionResult == false) {
        return;
    }
    // rssCrawler.test();
    // testSeries();
    // testNumberToWordVN();
    await rssCrawler.crawlSpecificDateFromConfig();

    await db.closeConnection();
};

async function prepareDbConnection() {
    common.consoleLog('Begin to establish database connection...');
    let dbConnection = await db.getConnection();
    if (dbConnection == null) {
        common.consoleLogError('Cannot establish database conneciton. Program is now terminated.');
        return false;
    }
    common.consoleLog('Established database connection.');
    return true;
};


function testSeries() {
    let ticketTypeData = {
        id: 1,
        successCrawl: [
            { id: 7, name: 'Đồng Nai', },
            { id: 8, name: 'Cần Thơ', },
            { id: 9, name: 'Sóc Trăng', },
        ],
        checkResultSP: 'SP_FIND_TYPE_1_WINNER',
        prize: 1,
    };
    let crawlDate = '2021-05-05';
    series.startCheckingProcess(ticketTypeData, crawlDate);
};

function testCrawler() {
    let rssProviderId = 3;
    let publisher = {
        type: 1,
        id: 2,
    };
    let ticketTypeData = {
        defaultPrize: 4,
    };
    let feedPubDay = dayjs();
    let result = {
        '0': ['971634'],
        '1': ['79095'],
        '2': ['91077'],
        '3': ['05951', '27173'],
        '4':
            ['18068', '18835', '14969', '30502', '91466', '56585', '19296'],
        '5': ['4272'],
        '6': ['4692', '7245', '9191'],
        '7': ['798'],
        '8': ['32'],
        '10':
            ['071634',
                '171634',
                '271634',
                '371634',
                '471634',
                '571634',
                '671634',
                '771634',
                '871634'],
        '11':
            ['901634',
                '911634',
                '921634',
                '931634',
                '941634',
                '951634',
                '961634',
                '981634',
                '991634',
                '970634',
                '972634',
                '973634',
                '974634',
                '975634',
                '976634',
                '977634',
                '978634',
                '979634',
                '971034',
                '971134',
                '971234',
                '971334',
                '971434',
                '971534',
                '971734',
                '971834',
                '971934',
                '971604',
                '971614',
                '971624',
                '971644',
                '971654',
                '971664',
                '971674',
                '971684',
                '971694',
                '971630',
                '971631',
                '971632',
                '971633',
                '971635',
                '971636',
                '971637',
                '971638',
                '971639']
    };
    let writeResult = await
    writeResultToDB(result, ticketTypeData, publisher, rssProviderId, feedPubDay);
    console.log(writeResult);
    // let publisherResult = await findPublisherResult(publisherId, date);
    // console.log(publisherResult);
};

function testNumberToWordVN() {
    console.log(common.numberToWordVN(123456789000));
    console.log(common.numberToWordVN(123456789105));
    console.log(common.numberToWordVN(123456789005));
    console.log(common.numberToWordVN(123110789000));
    console.log(common.numberToWordVN(104123456781005));
    console.log(common.numberToWordVN(123104123456781005));
    console.log(common.numberToWordVN(456123104123456781005));
    console.log(common.numberToWordVN(1456123104123456781005));
    console.log(common.numberToWordVN(104));
    console.log(common.numberToWordVN(110));
    console.log(common.numberToWordVN(555));
    console.log(common.numberToWordVN(155));
    console.log(common.numberToWordVN(115));
    console.log(common.numberToWordVN(121));
    console.log(common.numberToWordVN(121000450));
    console.log(common.numberToWordVN(121000000));
    console.log(common.numberToWordVN(121000006));
    console.log(common.numberToWordVN(11));
    console.log(common.numberToWordVN(5));
    console.log(common.numberToWordVN(25));
    console.log(common.numberToWordVN(1));
    console.log(common.numberToWordVN(1006));
    console.log(common.numberToWordVN(1112006));
    console.log(common.numberToWordVN(123000006));
    console.log(common.numberToWordVN(4123000006));
    console.log(common.numberToWordVN(4123004306));
};

function findDateOf(week, dayOfWeek, today, todayDayOfWeek) {
    let targetDay = today.add(((-7) * week), 'day');
    if (dayOfWeek == 0) {
        dayOfWeek = 7;
    }
    if (todayDayOfWeek == 0) {
        todayDayOfWeek = 7
    }
    let diff = dayOfWeek - todayDayOfWeek;
    targetDay = targetDay.add(diff, 'day');
    console.log(week + ', ' + dayOfWeek + ': ' + targetDay.format('YYYY-MM-DD'))
    return targetDay;
};