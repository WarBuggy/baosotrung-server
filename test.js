const db = require('./db/db.js');
const common = require('./common/common.js');
const rssCrawler = require('./rss/crawler/crawler.js');
const series = require('./core/series.js');

start();


async function start() {
    // let prepareDbConnectionResult = await prepareDbConnection();
    // if (prepareDbConnectionResult == false) {
    //     return;
    // }
    // rssCrawler.test();
    testSeries();
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
    };
    let crawlDate = '2021-05-05';
    series.startCheckingProcess(ticketTypeData, crawlDate);
};