window.addEventListener('load', function () {
    new Header();
    new ResultLog();
    // Common.savePageTraffic(1);
});

class ResultLog {
    constructor() {
        this.data = {
            ticketType: null,
            dayOfWeek: null,
            week: null,
            date: null,
        };
        this.currentDateString = null;
        this.addEventListener();
        if (document.location.search.length > 0) {
            this.handleURLParamType();
            this.handleURLParamDate();
        }
        this.handleShareButton();
        this.getData();
    };

    addEventListener() {
        this.addClickEventListener('result-log-ticket-type-item',
            'click', 'ticket-type', 'ticketType');
        this.addClickEventListener('result-log-day-of-week-item',
            'click', 'day-of-week', 'dayOfWeek');
        this.addClickEventListener('result-log-week-item',
            'click', 'week', 'week');
    };

    handleURLParamDate() {
        let date = String(Common.getURLParameter('date')).trim();
        if (date == 'null' || date == 'undefined' || date == '') {
            return;
        }
        this.data.date = date;
        return;
    };

    handleURLParamType() {
        let type = String(Common.getURLParameter('type')).trim();
        if (type == 'null' || type == 'undefined' || type == '') {
            return;
        }
        let possibleValueList = ['1',];
        if (!possibleValueList.includes(type)) {
            type = possibleValueList[0];
        }
        this.data.ticketType = type;
        return;
    };

    async getData() {
        console.log(this.data);
        let response = await Common.sendToBackend('/api/result-log/data', this.data);
        console.log(response);
        this.data.ticketType = response.ticketType;
        this.data.dayOfWeek = response.dayOfWeek;
        this.data.week = response.week;
        this.matchDisplayClickWithData('result-log-ticket-type-item',
            'click', 'ticket-type', 'ticketType');
        this.matchDisplayClickWithData('result-log-day-of-week-item',
            'click', 'day-of-week', 'dayOfWeek');
        this.matchDisplayClickWithData('result-log-week-item',
            'click', 'week', 'week');
        document.getElementById('divDate').innerText = response.vnDateString;
        let checkResult = this.checkResponse(response);
        if (checkResult == true) {
            this.displayData(response.data);
        }
        this.toggleDivLoading(false, checkResult);
        this.currentDateString = response.targetDateString;
    };

    displayClick(divList, div, clickClass) {
        for (let i = 0; i < divList.length; i++) {
            let aDiv = divList[i];
            aDiv.classList.remove(clickClass);
        }
        div.classList.add(clickClass);
    };

    addClickEventListener(className, clickClassName, attributeName, parentAttributeName) {
        let parent = this;
        let divList = document.getElementsByClassName(className);
        for (let i = 0; i < divList.length; i++) {
            let aDiv = divList[i];
            aDiv.addEventListener('click', function () {
                parent.data.date = null;
                parent.toggleDivLoading(true);
                parent.displayClick(divList, this, clickClassName);
                let attribute = this.getAttribute(attributeName);
                parent.data[parentAttributeName] = attribute;
                parent.getData();
            });
        }
    };

    matchDisplayClickWithData(className, clickClassName, attributeName, parentAttributeName) {
        let divList = document.getElementsByClassName(className);
        for (let i = 0; i < divList.length; i++) {
            let aDiv = divList[i];
            aDiv.classList.remove(clickClassName);
            if (aDiv.getAttribute(attributeName) == this.data[parentAttributeName]) {
                aDiv.classList.add(clickClassName);
            }
        }
    };

    toggleDivLoading(showDivLoading, showDivShare) {
        let divLoading = document.getElementById('divLoading');
        let divData = document.getElementById('divData');
        let divDateOuter = document.getElementById('divDateOuter');
        let divShare = document.getElementById('divShare');
        if (showDivLoading === true) {
            divLoading.style.display = 'grid';
            divData.style.display = 'none';
            divDateOuter.style.display = 'none';
            divShare.style.display = 'none';
            return;
        }
        divLoading.style.display = 'none';
        divData.style.display = 'grid';
        divDateOuter.style.display = 'grid';
        if (showDivShare == true) {
            divShare.style.display = 'grid';
            divShare.scrollIntoView({ behavior: 'smooth' });
        }
    };

    checkResponse(response) {
        let divData = document.getElementById('divData');
        divData.innerHTML = '';
        let code = response.code;
        if (code == 1) {
            let message = 'Chưa có kết quả xổ số cho ngày này. Xin quý khách vui lòng kiểm lại sau!';
            divData.appendChild(this.createDivDataMessage(divData, message));
            return false;
        }
        if (code == 2) {
            let message = 'Tham số ngày không hợp lệ. Xin quý khách vui lòng kiểm lại đường link!';
            divData.appendChild(this.createDivDataMessage(divData, message));
            return false;
        }
        if (code == 3) {
            let message = 'Tham số loại vé không hợp lệ. Xin quý khách vui lòng kiểm lại đường link!';
            divData.appendChild(this.createDivDataMessage(divData, message));
            return false;
        }
        if (code != 0) {
            let message = 'Hệ thống gặp lỗi ' + code + '_' + response.secondTime +
                ' khi truy cập dữ liệu. Xin quý khách vui lòng thử lại sau!';
            divData.appendChild(this.createDivDataMessage(divData, message));
            return false;
        }
        if (response.data.length < 1) {
            let message = 'Hệ thống không thể tìm được kết quả xổ số cho ngày này. ' +
                'Xin lưu ý hệ thống không lưu kết quả của những năm trước 2010.';
            divData.appendChild(this.createDivDataMessage(divData, message));
            return false;
        }
        return true;
    };


