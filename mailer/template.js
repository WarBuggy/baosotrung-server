module.exports = {
    winner: {
        body: `
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
                        border: 1px solid black;
                        border-collapse: collapse;
                    }
                    th, td { padding: 0px; }
                </style>
            </head> 
            <body style='width: 100%;'>
                <div style='margin-left: auto; margin-right: auto; width: 320px; font-size:12pt;'>
                    <p><strong>Xin chúc mừng quý khách!!!</strong></p>
                    <p>Quý khách đã may mắn mua được vé trúng thưởng của kỳ xổ số 
                    ngày <strong>|<|callDate|>|</strong>. Chi tiết trúng thưởng của quý khách như sau:</p>
                    |<|publisherDetail|>|
                    <p>Tổng số tiền trúng thưởng của quý khách là: <strong>|<|totalWinAmount|>|
                    VNĐ (|<|totalWinAmountInWord|>| đồng)</strong></p>
                    <p>Theo quy định của các công ty xổ số, quý khách có <strong>30 ngày</strong> để 
                    đổi vé lấy tiền trúng giải. Xin quý khách vui lòng đổi vé 
                    trúng <strong>trước ngày |<|lastClaimDay|>|</strong>. Nếu quý khách dự định đổi 
                    tại các đại lý gần nhà, xin quý khách lưu ý tránh đổi vé
                    cận ngày do cần có thời gian để  đem tờ vé trúng đến nơi 
                    phát hành (có thể bị từ chối do quá cận ngày và/hay chỉ đổi 
                    vài tờ). Công ty xổ số luôn sẽ trao giải trong vòng 30 ngày 
                    kể từ ngày xổ.</p>
                    <p>Cũng theo quy định, người trúng xổ số sẽ cần phải đóng thuế 
                    thu nhập cá nhân, áp dụng đối với trường hợp  giải thưởng có 
                    giá trị từ 10 triệu đồng trở lên. Với giá trị giải thưởng trên,
                    quý khách sẽ |<|taxSummary|>|</p>
                    <p>Một lần nữa xin chức mừng quý khách! Chúc quý khách luôn tìm
                    được nhiều niềm vui trong cuộc sống!<br>
                    Trân trọng,</p>
                    <p style='font-style: italic; color: gray; font-size:10pt;'>
                    Quý khách nhận được thư này vì đã sử dụng dịch vụ báo vé trúng
                    thưởng tại baotrungso.com. Nếu không phải là người nhận mong 
                    muốn của thư, mong quý bạn vui lòng bỏ quả sự cố này!</p>
                </div>
            </body>
        </html>
        `,
        publisherDetail: `
        <table style='width: 100%'>
            <tr><td colspan='3'><strong>Đài |<|publisherName|>|</strong></td></tr>
            <tr>
                <td style='text-align: left; width: 70px;'><strong>Vé số</strong></td>
                <td style='text-align: left;'><strong>Giải</strong></td>
                <td style='text-align: right; width: 150px;'><strong>Trị giá (VNĐ)</strong></td>
            </tr>
            |<|seriesDetail|>|

            <tr>
                <td colspan='3' style='text-align: right;'><strong>|<|totalAmount|>|</strong></td>
            </tr>
        <table>
    `,
        seriesDetail: `
        <tr style='background-color: |<|seriesRowBgColor|>|;'>
            <td style='vertical-align: top;'>|<|series|>|</td>
            <td style='vertical-align: top;'>|<|prizeName|>|</td>
            <td style=' text-align: right; vertical-align: top;'>|<|prizeMoney|>|</td>
        </tr>
        `,
        noTax: `không cần đóng thuế
        thu nhập cá nhân và hưởng trọn số tiền trúng giải.`,
        withTax: `có trách nhiệm đóng thuế thu nhập cá nhân như sau:
        <table style='width: 100%'>
            <tr>
                <td style='text-align: left; vertical-align: top; width: 70px;'><strong>Vé số</strong></td>
                <td style='text-align: right; vertical-align: top;'><strong>Số tiền\nchịu thuế\n(VNĐ)</strong></td>
                <td style='text-align: right; vertical-align: top; width: 150px;'><strong>Số tiền\nnộp thuế\n(VNĐ)</strong></td>
            </tr>
            |<|taxDetail|>|
            <tr>
                <td colspan='3' style='text-align: right;'><strong>|<|totalTaxAmount|>|</strong></td>
            </tr>
        <table> 
        <p>Tổng số tiền thuế là: <strong>|<|totalTaxAmount|>| VNĐ (|<|totalTaxAmountInWord|>| đồng)</strong>.</p>
    `,
        taxDetail: `
        <tr style='background-color: |<|taxRowBgColor|>|;'>
            <td style='vertical-align: top;'>|<|series|>|</td>
            <td style='text-align: right; vertical-align: top;'>|<|taxableAmount|>|</td>
            <td style='text-align: right; vertical-align: top;'>|<|taxAmount|>|</td>
        </tr>
        `,
    },
};