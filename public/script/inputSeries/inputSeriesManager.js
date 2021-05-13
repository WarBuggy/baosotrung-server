class InputSeriesManager {
    constructor() {
        this.div = document.createElement('div');
        this.div.id = 'divInputSeriesParent';
        this.div.classList.add('input-series-parent');
        document.getElementById('divMainInputSeriesOuter').
            appendChild(this.div);

        this.inputSeries = [];
        let firstInputSeries = this.createAnInputSeries();
        this.addInputSeries(firstInputSeries);
    };

    createAnInputSeries() {
        let anInputSeries = new InputSeries();
        this.inputSeries.push(anInputSeries);
        return anInputSeries;
    };

    addInputSeries(anInputSeries) {
        this.div.appendChild(anInputSeries.div);
    };


};