const systemConfig = require('../../systemConfig.js');
const coreTicketData = require('../../core/ticket.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
const common = require('../../common/common.js');
const db = require('../../db/db.js');
dayjs.extend(dayjsCustomParseFormat);

module.exports = function (app) {
    //#region /api/data/core 
    app.post('/api/data/core', function (request, response) {
        let requestIp = common.getReadableIP(request);
        let purpose = 'front end core data';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let coreData = createCoreData();
        let resJson = {
            success: true,
            result: 0,
            data: coreData,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });

    function createCoreData() {
        let data = createTicketTypeData();
        addDateData(data);
        addPublisherData(data);
        return data;
    };

    function createTicketTypeData() {
        let result = [];
        let ticketTypeId = Object.keys(coreTicketData.type);
        for (let i = 0; i < ticketTypeId.length; i++) {
            let aTicketTypeId = ticketTypeId[i];
            let aTicketTypeData = coreTicketData.type[aTicketTypeId];
            if (aTicketTypeData.allowUserAlert !== true) {
                continue;
            }
            let aResult = {
                id: aTicketTypeId,
                name: aTicketTypeData.name,
                maxInputSeriesTimeAllow: aTicketTypeData.maxInputSeriesTimeAllow,
                seriesLength: aTicketTypeData.seriesLength,
                date: [],
            };
            result.push(aResult);
        }
        return result;
    };

    function addDateData(data) {
        let currentTime = dayjs();
        let todayString = currentTime.format(systemConfig.dayjsFormatDateOnly);
        let todayDisplayString = currentTime.format(systemConfig.dayjsVNFormatShortDateOnly);
        let tomorrow = currentTime.add(1, 'day');
        let tomorrowString = tomorrow.format(systemConfig.dayjsFormatDateOnly);
        let tomorrowDisplayString = tomorrow.format(systemConfig.dayjsVNFormatShortDateOnly);
        for (let i = 0; i < data.length; i++) {
            let aTicketTypeData = data[i];
            let maxInputSeriesTimeAllow = dayjs(
                todayString + ' ' + aTicketTypeData.maxInputSeriesTimeAllow);
            if (currentTime.isBefore(maxInputSeriesTimeAllow)) {
                // add today
                let todayObject = {
                    name: 'Hôm nay',
                    dateString: todayString,
                    displayDateString: todayDisplayString,
                    publisher: [],
                };
                aTicketTypeData.date.push(todayObject);
            }
            // add tomorrow
            let tomorrowObject = {
                name: 'Ngày mai',
                dateString: tomorrowString,
                displayDateString: tomorrowDisplayString,
                publisher: [],
            };
            aTicketTypeData.date.push(tomorrowObject);
        }
    };

    function addPublisherData(data) {
        let publisherId = Object.keys(coreTicketData.publisher);
        for (let i = 0; i < data.length; i++) {
            let aTicketTypeData = data[i];
            let aTicketTypeId = aTicketTypeData.id;
            for (let j = 0; j < aTicketTypeData.date.length; j++) {
                let aDate = aTicketTypeData.date[j];
                let aDateJs = dayjs(aDate.dateString);
                let aWeekday = aDateJs.day();
                for (let k = 0; k < publisherId.length; k++) {
                    let aPublisherId = publisherId[k];
                    let aPublisher = coreTicketData.publisher[aPublisherId];
                    if (aPublisher.type == aTicketTypeId &&
                        aPublisher.callDay.includes(aWeekday)) {
                        let aPublisherData = {
                            id: aPublisherId,
                            name: aPublisher.name,
                        };
                        aDate.publisher.push(aPublisherData);
                    }
                }
            }
        }
    };
    //#endregion

    //#region /api/alert
    app.post('/api/alert', async function (request, response) {
        let requestIp = common.getReadableIP(request);
        let purpose = 'record alert data';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let count = request.body.count;
        let seriesString = request.body.seriesString;
        let email = request.body.email;
        let sms = String(request.body.sms).trim();
        if (sms == 'null' || sms == '') {
            sms = null;
        }
        let seriesData = seriesString.split('|||');
        if (seriesData.length != count) {
            let errorCode = 600;
            common.consoleLogError('Error when ' + purpose + ': Invalid count (' +
                count + '/' + seriesData.length + ').');
            response.status(errorCode);
            response.json({ success: false, });
            return;
        }
        if (!common.validateEmail(email)) {
            let errorCode = 601;
            common.consoleLogError('Error when ' + purpose + ': Invalid email (' + email + ').');
            response.status(errorCode);
            response.json({ success: false, });
            return;
        }
        let seriesValidate = validateAlertSeriesData(seriesData);
        if (seriesValidate.result == false) {
            let errorCode = 601 + seriesValidate.errorCode;
            common.consoleLogError('Error when ' + purpose + ':' + seriesValidate.errorMessage);
            response.status(errorCode);
            response.json({ success: false, });
            return;
        }
        let sqlString = createAlertSQLString(seriesData);
        let params = [
            requestIp,
            email,
            sms,
            sqlString,
            count,
        ];
        let logInfo = {
            username: '',
            source: '`baosotrung_data`.`SP_CREATE_ALERT_DATA`',
            userIP: requestIp,
        };
        let result = await db.query(params, logInfo);
        if (result.resultCode != 0) {
            let errorCode = result.resultCode;
            common.consoleLogError('Database error when ' + purpose + '. Error code ' + errorCode + '.');
            response.status(errorCode);
            response.json({ success: false, });
            return;
        }
        let resJson = {
            success: true,
            result: 0,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });

    function validateAlertSeriesData(seriesData) {
        for (let i = 0; i < seriesData.length; i++) {
            let aSeriesData = seriesData[i];
            let parts = aSeriesData.split(',');
            if (parts.length != 4) {
                return {
                    result: false,
                    errorCode: 1,
                    errorMessage: 'Invalid data parts (' + aSeriesData + ').',
                };
            }
            let ticketType = parts[0];
            let date = parts[1];
            let publisher = parts[2];
            let serial = String(parts[3]).trim();
            let ticketTypeData = coreTicketData.type[ticketType];
            if (ticketTypeData == null) {
                return {
                    result: false,
                    errorCode: 2,
                    errorMessage: 'Invalid ticket type data (' + aSeriesData + ').',
                };
            }
            let publisherData = coreTicketData.publisher[publisher];
            if (publisherData == null) {
                return {
                    result: false,
                    errorCode: 3,
                    errorMessage: 'Invalid publisher data (' + aSeriesData + ').',
                };
            }
            if (publisherData.type != ticketType) {
                return {
                    result: false,
                    errorCode: 4,
                    errorMessage: 'Ticket type and publisher mismatch (' + aSeriesData + ').',
                };
            }
            if (!dayjs(date).isValid()) {
                return {
                    result: false,
                    errorCode: 5,
                    errorMessage: 'Invalid date (' + aSeriesData + ').',
                };
            }
            if (serial.length != 6) {
                return {
                    result: false,
                    errorCode: 6,
                    errorMessage: 'Invalid serial length (' + aSeriesData + ').',
                };
            }
            for (let j = 0; j < serial.length; j++) {
                if (!'0123456789'.includes(serial[j])) {
                    return {
                        result: false,
                        errorCode: 7,
                        errorMessage: 'Invalid serial (' + aSeriesData + ').',
                    };
                }
            }
        }
        return { result: true };
    };

    function createAlertSQLString(seriesData) {
        let sqlString = 'INSERT INTO `baosotrung_data`.`series` ' +
            '(`user`, `publisher`, `call_date`, `ticket_type`, ' +
            '`series`,`last_2`, `last_3`, `last_4`, `last_5`) VALUES ';
        let stringParts = [];
        for (let i = 0; i < seriesData.length; i++) {
            let aSeriesData = seriesData[i];
            let parts = aSeriesData.split(',');
            let ticketType = parts[0];
            let date = parts[1];
            let publisher = parts[2];
            let serial = String(parts[3]).trim();
            let aSQLString = '(<uId>, ' + publisher + ',"' + date + '",' +
                ticketType + ',"' + serial + '","' + serial.slice(-2) + '","' +
                serial.slice(-3) + '","' + serial.slice(-4) + '","' + serial.slice(-5) + '")';
            stringParts.push(aSQLString);
        }
        sqlString = sqlString + stringParts.join(',');
        return sqlString;
    };
    //#endregion
};