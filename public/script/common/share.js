class Share {
    constructor(
        divParent,
        link,
    ) {
        this.copyTimeoutId = null;
        this.emailTimeoutId = null;
        this.createDivs(divParent);
        this.handleShareFB(link);
        this.handleShareTwitter(link);
        this.handleShareLink(link);
        this.handleShareEmail(link, api);

    };

    createDivs(divParent) {
        let divShare = document.createElement('div');
        divShare.id = 'divShare';
        divShare.classList.add('general-share');
        divParent.appendChild(divShare);

        let divShareFB = document.createElement('div');
        divShareFB.id = 'divShareFB';
        divShareFB.classList.add('share-fb');
        divShareFB.style['justify-self'] = 'start';
        divShare.appendChild(divShareFB);

        let divShareTwitter = document.createElement('div');
        divShareTwitter.id = 'divShareTwitter';
        divShareTwitter.classList.add('share-twitter');
        divShare.appendChild(divShareTwitter);

        let divCopyLink = document.createElement('div');
        divCopyLink.id = 'divCopyLink';
        divCopyLink.classList.add('share-link');
        divShare.appendChild(divCopyLink);

        let divShareEmail = document.createElement('div');
        divShareEmail.id = 'divShareEmail';
        divShareEmail.classList.add('share-email');
        divShareEmail.style['justify-self'] = 'end';
        divShare.appendChild(divShareEmail);


        let divCopyLink = document.createElement('div');
        divCopyLink.id = 'divCopyLink';
        divCopyLink.classList.add('share-link');
        divShare.appendChild(divCopyLink);

        let divInputShareEmail = document.createElement('div');
        divInputShareEmail.id = 'divInputShareEmail';
        divInputShareEmail.classList.add('general-input-share-email');
        divParent.appendChild(divInputShareEmail);

        let divInputShareEmailValidate = document.createElement('div');
        divInputShareEmailValidate.id = 'divInputShareEmailValidate';
        divInputShareEmailValidate.classList.add('validate');
        divInputShareEmailValidate.classList.add('general-validate-share-email');
        divParent.appendChild(divInputShareEmailValidate);
    };

    handleShareFB(link) {
        document.getElementById('divShareFB').onclick = function () {
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + link,
                'popup', 'width=300,height=300');
            return false;
        };
    };

    handleShareTwitter(link) {
        document.getElementById('divShareTwitter').onclick = function () {
            window.open('https://twitter.com/intent/tweet?url=' + link,
                'popup', 'width=300,height=300');
            return false;
        };
    };

    handleShareLink(link) {
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
    };

    handleShareEmail() {
        document.getElementById('divShareEmail').onclick = function () {
            let divInputShareEmail = document.getElementById('divInputShareEmail');
            if (divInputShareEmail.style.display == 'none') {
                divInputShareEmail.style.display = 'grid';
                parent.inputEmail.input.focus();
            } else {
                divInputShareEmail.style.display = 'none';
            }
        };
    };

    populateDivInputShareEmail(submission) {
        let parent = this;

        let divInputShareEmail = document.getElementById('divInputShareEmail');
        divInputShareEmail.style.display = 'none';
        this.inputEmail = new InputText(null, null, 'Email');
        this.inputEmail.div.style.marginTop = '8px';
        this.inputEmail.div.style.alignSelf = 'center';
        this.inputEmail.input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                parent.onButtonShareEmailClicked(submission);
            };
        });
        divInputShareEmail.appendChild(this.inputEmail.div);
        let localStorageShareEmail = Common.loadFromStorage('receipt_shareEmail');
        if (localStorageShareEmail != null) {
            this.inputEmail.input.value = localStorageShareEmail;
        }

        let buttonShareEmail = new Button('Gửi', false, false, function () {
            parent.onButtonShareEmailClicked(submission);
        });
        buttonShareEmail.div.style.justifySelf = 'end';
        buttonShareEmail.div.style.alignSelf = 'center';
        buttonShareEmail.div.style.margin = '14px 6px 6px 6px';
        divInputShareEmail.appendChild(buttonShareEmail.div);
    };

    onButtonShareEmailClicked(submission) {
        let checkResult = this.checkInputShareEmail();
        if (checkResult.success == false) {
            return;
        }
        Common.saveToStorage({
            receipt_shareEmail: checkResult.email,
        });
        this.sendShareEmail(submission, checkResult.email);
    };

    checkInputShareEmail() {
        let inputEmail = String(this.inputEmail.input.value).trim();
        let divInputEmailValidate = document.getElementById('divInputShareEmailValidate');
        if (inputEmail == '' || inputEmail == 'null' || inputEmail == 'undefined') {
            divInputEmailValidate.innerText = 'Xin nhập email để gửi tóm tắt trên!';
            divInputEmailValidate.style.display = 'block';
            return { success: false, };
        }
        let emailPart = inputEmail.split(',');
        for (let i = 0; i < emailPart.length; i++) {
            let anEmail = emailPart[i].trim();
            let anEmailValidateResult = Common.validateEmail(anEmail);
            if (anEmailValidateResult == false) {
                divInputEmailValidate.innerText = 'Có ít nhất 1 email không đúng định dạng.';
                divInputEmailValidate.style.display = 'block';
                return { success: false, };
            }
            emailPart[i] = anEmail;
        }
        divInputEmailValidate.style.display = 'none';
        return {
            success: true,
            email: emailPart.join(','),
        };
    };

    async sendShareEmail(submission, email) {
        let sendData = {
            submission,
            email,
        };
        try {
            await Common.sendToBackend('baotrungso/api/submission/share/email', sendData);
            this.inputEmail.input.value = '';
            document.getElementById('divInputShareEmail').style.display = 'none';
            window.clearTimeout(this.emailTimeoutId);
            document.getElementById('divShareEmail').style.backgroundImage =
                'url(res/image/required/tick.png)';
            this.emailTimeoutId = window.setTimeout(function () {
                document.getElementById('divShareEmail').style.backgroundImage =
                    'url(res/image/required/share_email.svg)';
            }, 1500);
        } catch (error) {
        }
    };
};