    createDivDataMessage(divData, message) {
        let div = document.createElement('div');
        div.classList.add('result-log-message');
        div.innerText = message;
        divData.style.border = 'none';
        return div;
    };

    displayData(data) {
        let rowIndex = 0;
        let publisherList = Object.keys(data.publisherList);
        let divData = document.getElementById('divData');
        this.createDivDataPublisherNameRow(publisherList, divData);
        for (let i = 0; i < data.prizeList.length; i++) {
            let maxCount = 0;
            let prizeObject = data.prizeList[i];
            let prizeResultLogName = prizeObject.resultLogName;
            let divPrizeResultLogName = document.createElement('div');
            divPrizeResultLogName.classList.add('result-log-prize-name');
            divPrizeResultLogName.innerText = prizeResultLogName;
            let divPrizeNameOuter =
                this.createDivGridContainer(divPrizeResultLogName);
            divPrizeNameOuter.style.backgroundColor = 'lightgray';
            divData.appendChild(divPrizeNameOuter);
            for (let j = 0; j < publisherList.length; j++) {
                let publisherName = publisherList[j];
                let series = data.publisherList[publisherName][prizeResultLogName];
                let seriesCount = series.length;
                if (seriesCount > maxCount) {
                    maxCount = seriesCount;
                }
                let divSeriesOuter = this.createDivGridContainer();
                for (let k = 0; k < series.length; k++) {
                    let aSerial = series[k];
                    let divSeries = document.createElement('div');
                    divSeries.classList.add('result-log-series');
                    divSeries.innerText = aSerial;
                    divSeriesOuter.appendChild(divSeries);
                    if (i == 0 || i == data.prizeList.length - 1) {
                        divSeries.classList.add('result-log-special-color');
                        divPrizeResultLogName.classList.add('result-log-special-color');
                    } else {
                        let tempRowIndex = rowIndex + k;
                        if (tempRowIndex % 2 == 0) {
                            divSeries.classList.add('alternate-color');
                        }
                    }
                }
                divData.appendChild(divSeriesOuter);
            }
            rowIndex = rowIndex + maxCount;
        }
        divData.style.borderRight = '1px solid black';
        divData.style.borderBottom = '1px solid black';
    };

    createDivDataPublisherNameRow(publisherList, divData) {
        divData.appendChild(document.createElement('div'));
        let gridTemplateColumns = 'auto';
        for (let i = 0; i < publisherList.length; i++) {
            gridTemplateColumns = gridTemplateColumns + ' 1fr';
            let divPublisherName = document.createElement('div');
            divPublisherName.classList.add('result-log-publisher-name');
            divPublisherName.innerText = publisherList[i];
            let divOuter = this.createDivGridContainer(divPublisherName);
            divData.appendChild(divOuter);
            divOuter.style.backgroundColor = 'lightgray';
        }
        divData.style.gridTemplateColumns = gridTemplateColumns;
    };

    createDivGridContainer(childElement) {
        let divOuter = document.createElement('div');
        divOuter.classList.add('grid-container');
        if (childElement != null) {
            divOuter.appendChild(childElement);
        }
        return divOuter;
    };

    buildLink() {
        let link = window.FRONTEND_URL + '/sodo.html';
        link = link + '?type=' + this.data.ticketType + '&date=' +
            this.currentDateString;
        return link;
    };

    handleShareButton() {
        let parent = this;
        document.getElementById('divShareFB').onclick = function () {
            let link = parent.buildLink();
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + link,
                'popup', 'width=300,height=300');
            return false;
        };

        document.getElementById('divShareTwitter').onclick = function () {
            let link = parent.buildLink();
            window.open('https://twitter.com/intent/tweet?url=' + link,
                'popup', 'width=300,height=300');
            return false;
        };

        document.getElementById('divCopyLink').onclick = function () {
            let link = parent.buildLink();
            Common.copyTextToClipboard(link, function () {
                window.clearTimeout(parent.copyTimeoutId);
                document.getElementById('divCopyLink').style.backgroundImage =
                    'url(res/image/required/tick.png)';
                parent.copyTimeoutId = window.setTimeout(function () {
                    document.getElementById('divCopyLink').style.backgroundImage =
                        'url(res/image/required/share_link.png)';
                }, 1500);
            });
        };

        // document.getElementById('divShareEmail').onclick = function () {
        //     let divInputShareEmail = document.getElementById('divInputShareEmail');
        //     if (divInputShareEmail.style.display == 'none') {
        //         divInputShareEmail.style.display = 'grid';
        //         parent.inputEmail.input.focus();
        //     } else {
        //         divInputShareEmail.style.display = 'none';
        //     }
        // };
    };
};
