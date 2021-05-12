class InputText {
    constructor(id, width, placeholder, label) {
        this.setupStyle();
        this.setupLabelAnimationParam();
        this.div = document.createElement('div');
        if (width != null) {
            this.div.style.width = width;
        }
        this.div.style.fontFamily = this.fontFamily;
        this.divInner = document.createElement('div');
        this.divInner.style.backgroundColor = this.backgroundColor;
        this.divInner.style.boxSizing = 'border-box';
        this.divInner.style.border = this.borderBlur;
        this.divInner.style.margin = this.marginBlur;
        this.divInner.style.borderRadius = '8px';
        this.divInner.style.padding = this.inputPadding + 'px';
        this.divInner.style.position = 'relative';
        this.div.appendChild(this.divInner);
        this.setupInput(id);
        this.setupPlaceholder(placeholder);
        this.setupLabel(label);
        this.setupEvent();
    };

    setupStyle() {
        this.fontFamily = 'Quicksand';
        this.focusColor = 'blue';
        this.blurColor = 'gray';
        this.borderFocus = '3px solid ' + this.focusColor;
        this.borderBlur = '2px solid ' + this.blurColor;
        this.marginBlur = '5px';
        this.marginFocus = '4px';
        this.backgroundColor = 'white';
        this.inputPadding = 12;
        this.inputFontSizeMax = 12;
    };

    setupLabelAnimationParam() {
        this.divLabelPadding = 4;
        this.labelAnimationInterval = 33;
        this.intervalNum = 6;
        this.topBlur = this.inputPadding;
        this.topFocus = -10;
        this.leftBlur = this.inputPadding - this.divLabelPadding;
        this.leftFocus = 8;
        this.fontSizeBlur = this.inputFontSizeMax;
        this.fontSizeFocus = 10;
        this.diffTopPerInterval = (this.topBlur - this.topFocus) / this.intervalNum;
        this.diffLeftPerInterval = (this.leftBlur - this.leftFocus) / this.intervalNum;
        this.diffFontSizePerInterval = (this.fontSizeBlur - this.fontSizeFocus) / this.intervalNum;
        this.currentIntervalNum = 1;
    };

    setupInput(id) {
        this.input = document.createElement('input');
        if (id != null) {
            this.input.id = id;
        }
        this.input.style.width = '200%';
        this.input.style.border = 'none';
        this.input.style.outline = 'none';
        this.input.style.boxSizing = 'border-box';
        this.input.style.backgroundColor = 'transparent';
        this.input.style.fontSize = this.inputFontSizeMax + 'pt';
        this.input.style.fontFamily = this.fontFamily;
        this.input.style.position = 'relative';
        let divInputOuter = document.createElement('div');
        divInputOuter.style.overflow = 'hidden';
        divInputOuter.appendChild(this.input);
        this.divInner.appendChild(divInputOuter);
    };

    setupPlaceholder(placeholder) {
        if (placeholder == null) {
            placeholder = '';
        }
        this.placeholder = placeholder;
        this.input.placeholder = this.placeholder;
    };

    setupEvent() {
        let parent = this;
        this.input.addEventListener('focus', function () {
            parent.divInner.style.border = parent.borderFocus;
            parent.divInner.style.margin = parent.marginFocus;
            if (parent.input.value == '') {
                parent.moveLabelUp();
            } else {
                parent.divLabel.style.color = parent.focusColor;
            }
        });
        this.input.addEventListener('blur', function () {
            parent.divInner.style.border = parent.borderBlur;
            parent.divInner.style.margin = parent.marginBlur;
            if (parent.input.value == '') {
                parent.moveLabelDown();
            } else {
                parent.divLabel.style.color = parent.blurColor;
            }
        });
    };

    setupLabel(label) {
        if (label == null) {
            label = this.placeholder;
        }
        this.divLabel = document.createElement('div');
        this.divLabel.innerText = label;
        this.divLabel.style.fontSize = this.inputFontSizeMax + 'pt';
        this.divLabel.style.color = this.blurColor;
        this.divLabel.style.position = 'absolute';
        this.divLabel.style.top = this.topBlur + 'px';
        this.divLabel.style.left = this.leftBlur + 'px';
        this.divLabel.style.backgroundColor = this.backgroundColor;
        this.divLabel.style.display = 'none';
        this.divLabel.style.paddingLeft = this.divLabelPadding + 'px';
        this.divLabel.style.paddingRight = this.divLabelPadding + 'px';
        this.divInner.appendChild(this.divLabel);
    };

    moveLabelUp() {
        this.input.placeholder = '';
        this.divLabel.style.display = 'block';
        this.divLabel.style.color = this.focusColor;
        let parent = this;
        window.clearInterval(this.intervalId);
        this.intervalId = window.setInterval(function () {
            if (parent.currentIntervalNum >= parent.intervalNum) {
                parent.divLabel.style.left = parent.leftFocus + 'px';
                parent.divLabel.style.top = parent.topFocus + 'px';
                parent.divLabel.style.fontSize = parent.fontSizeFocus + 'pt';
                window.clearInterval(parent.intervalId);
                return;
            }
            parent.divLabel.style.left =
                (parent.leftBlur - (parent.currentIntervalNum * parent.diffLeftPerInterval)) + 'px';
            parent.divLabel.style.top =
                (parent.topBlur - (parent.currentIntervalNum * parent.diffTopPerInterval)) + 'px';
            parent.divLabel.style.fontSize =
                (parent.fontSizeBlur - (parent.currentIntervalNum * parent.diffFontSizePerInterval)) + 'px';
            parent.currentIntervalNum = parent.currentIntervalNum + 1;
        }, this.labelAnimationInterval);
    };

    moveLabelDown() {
        let parent = this;
        this.divLabel.style.color = this.blurColor;
        window.clearInterval(this.intervalId);
        this.intervalId = window.setInterval(function () {
            if (parent.currentIntervalNum == 1) {
                parent.divLabel.style.left = parent.leftBlur + 'px';
                parent.divLabel.style.top = parent.topBlur + 'px';
                parent.divLabel.style.fontSize = parent.fontSizeBlur + 'pt';
                window.clearInterval(parent.intervalId);
                parent.input.placeholder = parent.placeholder;
                parent.divLabel.style.display = 'none';
                return;
            }
            parent.divLabel.style.left =
                (parent.leftBlur - (parent.currentIntervalNum * parent.diffLeftPerInterval)) + 'px';
            parent.divLabel.style.top =
                (parent.topBlur - (parent.currentIntervalNum * parent.diffTopPerInterval)) + 'px';
            parent.divLabel.style.fontSize =
                (parent.fontSizeBlur - (parent.currentIntervalNum * parent.diffFontSizePerInterval)) + 'px';
            parent.currentIntervalNum = parent.currentIntervalNum - 1;
        }, this.labelAnimationInterval);
    };
};
