window.addEventListener('load', function () {
    new Receipt();
});

class Receipt {
    constructor() {
        let submission = String(Common.getURLParameter('submission')).trim();
        if (submission == 'null' || submission == 'undefined' || submission == '') {
            this.showSummary();
            this.onNoSubmissionFound();
            return;
        }
        this.addSubmissionData(submission);
        this.handleShareButton(submission);
    };

    showSummaryAndShare() {
        document.getElementById('divLoading').style.display = 'none';
        document.getElementById('divSummary').style.display = 'block';
        document.getElementById('divShare').style.display = 'grid';
    };

    onNoSubmissionFound() {
        let divSummary = document.getElementById('divSummary');
        divSummary.style.color = 'red';
        divSummary.innerText = 'Lỗi: Không đủ dữ liệu để tìm thông tin.';
    };

    async addSubmissionData(submission) {
        let sendData = {
            submission,
        };
        let response = await Common.sendToBackend('/api/submission', sendData);
        let formatReceipt = new FormatReceipt(response.submissionDetail);
        this.showSummaryAndShare();
        document.getElementById('divSummary').innerHTML = formatReceipt.html;
    };

    handleShareButton(submission) {
        let link = 'https://baotrungso.com/receipt?submission=' + submission;
        document.getElementById('divShareFB').onclick = function () {
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + link,
                'popup', 'width=300,height=300');
            return false;
        };

        document.getElementById('divShareTwitter').onclick = function () {
            window.open('https://twitter.com/intent/tweet?url=' + link,
                'popup', 'width=300,height=300');
            return false;
        };

        this.copyTimeoutId = null;
        let parent = this;
        document.getElementById('divCopyLink').onclick = function () {
            Common.copyTextToClipboard(link, function () {
                window.clearTimeout(parent.copyTimeoutId);
                document.getElementById('divCopyLink').style.backgroundImage =
                    'url(res/image/required/tick.png)';
                parent.copyTimeoutId = window.setTimeout(function () {
                    document.getElementById('divCopyLink').style.backgroundImage =
                        'url(res/image/required/share_link.png)';
                }, 1500);
            });
        };

        document.getElementById('divShareEmail').onclick = function () {

        };
    };
};
