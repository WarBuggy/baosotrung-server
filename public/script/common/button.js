class Button {
    constructor(label, inverted, disabled, onclickFunction) {
        this.colorStandard = {
            color: 'white',
            bgColor: 'cornflowerblue',
            hoverColor: 'white',
            hoverBgColor: 'blue',
        };
        this.colorInverted = {
            color: 'cornflowerblue',
            bgColor: 'yellow',
            hoverColor: 'rgb(0, 0, 255)',
            hoverBgColor: 'transparent',
        };
        this.div = document.createElement('div');
        this.div.classList.add('button');
        if (inverted === true) {
            this.div.classList.add('inverted');
        }
        this.setupColor(inverted);
        this.effectExpanding = false;
        this.mouseDownDetected = false;
        this.mouseUpDetected = false;
        let parent = this;
        if (typeof (onclickFunction) === 'function') {
            this.divEffect = document.createElement('div');
            this.divEffect.classList.add('button-effect');
            this.div.appendChild(this.divEffect);
            this.div.onmousedown = function (event) {
                if (parent.effectExpanding === true) {
                    return;
                }
                parent.mouseDownDetected = true;
                parent.startEffect(event, onclickFunction);
            };
            this.div.onmouseup = function () {
                if (parent.mouseDownDetected !== true) {
                    return;
                }
                if (parent.effectExpanding !== true) {
                    parent.mouseUpDetected = false;
                    parent.mouseDownDetected = false;
                    onclickFunction();
                    document.activeElement.blur();
                    return;
                }
                parent.mouseUpDetected = true;
            };
        }
        if (disabled === true) {
            this.div.classList.add('disabled');
        }
        this.divText = document.createElement('div');
        this.divText.classList.add('button-text');
        this.divText.innerText = label;
        this.div.appendChild(this.divText);
    };

    startEffect(event, callback) {
        this.effectExpanding = true;
        let rect = this.div.getBoundingClientRect();
        let left = event.pageX - rect.left - window.scrollX;
        let top = event.pageY - rect.top - window.scrollY;
        let maxDimension = Math.max(rect.width, rect.height);
        let targetLength = maxDimension * 2.5;
        let interval = 16;
        let intervalNum = 25;
        let currentIntervalNum = 1;
        let diffDimension = targetLength / intervalNum;
        let parent = this;
        let intervalId = window.setInterval(function () {
            let length = currentIntervalNum * diffDimension;
            parent.divEffect.style.width = length + 'px';
            parent.divEffect.style.height = length + 'px';
            parent.divEffect.style.left = (left - (length / 2)) + 'px';
            parent.divEffect.style.top = (top - (length / 2)) + 'px';
            currentIntervalNum = currentIntervalNum + 1;
            if (currentIntervalNum == intervalNum) {
                window.clearInterval(intervalId);
                parent.effectExpanding = false;
                parent.divEffect.style.width = '0px';
                parent.divEffect.style.height = '0px';
                if (parent.mouseUpDetected === true) {
                    parent.mouseUpDetected = false;
                    parent.mouseDownDetected = false;
                    callback();
                }
            }
        }, interval);
    };

    disable() {
        if (!this.div.classList.contains('disabled')) {
            this.div.classList.add('disabled');
        }
    };

    enable() {
        if (this.div.classList.contains('disabled')) {
            this.div.classList.remove('disabled');
        }
    };

    setupColor(inverted) {
        let colorObject = this.colorStandard;
        if (inverted === true) {
            colorObject = this.colorInverted;
        }
        this.div.style.backgroundColor = colorObject.bgColor;
        this.div.style.color = colorObject.color;
        if (window.touchDevice === true) {
            return;
        }
        this.div.onmouseover = function () {
            this.style.backgroundColor = colorObject.hoverBgColor;
            this.style.color = colorObject.hoverColor;
        };
        this.div.onmouseout = function () {
            this.style.backgroundColor = colorObject.bgColor;
            this.style.color = colorObject.color;
        };
    };
};
