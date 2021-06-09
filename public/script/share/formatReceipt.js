class FormatReceipt {
    constructor(submissionDetail) {
        this.html = this.convertToHtml(submissionDetail);
    };

    convertToHtml(data) {
        let tableHtml = [];
        let dateList = Object.keys(data);
        for (let i = 0; i < dateList.length; i++) {
            let aDate = dateList[i];
            let table = '<div class="divSummaryDate">'
            table = table + '<div class="">' + aDate + '</div>';
            let typeList = Object.keys(data[aDate]);
            for (let j = 0; j < typeList.length; j++) {
                let aType = typeList[j];
            }
            table = table + '</div>';
            tableHtml.push(table);
        }
        return tableHtml.join('');
    };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormatReceipt;
}
else {
    window.FormatReceipt = FormatReceipt;
}
