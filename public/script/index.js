window.onload = async function () {
    let coreData = await Common.sendToBackend('/api/data/core');
    console.log(coreData);
    window.inputSeriesGrid = new InputSeriesGrid();
};

