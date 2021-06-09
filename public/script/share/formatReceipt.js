class FormatReceipt {
    constructor(submissionDetail) {
        let processData = this.processSubmissionDetail(submissionDetail);
        console.log(processData);
    };

    processSubmissionDetail(submissionDetail) {
        let data = {};
        for (let i = 0; i < submissionDetail.length; i++) {
            let aDetail = submissionDetail[i];
            let callDate = aDetail.callDate;
            let dateDetail = data[callDate];
            if (dateDetail == null) {
                dateDetail = {};
                data[callDate] = dateDetail;
            };
            let publisher = aDetail.publisher;
            let publisherDetail = dateDetail[publisher];
            if (publisherDetail == null) {
                publisherDetail = [];
                dateDetail[publisher] = publisherDetail;
            }
            let serial = aDetail.serial;
            if (!publisherDetail.includes(serial)) {
                publisherDetail.push(serial);
            }
        }
        return data;
    };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormatReceipt;
}
else {
    window.FormatReceipt = FormatReceipt;
}
