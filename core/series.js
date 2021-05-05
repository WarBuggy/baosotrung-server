module.exports = {
    startCheckingProcess: function (ticketTypeData) {
        let successPublisher = ticketTypeData.successCrawl;
        if (successPublisher.length < 0) {
            return;
        }
        let typeId = ticketTypeData.id;
        let allWinner = [];
        for (let i = 0; i < successPublisher.length; i++) {
            let publisherId = successPublisher[i].id;

        }
    },
};