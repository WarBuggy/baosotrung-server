class InputSeriesManager {
    constructor() {
        this.inputSeries = [];
        this.submissionDetail = {
            email: null,
            sms: null,
        };
        this.inputSeriesIndex = 0;
        this.createControlButton();
        this.createDeleteControlButton();
        this.insertAnInputSeries();
        this.createInputSubmissionEmail();
        this.createButtonSendInfo();
    };

    createControlButton() {
        let divControlGrid = document.getElementById('divInputSeriesControlGrid');
        let parent = this;
        this.buttonDelete = new Button('Xóa', true, false, function () {
            parent.showDivConfirmDelete();
        });
        this.buttonDelete.div.style.justifySelf = 'start';
        this.buttonDelete.div.style.marginLeft = '12px';
        divControlGrid.appendChild(this.buttonDelete.div);
        this.buttonDelete.div.style.display = 'none';
        let buttonAdd = new Button('Thêm số', true, false, function () {
            parent.insertAnInputSeries();
        });
        buttonAdd.div.style.justifySelf = 'end';
        buttonAdd.div.style.marginRight = '12px';
        divControlGrid.appendChild(buttonAdd.div);
    };

    createDeleteControlButton() {
        let divDeleteControlGrid = document.getElementById('divInputSeriesConfirmDelete');
        let parent = this;
        let buttonCancelDelete = new Button('Hủy', true, false, function () {
            parent.hideDivConfirmDelete();
        });
        buttonCancelDelete.div.classList.add('input-series-control-cancel-delete');
        divDeleteControlGrid.appendChild(buttonCancelDelete.div);
        this.buttonConfirmDelete = new Button('Xóa', false, false, function () {
            for (let i = parent.inputSeries.length - 1; i >= 0; i--) {
                let anInputSeries = parent.inputSeries[i];
                let isSelected = anInputSeries.getDivDeleteSelected();
                if (isSelected === 'false') {
                    continue;
                }
                document.getElementById('divInputSeriesParent').
                    removeChild(anInputSeries.div);
                parent.inputSeries.splice(i, 1);
            }
            parent.hideDivConfirmDelete();
            parent.checkButtonDelete();
        });
        this.buttonConfirmDelete.div.classList.add('input-series-control-confirm-delete');
        divDeleteControlGrid.appendChild(this.buttonConfirmDelete.div);
    };

    insertAnInputSeries() {
        let anInputSeries = this.createAnInputSeries();
        this.addInputSeries(anInputSeries);
    };

    createAnInputSeries() {
        let anInputSeries = new InputSeries(this.inputSeriesIndex);
        this.inputSeries.push(anInputSeries);
        this.inputSeriesIndex++;
        return anInputSeries;
    };

    addInputSeries(anInputSeries) {
        document.getElementById('divInputSeriesParent').
            appendChild(anInputSeries.div);
        this.scrollToBottom();
        this.checkButtonDelete();
    };

    hideDivConfirmDelete() {
        for (let i = 0; i < this.inputSeries.length; i++) {
            this.inputSeries[i].hideDivDelete();
        }
        document.getElementById('divInputSeriesControlGrid').style.display = 'grid';
        document.getElementById('divInputSeriesConfirmDelete').style.display = 'none';
        document.getElementById('divInputDetail').style.display = 'block';
        document.getElementById('divSendInfoOuter').style.display = 'block';
        this.buttonConfirmDelete.div.style.display = 'none';
        this.scrollToBottom();
    };

    showDivConfirmDelete() {
        for (let i = 0; i < this.inputSeries.length; i++) {
            this.inputSeries[i].showDivDelete();
        }
        document.getElementById('divInputSeriesControlGrid').style.display = 'none';
        document.getElementById('divInputSeriesConfirmDelete').style.display = 'grid';
        document.getElementById('divInputDetail').style.display = 'none';
        document.getElementById('divSendInfoOuter').style.display = 'none';
    };

    checkButtonDelete() {
        if (this.inputSeries.length > 1) {
            this.buttonDelete.div.style.display = 'block';
            return;
        }
        this.buttonDelete.div.style.display = 'none';
    };

    checkButtonConfirmDelete() {
        for (let i = 0; i < this.inputSeries.length; i++) {
            let anInputSeries = this.inputSeries[i];
            let selected = anInputSeries.getDivDeleteSelected();
            if (selected === 'true') {
                this.buttonConfirmDelete.div.style.display = 'block';
                return;
            }
        }
        this.buttonConfirmDelete.div.style.display = 'none';
    };

    onButtonSendClicked() {
        let inputSeriesOk = this.validateInputSeries();
        let submissionEmailOk = this.validateSubmissionEmail();
        let allOk = inputSeriesOk && submissionEmailOk;
        if (inputSeriesOk == false) {
            return;
        }
        let parent = this;
        if (submissionEmailOk == false) {
            this.scrollToBottom(function () {
                parent.inputSubmissionEmail.input.focus();
            });
        }
        if (allOk != true) {
            return;
        }
        this.sendData();
    };

    createInputSubmissionEmail() {
        let divSubmissionEmailOuter = document.getElementById('divSubmissionEmailOuter');
        this.inputSubmissionEmail = new InputText('inputSubmissionEmail', null, 'Email', 'Email');
        this.inputSubmissionEmail.input.setAttribute('autocorrect', 'off');
        this.inputSubmissionEmail.input.setAttribute('autocapitalize', 'none');
        this.inputSubmissionEmail.input.setAttribute('autocomplete', 'none');
        divSubmissionEmailOuter.appendChild(this.inputSubmissionEmail.div);
        let localStorageSubmissionEmail = Common.loadFromStorage('index_submissionEmail');
        if (localStorageSubmissionEmail != null) {
            this.inputSubmissionEmail.input.value = localStorageSubmissionEmail;
        }

        this.divSubmissionEmailValidate = document.createElement('div');
        this.divSubmissionEmailValidate.classList.add('validate');
        this.divSubmissionEmailValidate.style.display = 'none';
        divSubmissionEmailOuter.appendChild(this.divSubmissionEmailValidate);
    };

    createButtonSendInfo() {
        let parent = this;
        let buttonSend = new Button('Gửi thông báo khi trúng số', false, false, function () {
            parent.onButtonSendClicked();
        });
        document.getElementById('divSendInfoOuter')
            .appendChild(buttonSend.div);
    };

    scrollToBottom(callback) {
        document.getElementById('divInputSeriesControlGrid').
            scrollIntoView({ behavior: 'smooth' });
        if (callback) {
            let timeoutId = window.setTimeout(function () {
                window.clearTimeout(timeoutId);
                callback();
            }, 300);
        }
    };

    validateSubmissionEmail() {
        let inputEmailString = 'Xin nhập email để nhận thông báo!';
        let inputEmailInvalid = 'Email không đúng định dạng!';
        let radioSubmissionEmail = document.getElementById('radioSubmissionEmail');
        let email = null;
        if (radioSubmissionEmail.checked == true) {
            email = this.inputSubmissionEmail.input.value;
            if (email == null) {
                this.showSubmissionEmailValidate(inputEmailString);
                return false;
            }
            email = email.toString().trim().toLowerCase();
            if (email == '') {
                this.showSubmissionEmailValidate(inputEmailString);
                return false;
            }
            if (Common.validateEmail(email) == false) {
                this.showSubmissionEmailValidate(inputEmailInvalid);
                return false;
            }
        }
        this.submissionDetail.email = email;
        this.inputSubmissionEmail.setStandardStyle();
        this.divSubmissionEmailValidate.style.display = 'none';
        return true;
    }

    showSubmissionEmailValidate(text) {
        this.submissionDetail.email = null;
        this.inputSubmissionEmail.setErrorStyle();
        this.divSubmissionEmailValidate.innerText = text;
        this.divSubmissionEmailValidate.style.display = 'block';
    };

    validateInputSeries() {
        if (this.inputSeries.length < 1) {
            this.insertAnInputSeries();
        }
        let inputSeriesOk = true;
        for (let i = 0; i < this.inputSeries.length; i++) {
            let anInputSeries = this.inputSeries[i];
            let anInputSeriesValidate = anInputSeries.validate();
            if (anInputSeriesValidate.result === true) {
                continue;
            }
            if (inputSeriesOk === true) {
                anInputSeries.div.scrollIntoView({ behavior: 'smooth' });
                if (anInputSeriesValidate.publisher == true &&
                    anInputSeriesValidate.input == false) {
                    let timeoutId = window.setTimeout(function () {
                        anInputSeries.inputSeries.input.focus();
                        window.clearTimeout(timeoutId);
                    }, 300);
                }
            }
            inputSeriesOk = false;
        }
        return inputSeriesOk;
    };

    async sendData() {
        this.saveInputSeriesManagerToLocalStorage();
        let seriesData = [];
        for (let i = 0; i < this.inputSeries.length; i++) {
            let anInputSeries = this.inputSeries[i];
            let aString = anInputSeries.value.ticketType + ',' +
                anInputSeries.value.date + ',' +
                anInputSeries.value.publisher + ',' +
                anInputSeries.value.serial;
            seriesData.push(aString);
        }
        let seriesString = seriesData.join('|||');
        let sendData = {
            count: this.inputSeries.length,
            seriesString,
            email: this.submissionDetail.email,
            sms: this.submissionDetail.sms,
        };
        try {
            let response = await Common.sendToBackend('/api/submission/create', sendData);
            window.location.href = window.FRONTEND_URL +
                '/tomtatbaotrungso.html?submission=' + response.submission;
        } catch (error) {
        }
    };

    saveInputSeriesManagerToLocalStorage() {
        let object = {
            index_submissionEmail: this.submissionDetail.email,
        };
        Common.saveToStorage(object);
    };
};