class InputSeriesManager {
    constructor() {
        this.inputSeries = [];
        this.alertDetail = {
            email: null,
            sms: null,
        };
        this.inputSeriesIndex = 0;
        this.createControlButton();
        this.createDeleteControlButton();
        this.insertAnInputSeries();
        this.createInputAlertEmail();
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
        let alertEmailOk = this.validateAlertEmail();
        let allOk = inputSeriesOk && alertEmailOk;
        if (inputSeriesOk == false) {
            return;
        }
        let parent = this;
        if (alertEmailOk == false) {
            this.scrollToBottom(function () {
                parent.inputAlertEmail.input.focus();
            });
        }
        if (allOk != true) {
            return;
        }
        this.sendData();
    };

    createInputAlertEmail() {
        let divAlertEmailOuter = document.getElementById('divAlertEmailOuter');
        this.inputAlertEmail = new InputText('inputAlertEmail', null, 'Email', 'Email');
        this.inputAlertEmail.input.setAttribute('autocorrect', 'off');
        this.inputAlertEmail.input.setAttribute('autocapitalize', 'none');
        this.inputAlertEmail.input.setAttribute('autocomplete', 'none');
        divAlertEmailOuter.appendChild(this.inputAlertEmail.div);
        this.divAlertEmailValidate = document.createElement('div');
        this.divAlertEmailValidate.classList.add('validate');
        this.divAlertEmailValidate.style.display = 'none';
        divAlertEmailOuter.appendChild(this.divAlertEmailValidate);
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

    validateAlertEmail() {
        let inputEmailString = 'Xin nhập email để nhận thông báo!';
        let inputEmailInvalid = 'Email không đúng định dạng!';
        let radioAlertEmail = document.getElementById('radioAlertEmail');
        let email = null;
        if (radioAlertEmail.checked == true) {
            email = this.inputAlertEmail.input.value;
            if (email == null) {
                this.showAlertEmailValidate(inputEmailString);
                return false;
            }
            email = email.toString().trim().toLowerCase();
            if (email == '') {
                this.showAlertEmailValidate(inputEmailString);
                return false;
            }
            if (Common.validateEmail(email) == false) {
                this.showAlertEmailValidate(inputEmailInvalid);
                return false;
            }
        }
        this.alertDetail.email = email;
        this.inputAlertEmail.setStandardStyle();
        this.divAlertEmailValidate.style.display = 'none';
        return true;
    }

    showAlertEmailValidate(text) {
        this.alertDetail.email = null;
        this.inputAlertEmail.setErrorStyle();
        this.divAlertEmailValidate.innerText = text;
        this.divAlertEmailValidate.style.display = 'block';
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
            email: this.alertDetail.email,
            sms: this.alertDetail.sms,
        };
        Common.sendToBackend('/api/alert', sendData);
    };
};