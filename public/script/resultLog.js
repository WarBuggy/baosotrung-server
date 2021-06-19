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
        this.displayData(response);
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

    displayData(response) {
        let divData = document.getElementById('divData');
        document.getElementById('divDate').innerText = response.vnDateString;
        divData.innerHTML = '';
        let code = response.code;
        if (code == 1) {
            let message = 'Chưa có kết quả xổ số cho ngày này. Xin quý khách vui lòng kiểm lại sau!';
            divData.appendChild(this.createDivMessage(message));
            return;
        }
        if (code != 0) {
            let message = 'Hệ thống gặp lỗi ' + code + '_' + response.secondTime +
                ' khi truy cập dữ liệu. Xin quý khách vui lòng thử lại sau!';
            divData.appendChild(this.createDivMessage(message));
            return;
        }
        // if response.data.length < 1
        // code = 1 ->  'Kết quả xổ số chưa có'
        // else -> 'Không tìm được kết quả'
    };

    createDivMessage(message) {
        let div = document.createElement('div');
        div.classList.add('result-log-message');
        div.innerText = message;
        return div;
    };
};
