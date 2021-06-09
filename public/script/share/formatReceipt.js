class FormatReceipt {
    constructor(data) {
        this.data = data;
    };

    processSubmissionDetail(submissionDetail) {
        let data = {};
        for (let i = 0; i < submissionDetail.length; i++) {
            let aDetail = submissionDetail[i];
            let callDate = aDetail.callDate;
            let dateDetail = '';
        }
    };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormatReceipt;
}
else {
    window.FormatReceipt = FormatReceipt;
}
