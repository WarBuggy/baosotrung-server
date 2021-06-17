window.addEventListener('load', function () {
    new Header();
    new ResultLog();
    // Common.savePageTraffic(1);
});

class ResultLog {
    constructor() {
        this.data = {
            ticketType: 1,
            dayOfWeek: 4,
            week: 0,
        };
        this.getData();
    };

    async getData() {
        let response = await Common.sendToBackend('/api/result-log/data', this.data);
        console.log(response);
    };
};
