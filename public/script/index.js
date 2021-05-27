window.onload = async function () {
    window.touchDevice = isTouchDevice();
    console.log(window.touchDevice);
    let coreDataResult = await Common.sendToBackend('/api/data/core');
    window.coreTicketData = coreDataResult.data;
    window.inputSeriesManager = new InputSeriesManager();
};

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
};

