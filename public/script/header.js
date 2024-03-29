class Header {
    constructor() {
        this.addHeaderStyleSheet();
        this.addMenuAndBanner();
    };

    addHeaderStyleSheet() {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'css/header.css';
        document.getElementsByTagName('HEAD')[0].appendChild(link);
    };

    addMenuAndBanner() {
        let divMainTop = document.createElement('div');
        divMainTop.id = 'divMainTop';
        divMainTop.classList.add('head-top');

        let divMainTopMenu = document.createElement('div');
        divMainTopMenu.id = 'divMainTopMenu';
        divMainTopMenu.classList.add('header-top-menu');
        divMainTopMenu.innerText = 'Phiên bản thử nghiệm';
        divMainTop.appendChild(divMainTopMenu);

        let aHomepage = document.createElement('a');
        aHomepage.href = window.FRONTEND_URL;
        divMainTop.appendChild(aHomepage);

        let divMainBanner = document.createElement('div');
        divMainBanner.id = 'divMainBanner';
        divMainBanner.classList.add('header-banner');
        aHomepage.appendChild(divMainBanner);

        let firstElementInBody = document.body.firstChild;
        if (firstElementInBody != null) {
            document.body.insertBefore(divMainTop, document.body.firstChild);
        } else {
            document.body.appendChild(divMainTop);
        }
    };
};