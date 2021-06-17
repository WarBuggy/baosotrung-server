window.addEventListener('load', async function () {
    window.touchDevice = isTouchDevice();
    new Header();
    try {
        let coreDataResult = await Common.sendToBackend('/api/data/core');
        window.coreTicketData = coreDataResult.data;
        window.inputSeriesManager = new InputSeriesManager();
        Common.savePageTraffic(1);
    } catch (error) {
        console.log(error);
    }
});

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
};
