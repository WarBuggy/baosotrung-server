window.addEventListener('load', function () {
    new Header();
    new ResultLog();
    // Common.savePageTraffic(1);
});

class ResultLog {
    constructor() {
        this.data = {
            ticketType: 1,
            dayOfWeek: 1,
            week: 3,
        };
        this.getData();
    };

    async getData() {
        let response = await Common.sendToBackend('/api/result-log/data', this.data);
        console.log(response);
        // check if code is not 0 -> error

        // if response.data.length < 1
        // code = 1 ->  'Kết quả xổ số chưa có'
        // else -> 'Không tìm được kết quả'

        // else display data
    };
};
