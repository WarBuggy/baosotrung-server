window.addEventListener('load', function () {
    new Header();
    new ResultLog();
    // Common.savePageTraffic(1);
});

class ResultLog {
    constructor() {
        this.data = {
            ticketType: 1,
            dayOfWeek: null,
            week: null,
        };
        this.getData();
    };

    async getData() {
        let response = await Common.sendToBackend('/api/result-log/data', this.data);
        console.log(response);
    };
};
