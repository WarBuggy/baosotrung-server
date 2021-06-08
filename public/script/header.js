window.addEventListener('load', function () {
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'css/header.css';
    document.getElementsByTagName('HEAD')[0].appendChild(link);
    new Header();
});
class Header {
    constructor() {

    };
};