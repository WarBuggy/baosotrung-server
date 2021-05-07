const db = require('../db/db.js');
const prizeCoreData = require('../core/prize.js');
const winEmailTemplate = require('../mailer/template.js').winner;
const systemConfig = require('../systemConfig.js');


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
        let winnerData = consolidateWinner(winning);
        createWinningEmail(winnerData);
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
        let aWinnerData = winnerData[userId];
        if (aWinnerData == null) {
            aWinnerData = {
                email: aWinning.email,
                phone: aWinning.phone,
                publisher: {},
            };
            winnerData[userId] = aWinnerData;
        }
        let publisherId = aWinning.publisher;
        let aPublisher = aWinnerData.publisher[publisherId];
        if (aPublisher == null) {
            aPublisher = {
                series: {},
            };
            aWinnerData.publisher[publisherId] = aPublisher;
        }
        aPublisher.prizeFormat = aWinning.prize_format;
        let winningSeries = aWinning.series;
        let prizes = aPublisher.series[winningSeries];
        if (prizes == null) {
            prizes = [];
            aPublisher.series[winningSeries] = prizes;
        }
        prizes.push(aWinning.prize);
    }
    return winnerData;
};

function createWinningEmail(winnerData) {
    let winnerId = Object.keys(winnerData);
    for (let i = 0; i < winnerId.length; i++) {
        let aWinnerId = winnerId[i];
        let aWinner = winnerData[aWinnerId];
        processAWinner(aWinner);
    }
};

function processAWinner(aWinner) {
    let publisher = aWinner.publisher;
    let publisherId = Object.keys(publisher);
    for (let i = 0; i < publisherId.length; i++) {
        let aPublisherId = publisherId[i];
        let aPublisher = publisher[aPublisherId];
        processAPublisher(aPublisher);
    }
};

function processAPublisher(aPublisher) {
    let prizeData = prizeCoreData[aPublisher.prizeFormat];
    let series = Object.keys(aPublisher.series);
    for (let i = 0; i < series.length; i++) {
        let aSeries = series[i];
        let prizeId = aPublisher.series[aSeries];
        for (let j = 0; j < prizeId.length; j++) {
            let aPrizeId = prizeId[j];
            let seriesResult = processASeries(prizeData, aPrizeId, aSeries, j);
            console.log(seriesResult);
        }
    }
};

function processASeries(prizeData, aPrizeId, aSeries, index) {
    let aPrize = prizeData[aPrizeId];
    let prizeLine = winEmailTemplate.seriesDetail;
    let emailPrizeMoney = parseInt(aPrize.prizeMoney).toLocaleString('vi-VN') + ' VNĐ';
    prizeLine = prizeLine.replace('|<|prizeName|>|', aPrize.emailName);
    prizeLine = prizeLine.replace('|<|prizeMoney|>|', emailPrizeMoney);
    if (index > 0) {
        prizeLine = prizeLine.replace('|<|series|>|', '');
    } else {
        prizeLine = prizeLine.replace('|<|series|>|', aSeries);
    }
    let prizeMoney = aPrize.prizeMoney;
    let taxLine = '';
    let taxAmount = 0;
    if (prizeMoney > systemConfig.prizeMoneyTaxThreshold) {
        taxLine = winEmailTemplate.taxDetail;
        let taxableAmount = parseInt(aPrize.prizeMoney) - systemConfig.prizeMoneyTaxThreshold;
        taxAmount = Math.ceil(taxableAmount * 0.1);
        taxLine = taxLine.replace('|<|prizeMoney|>|', emailPrizeMoney);
        taxLine = taxLine.replace('|<|taxableAmount|>|',
            parseInt(taxableAmount).toLocaleString('vi-VN') + ' VNĐ');
        taxLine = taxLine.replace('|<|taxAmount|>|', taxAmount);
        taxLine = taxLine.replace('|<|series|>|', aSeries);
    }
    return {
        prizeLine,
        taxLine,
        taxAmount,
    }
};