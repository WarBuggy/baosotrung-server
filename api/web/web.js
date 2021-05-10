const series = require('../../core/series.js');

module.exports = function (app) {
    app.get('/api/test', async function (request, response) {
        let ticketTypeData = {
            id: 1,
            successCrawl: [
                { id: 4, name: 'Bến Tre', },
                { id: 5, name: 'Vũng Tàu', },
                { id: 6, name: 'Bạc Liêu', },
            ],
            checkResultSP: 'SP_FIND_TYPE_1_WINNER',
            prize: 1,
        };
        let crawlDate = '2021-05-04';
        let string = await series.startCheckingProcess(ticketTypeData, crawlDate);


        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(string);
    });
};