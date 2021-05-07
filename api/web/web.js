const series = require('../../core/series.js');

module.exports = function (app) {
    app.get('/api/test', function (request, response) {
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
        let string = series.startCheckingProcess(ticketTypeData, crawlDate);


        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end(string);
    });
};