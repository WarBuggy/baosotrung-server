window.addEventListener('load', function () {
    new Header();
    new ResultCheck();
    // Common.savePageTraffic(1);
});

class ResultCheck {
    constructor() {
        let data = this.getURLParamData();
        this.sendData(data);
    };

    getURLParamData() {
        let date = String(Common.getURLParameter('date'));
        let series = String(Common.getURLParameter('series'));
        if (date == '' || date == 'undefined' || date == 'null' ||
            series == '' || series == 'undefined' || series == 'null') {
            window.location.href = window.FRONTEND_URL + '/doveso';
            return;
        }
        return {
            date,
            series,
        }
    };

    async sendData(data) {
        let response = await Common.sendToBackend('/api/result/check', data);
        console.log(response);
    };
}
