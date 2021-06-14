const common = require('../../common/common.js');

module.exports = function (app) {
    app.post('/api/webhook/zalo/oa', async function (request, response) {
        let requestIp = common.getReadableIP(request);
        // let purpose = 'save page traffic';
        common.consoleLog('(' + requestIp + ') Received Zalo OA webhook.');
        // let pageId = request.body.pageId;
        // let params = [
        //     requestIp,
        //     pageId,
        // ];
        // let logInfo = {
        //     username: '',
        //     source: '`baosotrung_data`.`SP_SAVE_PAGE_TRAFFIC`',
        //     userIP: requestIp,
        // };
        // let result = await db.query(params, logInfo);
        // if (result.resultCode != 0) {
        //     response.status(result.resultCode);
        //     response.json({ success: false, });
        //     common.consoleLogError('Error when ' + purpose + '. Error code ' + errorCode + '.');
        //     return;
        // }
        let resJson = {
            success: true,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Zalo OA webhook was successfully handled.');
    });
};