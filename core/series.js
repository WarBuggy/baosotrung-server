const db = require('../db/db.js');
const prizeCoreData = require('../core/prize.js');
const winEmailTemplate = require('../mailer/template.js').winner;
const systemConfig = require('../systemConfig.js');
const common = require('../common/common.js');


module.exports = {
    startCheckingProcess: async function (ticketTypeData, crawlDate) {
        let successPublisher = ticketTypeData.successCrawl;
        if (successPublisher.length < 0) {
            return;
        }
        let winning = [];
        for (let i = 0; i < successPublisher.length; i++) {
            let publisherId = successPublisher[i].id;
            await checkResult(ticketTypeData, winning, publisherId, crawlDate);
        }
        let winner = consolidateWinner(winning);
        createWinningEmail(winner);
    },
};

async function checkResult(ticketTypeData, winning, publisherId, date) {
    let spName = '`baosotrung_data`.`' + ticketTypeData.checkResultSP + '`';
    let ticketTypeId = ticketTypeData.id;
    let params = [
        'localhost',
        ticketTypeId,
        publisherId,
        date,
    ];
    let logInfo = {
        username: '',
        source: spName,
        userIP: 'locahost',
    };
    let result = await db.query(params, logInfo);
    if (result.resultCode != 0) {
        return;
    }
    for (let i = 1; i < result.sqlResults.length; i++) {
        let record = result.sqlResults[i];
        if (record != null && record.length > 0) {
            for (let j = 0; j < record.length; j++) {
                winning.push(record[j]);
            }
        }
    };
};

function consolidateWinner(winning) {
    let winnerData = {};
    for (let i = 0; i < winning.length; i++) {
        let aWinning = winning[i];
        let userId = aWinning.id;
        let aWinner = winnerData[userId];
        if (aWinner == null) {
            aWinner = {
                id: userId,
                email: aWinning.email,
                phone: aWinning.phone,
                publisher: {},
                userWinningAmount: 0,
            };
            winnerData[userId] = aWinner;
        }
        let aPublisherId = aWinning.publisher;
        let aPublisher = aWinner.publisher[aPublisherId];
        if (aPublisher == null) {
            aPublisher = {
                id: aPublisherId,
                publisherWinningAmount: 0,
                series: {},
            };
            aWinner.publisher[aPublisherId] = aPublisher;
        }
        let aPrize = prizeCoreData[aWinning.prize_format][aWinning.prize];
        if (aPrize == null) {
            common.consoleLogError('Cannot find prize info (prize id: ', + aWinning.prize +
                ', prize format: ' + aWinning.prize_format + ').');
            continue;
        }
        let aWinningSeries = aWinning.series;
        let aSeries = aPublisher.series[aWinningSeries];
        if (aSeries == null) {
            aSeries = {
                series: aWinningSeries,
                prize: [],
                seriesWinningAmount: 0,
            }
            aPublisher.series[aWinningSeries] = aSeries;
        }
        aSeries.prize.push(aPrize);
        aWinner.userWinningAmount = aWinner.userWinningAmount + aPrize.prizeMoney;
        aPublisher.publisherWinningAmount = aPublisher.publisherWinningAmount + aPrize.prizeMoney;
        aSeries.seriesWinningAmount = aSeries.seriesWinningAmount + aPrize.prizeMoney;
    }
    let result = createWinnerDataArray(winnerData);
    return result;
};

function createWinnerDataArray(winnerData) {
    let result = [];
    let winnerId = Object.keys(winnerData);
    for (let i = 0; i < winnerId.length; i++) {
        let aWinnerId = winnerId[i];
        let aWinner = winnerData[aWinnerId];
        let publisherArray = [];
        let publisherId = Object.keys(aWinner.publisher);
        for (let j = 0; j < publisherId.length; j++) {
            let aPublisherId = publisherId[j];
            let aPublisher = aWinner.publisher[aPublisherId];
            publisherArray.push(aPublisher);
            let seriesArray = [];
            let series = Object.keys(aPublisher.series);
            for (let k = 0; k < series.length; k++) {
                let aSeries = publisher.series[series[k]];
                seriesArray.push(aSeries);
            }
            aPublisher.series = seriesArray;
            aPublisher.series.sort(sortSeries);
        }
        aWinner.publisher = publisherArray;
        aWinner.publisher.sort(sortPublisher);
        result.push(aWinner);
    }
    result.sort(sortWinner);
    return result;
};

function sortSeries(series1, series2) {
    return series2.publisherWinningAmount - series1.publisherWinningAmount;
};

function sortPublisher(publisher1, publisher2) {
    return publisher2.seriesWinningAmount - publisher1.seriesWinningAmount;
};

function sortWinner(winner1, winner2) {
    return winner2.seriesWinningAmount - winner1.seriesWinningAmount;
};

function createWinningEmail(winner) {
    for (let i = 0; i < winner.length; i++) {
        let aWinner = winner[i];
        processAWinner(aWinner);
    }
};

function processAWinner(aWinner) {
    for (let i = 0; i < aWinner.publisher.length; i++) {
        let aPublisher = aWinner.publisher[i];
        processAPublisher(aPublisher);
    }
};

function processAPublisher(aPublisher) {
    for (let i = 0; i < aPublisher.series.length; i++) {
        let aSeries = aPublisher.series[i];
        for (let j = 0; j < aSeries.prize.length; j++) {
            let aPrize = aSeries.prize[j];
            let seriesResult = processASeries(aPrize, aSeries.series, j);

        }
    }
};

function processASeries(aPrize, aSeries, index) {
    let prizeLine = winEmailTemplate.seriesDetail;
    let emailPrizeMoney = aPrize.prizeMoney.toLocaleString('vi-VN') + ' VNĐ';
    prizeLine = prizeLine.replace('|<|prizeName|>|', aPrize.emailName);
    prizeLine = prizeLine.replace('|<|prizeMoney|>|', emailPrizeMoney);
    if (index > 0) {
        prizeLine = prizeLine.replace('|<|series|>|', '');
    } else {
        prizeLine = prizeLine.replace('|<|series|>|', aSeries);
    }
    let taxLine = '';
    let taxAmount = 0;
    if (aPrize.prizeMoney > systemConfig.prizeMoneyTaxThreshold) {
        taxLine = winEmailTemplate.taxDetail;
        let taxableAmount = aPrize.prizeMoney - systemConfig.prizeMoneyTaxThreshold;
        taxAmount = Math.ceil(taxableAmount * 0.1);
        taxLine = taxLine.replace('|<|prizeMoney|>|', emailPrizeMoney);
        taxLine = taxLine.replace('|<|taxableAmount|>|',
            taxableAmount.toLocaleString('vi-VN') + ' VNĐ');
        taxLine = taxLine.replace('|<|taxAmount|>|',
            taxAmount.toLocaleString('vi-VN') + ' VNĐ');
        taxLine = taxLine.replace('|<|series|>|', aSeries);
    }
    return {
        prizeLine,
        taxLine,
        taxAmount,
    };
};