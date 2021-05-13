window.onload = async function () {
    let coreDataResult = await Common.sendToBackend('/api/data/core');
    window.coreTicketData = coreDataResult.data;
    window.inputSeriesManager = new InputSeriesManager();
};

