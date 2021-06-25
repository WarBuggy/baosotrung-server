window.addEventListener('load', function () {
    new Header();
    new Check();
    // Common.savePageTraffic(2);
});

class Check {
    constructor() {
        this.inputSerialObjectList = [];
        let defaultNumberSerialInput = 3;
        for (let i = 0; i < defaultNumberSerialInput; i++) {
            this.addAnInputSerial();
        }
        this.createControlButton();
    };

    addAnInputSerial() {
        let divContainer = document.createElement('div');
        divContainer.classList.add('check-input-serial-container');
        let anInputSerial = new InputNumber(null, null, 'Số vé');
        anInputSerial.input.min = 0;
        divContainer.appendChild(anInputSerial.div);
        let divInputSerialValidate = document.createElement('div');
        divInputSerialValidate.classList.add('validate');
        divContainer.appendChild(divInputSerialValidate);

        let divInputSerialOuter = document.getElementById('divInputSerialOuter');
        divInputSerialOuter.appendChild(divContainer);

        let anInputSerialObject = {
            input: anInputSerial,
            divValidate: divInputSerialValidate,
            divContainer,
            serial: null,
        }
        this.inputSerialObjectList.push(anInputSerialObject);
    };

    createControlButton() {
        let divControlGrid = document.getElementById('divControlGrid');
        let parent = this;
        let buttonAdd = new Button('Thêm số', true, false, function () {
            parent.addAnInputSerial();
            divControlGrid.scrollIntoView({ behavior: 'smooth' });

        });
        buttonAdd.div.style.justifySelf = 'start';
        buttonAdd.div.style.marginLeft = '12px';
        divControlGrid.appendChild(buttonAdd.div);

        let buttonCheck = new Button('Dò số', false, false, function () {
            parent.onButtonCheckClicked();
        });
        buttonCheck.div.style.justifySelf = 'end';
        buttonCheck.div.style.marginRight = '12px';
        divControlGrid.appendChild(buttonCheck.div);
    };

    onButtonCheckClicked() {
        let validateResult = this.validate();
        if (!validateResult) {
            return;
        }
        console.log('all ok');
    };

    validate() {
        let invalidSerialError = 'Số vé không hợp lệ.';
        let validCount = 0;
        let noSerialCount = 0;
        let invalidSerialCount = 0;
        for (let i = 0; i < this.inputSerialObjectList.length; i++) {
            let anObject = this.inputSerialObjectList[i];
            let anSerialInput = anObject.input;
            let serial = String(anSerialInput.input.value).trim();
            if (serial == '' || serial == 'null' || serial == 'undefined') {
                this.onValidOrEmptyInputSerial(anObject);
                anObject.serial = '';
                noSerialCount = noSerialCount + 1;
                continue;
            }
            if (serial.length != 6) {
                this.onInvalidInputSerial(anObject, invalidSerialError);
                invalidSerialCount = invalidSerialCount + 1;
                continue;
            }
            for (let j = 0; j < serial.length; j++) {
                let aChar = serial[j];
                if (!['0123456789'].includes(aChar)) {
                    this.onInvalidInputSerial(anObject, invalidSerialError);
                    invalidSerialCount = invalidSerialCount + 1;
                    continue;
                }
            }
            this.onValidOrEmptyInputSerial(anObject);
            anObject.serial = serial;
            validCount = validCount + 1;
        }
        this.handleEmptyInputSerial(validCount, invalidSerialCount, noSerialCount);
        if (invalidSerialCount == 0) {
            return true;
        }
        return false;
    };

    onInvalidInputSerial(anObject, message) {
        anObject.serial = null;
        anObject.input.setErrorStyle();
        anObject.divValidate.innerText = message;
        anObject.divValidate.style.display = 'block';
    };

    onValidOrEmptyInputSerial(anObject) {
        anObject.input.setStandardStyle();
        anObject.divValidate.style.display = 'none';
    };

    handleEmptyInputSerial(validCount, invalidSerialCount, noSerialCount) {
        let divInputSerialOuter = document.getElementById('divInputSerialOuter');
        if (noSerialCount == this.inputSerialObjectList.length) {
            for (let i = this.inputSerialObjectList.length - 1; i > 2; i--) {
                let anObject = this.inputSerialObjectList[i];
                divInputSerialOuter.removeChild(anObject.divContainer);
                this.inputSerialObjectList.splice(i, 1);
            }
            let firstObject = this.inputSerialObjectList[0];
            this.onInvalidInputSerial(firstObject, 'Xin nhập số vé cần dò!');
            return;
        }
        if (invalidSerialCount > 0 || validCount > 0) {
            for (let i = this.inputSerialObjectList.length - 1; i >= 0; i--) {
                let anObject = this.inputSerialObjectList[i];
                if (anObject.serial == '') {
                    divInputSerialOuter.removeChild(anObject.divContainer);
                    this.inputSerialObjectList.splice(i, 1);
                }
            }
        }
        if (invalidSerialCount > 0) {
            for (let i = 0; i < this.inputSerialObjectList.length; i++) {
                let anObject = this.inputSerialObjectList[i];
                if (anObject.serial != null) {
                    continue;
                }
                anObject.divContainer.scrollIntoView({ behavior: 'smooth' });
                break;
            }
        }
    };
};