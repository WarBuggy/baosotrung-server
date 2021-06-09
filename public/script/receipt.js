const { FormatReceipt } = require("./share/formatReceipt");

window.addEventListener('load', function () {
    new Receipt();
});

class Receipt {
    constructor() {
        let submission = String(Common.getURLParameter('submission')).trim();
        console.log(submission);
        if (submission == 'null' || submission == 'undefined' || submission == '') {
            this.showSummary();
            this.onNoSubmissionFound();
            return;
        }
        this.requestSubmissionData(submission);
    };

    showSummary() {
        document.getElementById('divLoading').style.display = 'none';
        document.getElementById('divSummary').style.display = 'block';
    };

    onNoSubmissionFound() {
        let divSummary = document.getElementById('divSummary');
        divSummary.style.color = 'red';
        divSummary.innerText = 'Lỗi: Không đủ dữ liệu để tìm thông tin.';
    };

    async requestSubmissionData(submission) {
        let sendData = {
            submission,
        };
        let response = await Common.sendToBackend('/api/submission', sendData);
        let formatReceipt = new FormatReceipt(response.content);
        console.log(formatReceipt.content);
    };
};