module.exports = {
    winner: {
        body: `
        <html style='width: 100%;>
        <head><meta charset="UTF-8"></head> 
        <body style='width: 100%;>
        <div style='margin-left: auto; margin-right: auto; width: 320px;'>
        Xin chúc mừng quý khách!!!<br/>
        Quý khách đã may mắn mua được vé trúng thưởng của kỳ xổ số 
        ngày |<|callDate|>|. Chi tiết trúng thưởng của quý khách như sau:<br/>
        <br/>
        |<|publisherDetail|>|
        <br/>
        Theo quy định của các công ty xổ số, quý khách có 30 ngày để 
        đổi vé lấy tiền trúng giải. Xin quý khách vui lòng đổi vé 
        trúng trước ngày |<|lastClaimDay|>|. Nếu quý khách dự định đổi 
        tại các đại lý gần nhà, xin quý khách lưu ý tránh đổi vé
        cận ngày do cần có thời gian để  đem tờ vé trúng đến nơi 
        phát hành (có thể bị từ chối do quá cận ngày và/hay chỉ đổi 
        vài tờ). Công ty xổ số luôn sẽ trao giải trong thời gian 
        quy định (trong vòng 30 ngày kể từ ngày xổ).<br/>
        <br/>
        Cũng theo quy định, người trúng xổ số sẽ cần phải đóng thuế 
        thu nhập cá nhân, áp dụng đối với trường hợp  giải thưởng có 
        giá trị từ 10 triệu đồng trở lên. Với giá trị giải thưởng trên,
        quý khách sẽ |<|taxSummary|>|<br/>
        <br/>
        Một lần nữa xin chức mừng quý khách! Chúc quý khách luôn tìm
        được nhiều niềm vui trong cuộc sống!<br/>
        Trân trọng,<br/>
        <br/>
        Quý khách nhận được thư này vì đã sử dụng dịch vụ báo vé trúng
        thưởng tại baotrungso.com. Nếu không phải là người nhận mong 
        muốn của thư này, mong quý bạn vui lòng bỏ quả sự cố này!
        <div>
        </body>
        </html>
        `,
        publisherDetail: `Đài |<|publisherName|>|:
        |<|seriesDetail|>|
        |<|totalAmount|>|
    `,
        seriesDetail: `|<|series|>| |<|prizeName|>| |<|prizeMoney|>|
        `,
        noTax: `không cần đóng thuế
        thu nhập cá nhân và hưởng trọn số tiền trúng giải.`,
        withTax: `có trách nhiệm đóng 
    thuế thu nhập cá nhân như sau:
        |<|taxDetail|>|
        |<|totalTaxAmount|>|
    `,
        taxDetail: `|<|series|>| |<|prizeMoney|>| |<|taxableAmount|>| |<|taxAmount|>|
        `,
    },
};