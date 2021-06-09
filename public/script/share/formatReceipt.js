class FormatReceipt {
    constructor(data) {
        this.content = data;
    };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormatReceipt;
}
else {
    window.FormatReceipt = FormatReceipt;
}
