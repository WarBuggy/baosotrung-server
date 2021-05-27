class InputSeriesManager {
    constructor() {
        this.inputSeries = [];
        this.inputSeriesIndex = 0;
        this.createControlButton();
        this.createDeleteControlButton();
        this.insertAnInputSeries();
    };

    createControlButton() {
        let divControlGrid = document.getElementById('divInputSeriesControlGrid');
        let parent = this;
        this.buttonDelete = new Button('Xóa', true, true, function () {
            parent.showDivConfirmDelete();
        });
        divControlGrid.appendChild(this.buttonDelete.div);
        let buttonAdd = new Button('Thêm số', true, false, function () {
            parent.insertAnInputSeries();
        });
        buttonAdd.div.classList.add('input-series-control-grid-add');
        divControlGrid.appendChild(buttonAdd.div);
        let buttonSend = new Button('Gửi thông tin', false, false, function () {
            parent.onButtonSendClicked();
        });
        divControlGrid.appendChild(buttonSend.div);
    };

    createDeleteControlButton() {
        let divDeleteControlGrid = document.getElementById('divInputSeriesConfirmDelete');
        let parent = this;
        let buttonCancelDelete = new Button('Hủy', true, false, function () {
            parent.hideDivConfirmDelete();
        });
        buttonCancelDelete.div.classList.add('input-series-control-cancel-delete');
        divDeleteControlGrid.appendChild(buttonCancelDelete.div);
        this.buttonConfirmDelete = new Button('Xóa', false, true, function () {
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
        document.getElementById('divInputSeriesControlGrid').
            scrollIntoView({ behavior: 'smooth' });
        this.checkButtonDelete();
    };

    hideDivConfirmDelete() {
        for (let i = 0; i < this.inputSeries.length; i++) {
            this.inputSeries[i].hideDivDelete();
        }
        document.getElementById('divInputSeriesControlGrid').style.display = 'grid';
        document.getElementById('divInputSeriesConfirmDelete').style.display = 'none';
    };

    showDivConfirmDelete() {
        for (let i = 0; i < this.inputSeries.length; i++) {
            this.inputSeries[i].showDivDelete();
        }
        document.getElementById('divInputSeriesControlGrid').style.display = 'none';
        document.getElementById('divInputSeriesConfirmDelete').style.display = 'grid';
    };

    checkButtonDelete() {
        if (this.inputSeries.length > 1) {
            this.buttonDelete.enable();
            return;
        }
        this.buttonDelete.disable();
    };

    checkButtonConfirmDelete() {
        for (let i = 0; i < this.inputSeries.length; i++) {
            let anInputSeries = this.inputSeries[i];
            let selected = anInputSeries.getDivDeleteSelected();
            if (selected === 'true') {
                this.buttonConfirmDelete.enable();
                return;
            }
        }
        this.buttonConfirmDelete.disable();
    };

    onButtonSendClicked() {
        let allOk = true;
        for (let i = 0; i < this.inputSeries.length; i++) {
            let anInputSeries = this.inputSeries[i];
            let aValidation = anInputSeries.validate();
            if (aValidation === false) {
                allOk = false;
            }
        }
        console.log(allOk);
    };
};