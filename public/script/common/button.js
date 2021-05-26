class Button {
    constructor(label, inverted, onclickFunction) {
        this.div = document.createElement('div');
        this.div.classList.add('button');
        if (inverted === true) {
            this.div.classList.add('inverted');
        }
        this.effectExpanding = false;
        let parent = this;
        if (typeof (onclickFunction) === 'function') {
            this.divEffect = document.createElement('div');
            this.divEffect.classList.add('button-effect');
            this.div.appendChild(this.divEffect);
            this.div.onmousedown = function (event) {
                if (parent.effectExpanding === true) {
                    return;
                }
                parent.startEffect(event);
            };
            this.div.onmouseup = function () {
                onclickFunction();
            };
        } else {
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
        let left = event.pageX - rect.left;
        let top = event.pageY - rect.top;
        let maxDimension = Math.max(rect.width, rect.height);
        let targetLength = maxDimension * 2.5;
        let interval = 16;
        let intervalNum = 20;
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
                if (callback != null) {
                    callback();
                }
            }
        }, interval);
    };
};
