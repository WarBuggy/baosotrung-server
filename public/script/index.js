window.onload = async function () {
    let coreDataResult = await Common.sendToBackend('/api/data/core');
    window.coreData = coreDataResult.data;
    window.inputSeriesGrid = new InputSeriesGrid();
};

