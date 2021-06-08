window.addEventListener('load', async function () {
    window.touchDevice = isTouchDevice();
    let coreDataResult = await Common.sendToBackend('/api/data/core');
    window.coreTicketData = coreDataResult.data;
    window.inputSeriesManager = new InputSeriesManager();
});

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
};

