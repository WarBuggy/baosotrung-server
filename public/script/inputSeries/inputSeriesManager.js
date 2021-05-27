class InputSeriesManager {
    constructor() {
        this.inputSeries = [];
        this.inputSeriesIndex = 0;
        this.insertAnInputSeries();
        this.createControlButton();
        this.createDeleteControlButton();
    };

    createControlButton() {
        let divControlGrid = document.getElementById('divInputSeriesControlGrid');
        let parent = this;
        let buttonDelete = new Button('Xóa', true, function () {
            parent.showDivConfirmDelete();
        });
        divControlGrid.appendChild(buttonDelete.div);
        let buttonAdd = new Button('Thêm số', true, function () {
            parent.insertAnInputSeries();
        });
        buttonAdd.div.classList.add('input-series-control-grid-add');
        divControlGrid.appendChild(buttonAdd.div);
        let buttonSend = new Button('Gửi thông tin');
        divControlGrid.appendChild(buttonSend.div);
    };

    createDeleteControlButton() {
        let divDeleteControlGrid = document.getElementById('divInputSeriesConfirmDelete');
        let parent = this;
        let buttonDeleteCancel = new Button('Hủy', true, function () {
            parent.hideDivConfirmDelete();
        });
        buttonDeleteCancel.div.classList.add('input-series-control-delete-cancel');
        divDeleteControlGrid.appendChild(buttonDeleteCancel.div);
        let buttonDeleteConfirm = new Button('Xóa', false, function () {
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
        });
        buttonDeleteConfirm.div.classList.add('input-series-control-delete-confirm');
        divDeleteControlGrid.appendChild(buttonDeleteConfirm.div);
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
};