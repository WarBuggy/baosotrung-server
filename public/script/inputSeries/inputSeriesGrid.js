class InputSeriesGrid {
    constructor() {
        this.div = document.createElement('div');
        this.div.id = 'divInputSeriesGrid';
        this.div.classList.add('input-series-parent-grid');
        this.firstInputSeries = this.addInputSeries();

        document.getElementById('divMainInputSeriesOuter').
            appendChild(this.div);
    }

    addInputSeries() {
        let aInputSeries = new InputSeries();
        this.div.appendChild(aInputSeries.div);
        return aInputSeries;
    };
};