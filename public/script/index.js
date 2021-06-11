window.addEventListener('load', async function () {
    window.touchDevice = isTouchDevice();
    try {
        let coreDataResult = await Common.sendToBackend('/api/data/core');
        window.coreTicketData = coreDataResult.data;
        window.inputSeriesManager = new InputSeriesManager();
    } catch (error) {
    }
});

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
};

