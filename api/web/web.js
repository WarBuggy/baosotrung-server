const systemConfig = require('../../systemConfig.js');
const coreTicketData = require('../../core/ticket.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
const common = require('../../common/common.js');
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
        let tomorrowDisplayString = tomorrow.format(systemConfig.dayjsVNFormatDateOnly);
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
};