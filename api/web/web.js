const systemConfig = require('../../systemConfig.js');
const coreTicketData = require('../../core/ticket.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
const common = require('../../common/common.js');
const db = require('../../db/db.js');
const cryptoAES256CBC = require('../../common/crypto/crypto.js')['aes-256-cbc'];
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
        let purpose = 'creating user submission';
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
        let sqlQueryData = createAlertSQLString(seriesData);
        let params = [
            requestIp,
            email,
            sms,
            sqlQueryData['1'].insertQuery, // hard code all the type
            count,
        ];
        let logInfo = {
            username: '',
            source: '`baosotrung_data`.`SP_CREATE_USER_SUBMISSION`',
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
        let submissionId = result.sqlResults[1][0].submissionId;
        let encryptResult = cryptoAES256CBC.encrypt(String(submissionId));
        if (!encryptResult.success) {
            let errorCode = 800;
            common.consoleLogError('Encryption error when ' + purpose + ': ' + encryptResult.error
                + '. Error code ' + errorCode + '.');
            response.status(errorCode);
            response.json({ success: false, });
            return;
        }
        let resJson = {
            success: true,
            result: 0,
            submission: encryptResult.result,
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
        // sqlStringType1 is also the default
        let sqlStringType1 = 'INSERT INTO `baosotrung_data`.`submission_detail_type_1` ' +
            '(`submission`, `publisher`, `call_date`, ' +
            '`last_2`, `last_3`, `last_4`, `last_5`, `serial`) VALUES ';
        let sqlQueryData = {};
        for (let i = 0; i < seriesData.length; i++) {
            let aSeriesData = seriesData[i];
            let parts = aSeriesData.split(',');
            let ticketType = parts[0];
            let date = parts[1];
            let publisher = parts[2];
            let serial = String(parts[3]).trim();
            let typeData = sqlQueryData[ticketType];
            if (typeData == null) {
                let insertString = sqlStringType1;
                // insert if for other values of ticketType
                typeData = {
                    parts: [],
                    insertString,
                };
                sqlQueryData[ticketType] = typeData;
            }
            let aSQLString = '(<sId>, ' + publisher + ',"' + date + '","' +
                serial.slice(-2) + '","' + serial.slice(-3) + '","' +
                serial.slice(-4) + '","' + serial.slice(-5) + '","' +
                serial + '")';
            typeData.parts.push(aSQLString);
        }
        let ticketTypeList = Object.keys(sqlQueryData);
        for (let i = 0; i < ticketTypeList.length; i++) {
            let aTicketType = ticketTypeList[i];
            let typeData = sqlQueryData[aTicketType];
            typeData.insertQuery = typeData.insertString + typeData.parts.join(',');
        }
        return sqlQueryData;
    };
    //#endregion

    //#region /api/submission
    app.post('/api/submission', async function (request, response) {
        let requestIp = common.getReadableIP(request);
        let purpose = 'retreive user submission';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let submission = request.body.submission;
        let submissionResult = await findSubmissionDetail(requestIp, purpose, submission);
        if (!submissionResult.success) {
            response.status(submissionResult.errorCode);
            response.json({ success: false, });
            return;
        }
        let submissionInfo = submissionResult.sqlResults[1][0];
        let submissionCreateDate = submissionInfo.create_date;
        let submissionEmail = submissionInfo.email;
        let submissionDetail = processSubmissionData(result.sqlResults[2]);
        let resJson = {
            success: true,
            result: 0,
            submissionCreateDate,
            submissionEmail,
            submissionDetail,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });

    async function findSubmissionDetail(requestIp, purpose, submission) {
        let decryptResult = cryptoAES256CBC.decrypt(String(submission));
        if (!decryptResult.success) {
            let errorCode = 801;
            common.consoleLogError('Decryption error when ' + purpose + ': ' + decryptResult.error
                + '. Error code ' + errorCode + '.');
            return {
                success: false,
                errorCode,
            };
        }
        let submissionId = parseInt(decryptResult.result);
        if (!common.isNumeric(submissionId)) {
            let errorCode = 802;
            common.consoleLogError('Error when ' + purpose + ': received submission is not a number.' +
                ' Error code ' + errorCode + '.');
            return {
                success: false,
                errorCode,
            };
        }
        let params = [
            requestIp,
            submissionId,
        ];
        let logInfo = {
            username: '',
            source: '`baosotrung_data`.`SP_FIND_SUBMISSION_DETAIL`',
            userIP: requestIp,
        };
        let result = await db.query(params, logInfo);
        if (result.resultCode != 0) {
            let errorCode = result.resultCode;
            common.consoleLogError('Database error when ' + purpose + '. Error code ' + errorCode + '.');
            return {
                success: false,
                errorCode,
            };
        }
        return {
            success: true,
            sqlResults: result.sqlResults,
        };
    };

    function processSubmissionData(data) {
        let result = {};
        for (let i = 0; i < data.length; i++) {
            let aDetail = data[i];
            let callDate = aDetail.call_date;
            let dateDetail = result[callDate];
            if (dateDetail == null) {
                dateDetail = {};
                result[callDate] = dateDetail;
            };
            let ticketType = aDetail.type;
            let ticketTypeCoreData = coreTicketData.type[ticketType];
            if (ticketTypeCoreData == null) {
                continue;
            }
            let ticketTypeName = ticketTypeCoreData.name;
            let ticketTypeDetail = dateDetail[ticketTypeName];
            if (ticketTypeDetail == null) {
                ticketTypeDetail = {};
                dateDetail[ticketTypeName] = ticketTypeDetail;
            }
            let publisher = aDetail.publisher;
            let publisherCoreData = coreTicketData.publisher[publisher];
            if (publisherCoreData == null) {
                continue;
            }
            if (publisherCoreData.type != ticketType) {
                continue;
            }
            let publisherName = publisherCoreData.name;
            let publisherDetail = ticketTypeDetail[publisherName];
            if (publisherDetail == null) {
                publisherDetail = [];
                ticketTypeDetail[publisherName] = publisherDetail;
            }
            let serial = aDetail.serial;
            if (!publisherDetail.includes(serial)) {
                publisherDetail.push(serial);
            }
        }
        return result;
    };
    //#endregion
};