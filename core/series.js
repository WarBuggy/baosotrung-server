module.exports = {
    startCheckingProcess: async function (ticketTypeData, crawlDate) {
        let successPublisher = ticketTypeData.successCrawl;
        if (successPublisher.length < 0) {
            return;
        }
        let typeId = ticketTypeData.id;
        let winning = [];
        for (let i = 0; i < successPublisher.length; i++) {
            let publisherId = successPublisher[i].id;
            await checkResult(typeId, winning, publisherId, crawlDate);
        }
        let winnerData = consolidateWinner(winning);
    },
};


async function checkResult(ticketTypeData, winning, publisherId, date) {
    let spName = '`baosotrung_data`.`' + ticketTypeData.checkResultSP + '`';
    let ticketType = ticketTypeData.id;
    let params = [
        'localhost',
        ticketType,
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
            for (let j = 0; i < record.length; j++) {
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
                series: {},
            };
            winnerData[userId] = aWinnerData;
        }
        let winningSeries = aWinnerData.series;
        let prizes = aWinnerData.series[winningSeries];
        if (prizes == null) {
            prizes = [];
            aWinnerData.series[winningSeries] = prizes;
        }
        prizes.push(aWinning.prize);
    }
    console.log(winnerData);
    return winnerData;
};