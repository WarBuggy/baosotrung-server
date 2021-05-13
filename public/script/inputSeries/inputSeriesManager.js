class InputSeriesManager {
    constructor() {
        this.inputSeries = [];
        this.inputSeriesIndex = 0;
        this.insertAnInputSeries();
        this.createControlButton();
    };

    createControlButton() {
        let divControlGrid = document.getElementById('divInputSeriesControlGrid');
        let parent = this;
        let buttonDelete = new Button('Xóa', true);
        buttonDelete.div.style.width = 'min-content';
        buttonDelete.div.style.marginLeft = '0px';
        divControlGrid.appendChild(buttonDelete.div);
        let buttonAdd = new Button('Thêm', true, function () {
            parent.insertAnInputSeries();
        });
        buttonAdd.div.style.width = 'min-content';
        buttonAdd.div.style.marginLeft = '0px';
        divControlGrid.appendChild(buttonAdd.div);
        let buttonSend = new Button('Gửi thông tin');
        buttonSend.div.style.width = 'max-content';
        buttonSend.div.style.marginRight = '0px';
        divControlGrid.appendChild(buttonSend.div);
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
    };
};