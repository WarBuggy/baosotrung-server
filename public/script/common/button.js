class Button {
    constructor(label, inverted, onclickFunction) {
        this.div = document.createElement('div');
        this.div.classList.add('button');
        if (inverted === true) {
            this.div.classList.add('inverted');
        }
        this.div.innerText = label;
        if (typeof (onclickFunction) === 'function') {
            this.div.addEventListener('click', onclickFunction);
        } else {
            this.div.classList.add('disabled');
        }
    };
};