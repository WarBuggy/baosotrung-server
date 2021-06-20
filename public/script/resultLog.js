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
        };
        this.addEventListener();
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

    async getData() {
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
        this.toggleDivLoading(false);
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
                parent.toggleDivLoading(true);
                parent.displayClick(divList, this, clickClassName);
                let attribute = this.getAttribute(attributeName);
                parent.data[parentAttributeName] = attribute;
                parent.getData();
            });
        }
    };

    matchDisplayClickWithData(className, clickClassName, attributeName, parentAttributeName) {
        let targetDiv = null;
        let divList = document.getElementsByClassName(className);
        for (let i = 0; i < divList.length; i++) {
            let aDiv = divList[i];
            aDiv.classList.remove(clickClassName);
            if (aDiv.getAttribute(attributeName) == this.data[parentAttributeName]) {
                targetDiv = aDiv;
            }
        }
        targetDiv.classList.add(clickClassName);
    };

    toggleDivLoading(showDivLoading) {
        let divLoading = document.getElementById('divLoading');
        let divData = document.getElementById('divData');
        let divDateOuter = document.getElementById('divDateOuter');
        if (showDivLoading === true) {
            divLoading.style.display = 'grid';
            divData.style.display = 'none';
            divDateOuter.style.display = 'none';

            return;
        }
        divLoading.style.display = 'none';
        divData.style.display = 'grid';
        divDateOuter.style.display = 'grid';
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
                        divSeries.classList.add('special-color');
                        divPrizeResultLogName.classList.add('special-color');
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
};
