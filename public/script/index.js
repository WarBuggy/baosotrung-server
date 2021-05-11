window.onload = async function () {
    window.coreData = await Common.sendToBackend('/api/data/core');
    window.inputSeriesGrid = new InputSeriesGrid();
};

