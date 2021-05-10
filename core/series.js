const ticketCoreData = require('../core/ticket.js');
const prizeCoreData = require('../core/prize.js');
const winEmailTemplate = require('../mailer/template.js').winner;
const systemConfig = require('../systemConfig.js');
const common = require('../common/common.js');
const db = require('../db/db.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(dayjsCustomParseFormat);

module.exports = {
    startCheckingProcess: async function (ticketTypeData, crawlDate) {
        let successPublisher = ticketTypeData.successCrawl;
        if (successPublisher.length < 0) {
            return '';
        }
        let winning = [];
        for (let i = 0; i < successPublisher.length; i++) {
            let publisherId = successPublisher[i].id;
            await checkResult(ticketTypeData, winning, publisherId, crawlDate);
        }
        let winner = consolidateWinner(winning);
        return createWinningEmail(winner, crawlDate);
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
                let aSeries = aPublisher.series[series[k]];
                aSeries.prize.sort(sortPrize);
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

function sortPrize(prize1, prize2) {
    return prize2.prizeMoney - prize1.prizeMoney;
};

function sortSeries(series1, series2) {
    return series2.seriesWinningAmount - series1.seriesWinningAmount;
};

function sortPublisher(publisher1, publisher2) {
    return publisher2.publisherWinningAmount - publisher1.publisherWinningAmount;
};

function sortWinner(winner1, winner2) {
    return winner2.userWinningAmount - winner1.userWinningAmount;
};

function createWinningEmail(winner, crawlDate) {
    let emailContentTemplate = winEmailTemplate.body;
    let crawlDateJS = dayjs(crawlDate);
    let expireDate = crawlDateJS.add(30, 'day');
    emailContentTemplate = emailContentTemplate.replace('|<|callDate|>|',
        crawlDateJS.format(systemConfig.dayjsVNFormatDateOnly));
    emailContentTemplate = emailContentTemplate.replace('|<|lastClaimDay|>|',
        expireDate.format(systemConfig.dayjsVNFormatDateOnly));
    let allEmail = '';
    for (let i = 0; i < winner.length; i++) {
        let aWinner = winner[i];
        let emailContent = processAWinner(aWinner, emailContentTemplate);
        allEmail = allEmail + emailContent + '\n\n';
    }
    return allEmail;
};

function processAWinner(aWinner, emailContentTemplate) {
    let publisherDetail = [];
    let taxDetail = '';
    let taxAmount = 0;
    let winAmount = 0;
    let taxLineCount = { count: 0, };
    for (let i = 0; i < aWinner.publisher.length; i++) {
        let aPublisher = aWinner.publisher[i];
        let publisherResult = processAPublisher(aPublisher, taxLineCount);
        publisherDetail.push(publisherResult.publisherLine);
        taxDetail = taxDetail + publisherResult.taxDetail;
        taxAmount = taxAmount + publisherResult.taxAmount;
        winAmount = winAmount + aPublisher.publisherWinningAmount;
    }
    let taxSummary = winEmailTemplate.noTax;
    if (taxAmount > 0) {
        taxSummary = winEmailTemplate.withTax;
        taxSummary = taxSummary.replace('|<|taxDetail|>|', taxDetail);
        taxSummary = taxSummary.replace(/\|<\|totalTaxAmount\|>\|/g,
            taxAmount.toLocaleString('vi-VN'));
        taxSummary = taxSummary.replace('|<|totalTaxAmountInWord|>|',
            common.numberToWordVN(taxAmount));
    }
    let emailContent =
        emailContentTemplate.replace('|<|publisherDetail|>|',
            publisherDetail.join('<br>'));
    emailContent = emailContent.replace('|<|taxSummary|>|', taxSummary);
    emailContent = emailContent.replace('|<|totalWinAmount|>|',
        winAmount.toLocaleString('vi-VN'));
    emailContent = emailContent.replace('|<|totalWinAmountInWord|>|',
        common.numberToWordVN(winAmount));
    return emailContent;
};

function processAPublisher(aPublisher, taxLineCount) {
    let publisherLine = winEmailTemplate.publisherDetail;
    publisherLine = publisherLine.replace('|<|publisherName|>|',
        ticketCoreData.publisher[aPublisher.id].name);
    let seriesDetail = '';
    let taxDetail = '';
    let taxAmount = 0;
    let publisherLineCount = 0;
    for (let i = 0; i < aPublisher.series.length; i++) {
        let aSeries = aPublisher.series[i];
        publisherLineCount = publisherLineCount + 1;
        let rowColor = 'white';
        if (publisherLineCount % 2 == 0) {
            rowColor = 'lightgray';
        }
        for (let j = 0; j < aSeries.prize.length; j++) {
            let aPrize = aSeries.prize[j];
            let seriesResult = processASeries(aPrize, aSeries.series,
                aSeries.prize.length, taxLineCount, j, rowColor);
            seriesDetail = seriesDetail + seriesResult.prizeLine;
            taxDetail = taxDetail + seriesResult.taxLine;
            taxAmount = taxAmount + seriesResult.taxAmount;
        }
    }
    publisherLine = publisherLine.replace('|<|seriesDetail|>|', seriesDetail);
    publisherLine = publisherLine.replace('|<|totalAmount|>|',
        aPublisher.publisherWinningAmount.toLocaleString('vi-VN'));
    return {
        publisherLine,
        taxDetail,
        taxAmount,
    };
};

function processASeries(aPrize, aSeries,
    prizeCount, taxLineCount, index, rowColor) {
    let prizeLine = winEmailTemplate.seriesDetail;
    let emailPrizeMoney = aPrize.prizeMoney.toLocaleString('vi-VN');
    prizeLine = prizeLine.replace('|<|prizeName|>|', aPrize.emailName);
    prizeLine = prizeLine.replace('|<|prizeMoney|>|', emailPrizeMoney);
    let seriesRowLine = winEmailTemplate.seriesDetailWithSeries;
    seriesRowLine = seriesRowLine.replace('|<|rowspan|>|', prizeCount);
    if (index > 0) {
        prizeLine = prizeLine.replace('|<|series|>|', '');
    } else {
        seriesRowLine = seriesRowLine.replace('|<|series|>|', aSeries);
        prizeLine = prizeLine.replace('|<|series|>|', seriesRowLine);
    }
    prizeLine = prizeLine.replace('|<|seriesRowBgColor|>|', rowColor);
    if (prizeCount > 1) {
        prizeLine = prizeLine.replace(/\|<\|borderWidth\|>\|/g, ' border-width: 1px;');
    } else {
        prizeLine = prizeLine.replace(/\|<\|borderWidth\|>\|/g, '');
    }
    let taxLine = '';
    let taxAmount = 0;
    if (aPrize.prizeMoney > systemConfig.prizeMoneyTaxThreshold) {
        taxLine = winEmailTemplate.taxDetail;
        let taxableAmount = aPrize.prizeMoney - systemConfig.prizeMoneyTaxThreshold;
        taxAmount = Math.ceil(taxableAmount * 0.1);
        taxLine = taxLine.replace('|<|taxableAmount|>|',
            taxableAmount.toLocaleString('vi-VN'));
        taxLine = taxLine.replace('|<|taxAmount|>|',
            taxAmount.toLocaleString('vi-VN'));
        taxLine = taxLine.replace('|<|series|>|', aSeries);
        taxLineCount.count = taxLineCount.count + 1;
        if (taxLineCount.count % 2 == 0) {
            taxLine = taxLine.replace('|<|taxRowBgColor|>|', 'lightgray');
        } else {
            taxLine = taxLine.replace('|<|taxRowBgColor|>|', 'white');
        }
    }
    return {
        prizeLine,
        taxLine,
        taxAmount,
    };
};