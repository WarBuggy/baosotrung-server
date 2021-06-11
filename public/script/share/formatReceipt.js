class FormatReceipt {
    constructor(submissionDetail) {
        this.introText = `
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! Thông tin các vé bạn gửi đã được ghi nhận thành công.<br />
        Bạn sẽ nhận được thông báo nếu trúng số không lâu sau khi quá trình xổ số kết thúc.<br /><br />
        Xin tóm tắt lại thông tin bạn đã gửi vào lúc |<|hour|>| ngày |<|date|>|:
        `;
        let templateTableMain = `
        <html style='width: 100%;'>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport"
                content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, 
                width=device-width, user-scalable=no, minimal-ui" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="full-screen" content="yes" />
                <meta name="screen-orientation" content="portrait" />
                <style>
                    table, th, td {
                        border: 2px solid black;
                        border-collapse: collapse;
                    }
                    th, td { padding: 2px; }
                </style>
            </head> 
            <body style='width: 100%;'>
                |<|tables|>|
            </body>
        </html>
        `;
        this.templateTableDate = `
            <table style='width: 290px; margin-left: auto; margin-right: auto; margin-bottom: 32px;'>
                <tr><td colspan='2'>Ngày |<|callDate|>|</td></tr>
                |<|ticketType|>|
            </table>
        `;
        let htmlTable = this.convertToHtml(submissionDetail);
        this.html = templateTableMain.replace('|<|tables|>|', htmlTable);
    };

    convertToHtml(data) {
        let htmlTableList = [];
        let dateList = Object.keys(data);
        for (let i = 0; i < dateList.length; i++) {
            let aDate = dateList[i];
            let htmlTable = String(this.templateTableDate);
            htmlTable = htmlTable.replace('|<|callDate|>|', aDate);
            let htmlTypeList = [];
            let typeList = Object.keys(data[aDate]);
            for (let j = 0; j < typeList.length; j++) {
                let aType = typeList[j];
                let htmlType = '<tr><td colspan="2">Xổ số ' + aType + '</td></tr>';
                let publisherList = Object.keys(data[aDate][aType]);
                for (let k = 0; k < publisherList.length; k++) {
                    let aPublisher = publisherList[k];
                    let serials = data[aDate][aType][aPublisher];
                    htmlType = htmlType + '<tr>';
                    htmlType = htmlType +
                        '<td style="width: 180px;" rowspan="' +
                        serials.length + '">' + aPublisher +
                        '</td>' +
                        '<td style="text-align: right;">' + serials[0] + '</td>' +
                        '</tr>';
                    for (let l = 1; l < serials.length; l++) {
                        htmlType = htmlType +
                            '<tr><td style="text-align: right;">' + serials[l] + '</td></tr>';
                    }
                }
                htmlTypeList.push(htmlType);
            }
            htmlTable = htmlTable.replace('|<|ticketType|>|', htmlTypeList.join(''));
            htmlTableList.push(htmlTable);
        }
        return htmlTableList.join('');
    };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormatReceipt;
}
else {
    window.FormatReceipt = FormatReceipt;
}
