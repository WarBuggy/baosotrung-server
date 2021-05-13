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
        divControlGrid.appendChild(buttonDelete.div);
        let buttonAdd = new Button('Thêm', true, function () {
            parent.insertAnInputSeries();
        });
        divControlGrid.appendChild(buttonAdd.div);
        let buttonSend = new Button('Gửi thông tin');
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
        document.getElementById('divInputSeriesControlGrid').
            scrollIntoView({ behavior: 'smooth' });
    };
};