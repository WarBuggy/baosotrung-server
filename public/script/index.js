window.onload = async function () {
    window.coreData = await Common.sendToBackend('/api/data/core').data;
    window.inputSeriesGrid = new InputSeriesGrid();
};

