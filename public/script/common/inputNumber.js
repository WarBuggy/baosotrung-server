class InputNumber extends InputText {
    constructor(width, row, id, placeholder, label) {
        super(width, row, id, placeholder, label);
        this.input.type = 'number';
        this.input.addEventListener('onkeyup', function () {
            if (this.value == '') {
                this.value = '';
            }
        });
    };
};