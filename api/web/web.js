const systemConfig = require('../../systemConfig.js');
const coreTicketData = require('../../core/ticket.js');
const prizeData = require('../../core/prize.js');
const common = require('../../common/common.js');
const db = require('../../db/db.js');
const cryptoAES256CBC = require('../../common/crypto/crypto.js')['aes-256-cbc'];
const mailer = require('../../mailer/mailer.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(dayjsCustomParseFormat);

module.exports = function (app) {
    //#region /api/data/core 
    // get core data for index.html
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

    //#region /api/submission/create
    // create user submission (index.html)
    app.post('/api/submission/create', async function (request, response) {
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
    // retreive user submission info (receipt.html)
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
        let submissionCreateHour = submissionInfo.create_hour;
        let submissionEmail = submissionInfo.email;
        let submissionDetail = processSubmissionData(submissionResult.sqlResults[2]);
        let resJson = {
            success: true,
            result: 0,
            submissionCreateDate,
            submissionCreateHour,
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

    //#region /api/submission/share/email
    // send user submission info to email(s) (receipt.html)
    app.post('/api/submission/share/email', async function (request, response) {
        let requestIp = common.getReadableIP(request);
        let purpose = 'share submission detail via email';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let submission = request.body.submission;
        let receiverEmail = request.body.email;
        let submissionResult = await findSubmissionDetail(requestIp, purpose, submission);
        if (!submissionResult.success) {
            response.status(submissionResult.errorCode);
            response.json({ success: false, });
            return;
        }
        let submissionInfo = submissionResult.sqlResults[1][0];
        let submissionCreateDate = submissionInfo.create_date;
        let submissionCreateHour = submissionInfo.create_hour;
        let submissionEmail = submissionInfo.email;
        let submissionDetail = processSubmissionData(submissionResult.sqlResults[2]);
        let FormatReceipt = require('../../public/script/share/formatReceipt.js');
        let formatReceipt = new FormatReceipt(submissionDetail, submissionEmail);
        let emailHtmlContent =
            formatReceipt.createEmailHtml(submissionCreateDate, submissionCreateHour);
        mailer.sendMail(emailHtmlContent, true, receiverEmail,
            'Tóm tắc thông tin vé số', 'share submission detail');
        let resJson = {
            success: true,
            result: 0,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });
    //#endregion

    //#region /api/traffic/page/save
    // Save page traffic (multiple pages)
    app.post('/api/traffic/page/save', async function (request, response) {
        let requestIp = common.getReadableIP(request);
        let purpose = 'save page traffic';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let pageId = request.body.pageId;
        let params = [
            requestIp,
            pageId,
        ];
        let logInfo = {
            username: '',
            source: '`baosotrung_data`.`SP_SAVE_PAGE_TRAFFIC`',
            userIP: requestIp,
        };
        let result = await db.query(params, logInfo);
        if (result.resultCode != 0) {
            let errorCode = result.resultCode;
            response.status(errorCode);
            response.json({ success: false, });
            common.consoleLogError('Error when ' + purpose + '. Error code ' + errorCode + '.');
            return;
        }
        let resJson = {
            success: true,
            result: 0,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });
    //#endregion

    //#region /api/result-log/data
    app.post('/api/result-log/data', async function (request, response) {
        let requestIp = common.getReadableIP(request);
        let purpose = 'retreive data for result log page';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let ticketType = String(request.body.ticketType);
        let dayOfWeek = String(request.body.dayOfWeek);
        let week = String(request.body.week);
        let date = String(request.body.date);
        let dayOfWeekModified = false;
        let weekModified = false;
        let ticketTypeList = Object.keys(coreTicketData.type);
        let secondTime = 0;
        let today = dayjs();
        let todayDayOfWeek = String(today.day());
        let todayDateString = today.format(systemConfig.dayjsFormatDateOnly);
        let targetDate = null;

        console.log(date);
        console.log(typeof (date));
        if (date != null && date != 'null' && date != undefined && date != 'undefined') {
            if (!ticketTypeList.includes(ticketType)) {
                let resJson = {
                    success: true,
                    result: 0,
                    code: 3,
                };
                response.json(resJson);
                common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
                return;
            }
            targetDate = dayjs(date);
            if (!targetDate.isValid()) {
                let resJson = {
                    success: true,
                    result: 0,
                    code: 2,
                };
                response.json(resJson);
                common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
                return;
            }
        } else {
            if (!ticketTypeList.includes(ticketType)) {
                ticketType = ticketTypeList[0];
            }
            if (!['0', '1', '2', '3'].includes(week)) {
                week = '0';
                weekModified = true;
            }
            if (!['0', '1', '2', '3', '4', '5', '6'].includes(dayOfWeek)) {
                dayOfWeek = todayDayOfWeek;
                dayOfWeekModified = true;
            }
            targetDate = findDateOf(week, dayOfWeek, today, todayDayOfWeek);
        }

        let todayCrawlTimeString = todayDateString + ' ' +
            coreTicketData.type[ticketType].crawlTime;
        let targetDateString = targetDate.format(systemConfig.dayjsFormatDateOnly);
        let vnDateString = targetDate.format(systemConfig.dayjsVNFormatDateOnly);
        let targetDateFullString = targetDate.format(systemConfig.dayjsFormatFull);
        let tomorrow = today.add(1, 'day');
        let tomorrowFullString = tomorrow.format(systemConfig.dayjsFormatDateOnly) +
            ' 00:00:00';

        let noResultYet = false;
        if (targetDateString == todayDateString &&
            targetDateFullString <= todayCrawlTimeString) {
            if (dayOfWeekModified || weekModified) {
                if (dayOfWeek == 1) {
                    week = parseInt(week) + 1;
                }
                if (dayOfWeek == 0) {
                    dayOfWeek = 6;
                }
                dayOfWeek = parseInt(dayOfWeek) - 1;
                targetDate = targetDate.add(-1, 'day');
                targetDateString = targetDate.format(systemConfig.dayjsFormatDateOnly);
                vnDateString = targetDate.format(systemConfig.dayjsVNFormatDateOnly);
            } else {
                noResultYet = true;
            }
        }
        if (noResultYet == true || targetDateFullString >= tomorrowFullString) {
            let resJson = {
                success: true,
                result: 0,
                vnDateString,
                data: null,
                code: 1,
                secondTime,
                ticketType,
                week,
                dayOfWeek,
                targetDateString,
            };
            response.json(resJson);
            common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
            return;
        }

        let result = await findResultOfDate(ticketType, targetDateString, requestIp);
        if (result.resultCode != 0) {
            let errorCode = result.resultCode;
            let resJson = {
                success: true,
                result: 0,
                vnDateString,
                data: null,
                code: errorCode,
                secondTime,
                ticketType,
                week,
                dayOfWeek,
                targetDateString,
            };
            response.json(resJson);
            common.consoleLogError('Error when ' + purpose + '. Error code ' + errorCode + '.');
            return;
        }
        if (result.sqlResults[1].length < 1) {
            common.consoleLog('Could not find result of date ' + targetDateString + '. Try to crawl from source...');
            let rssCrawler = require('../../rss/crawler/crawler.js');
            await rssCrawler.crawlSpecificDate(targetDateString);
            secondTime = 1;
        }

        result = await findResultOfDate(ticketType, targetDateString, requestIp);
        if (result.resultCode != 0) {
            let errorCode = result.resultCode;
            let resJson = {
                success: true,
                result: 0,
                vnDateString,
                data: null,
                code: errorCode,
                secondTime,
                ticketType,
                week,
                dayOfWeek,
                targetDateString,
            };
            response.json(resJson);
            common.consoleLogError('Error when ' + purpose + ' (second time). Error code ' + errorCode + '.');
            return;
        }
        let data = processDbData(result.sqlResults[1]);
        let resJson = {
            success: true,
            result: 0,
            vnDateString,
            data,
            code: 0,
            secondTime,
            ticketType,
            week,
            dayOfWeek,
            targetDateString,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });

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
        return targetDay;
    };

    async function findResultOfDate(ticketType, dateString, requestIp) {
        let params = [
            requestIp,
            ticketType,
            dateString,
        ];
        let logInfo = {
            username: '',
            source: '`baosotrung_data`.`SP_FIND_RESULT_OF_DATE`',
            userIP: requestIp,
        };
        let result = await db.query(params, logInfo);
        return result;
    };

    function processDbData(data) {
        result = {
            prizeFormatList: [],
            prizeList: {},
            publisherList: {},
        };
        const publisherData = coreTicketData.publisher;
        for (let i = 0; i < data.length; i++) {
            let aRecord = data[i];
            let prizeId = String(aRecord.prize);
            let prizeFormatId = String(aRecord.prize_format);
            let prizeObject = prizeData[prizeFormatId][prizeId];
            if (prizeObject.showOnResultLog == false) {
                continue;
            }
            let prizeResultLogName = prizeObject.resultLogName;
            if (result.prizeList[prizeResultLogName] == null) {
                result.prizeList[prizeResultLogName] = prizeObject;
            }
            if (!result.prizeFormatList.includes(prizeFormatId)) {
                result.prizeFormatList.push(prizeFormatId);
            }
            let publisherId = aRecord.publisher;
            let publisherName = publisherData[publisherId].name;
            let publisherResult = result.publisherList[publisherName];
            if (publisherResult == null) {
                publisherResult = {};
                result.publisherList[publisherName] = publisherResult;
            }
            let prizeResult = publisherResult[prizeResultLogName];
            if (prizeResult == null) {
                prizeResult = [];
                publisherResult[prizeResultLogName] = prizeResult;
            }
            let aSeries = aRecord.series;
            prizeResult.push(aSeries);
        }
        processResultLogPrizeList(result);
        return result;
    };

    function processResultLogPrizeList(result) {
        let prizeList = Object.values(result.prizeList);
        prizeList.sort(prizeData.sortPrize);
        result.prizeList = prizeList;
    }
    //#endregion
};