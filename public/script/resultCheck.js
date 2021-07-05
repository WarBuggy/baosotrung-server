window.addEventListener('load', function () {
    new Header();
    new ResultCheck();
    // Common.savePageTraffic(1);
});

class ResultCheck {
    constructor() {
        this.bulletTicketTypeCollapse = '▶';
        this.bulletTicketTypeExpand = '▼';
        this.bulletDateCollapse = '→';
        this.bulletDateExpand = '↓';
        this.bulletPublisherCollapse = '—';
        this.bulletPublisherExpand = '+';
        this.attrNameCollapse = 'collapse';
        this.attrCollapse = 'true';
        this.attrExpand = 'false';
        this.attrPrizeNumber = 'prizeNumber';
        this.attrLabel = 'label';

        let data = this.getURLParamData();
        this.sendData(data);
    };

    getURLParamData() {
        let date = String(Common.getURLParameter('date'));
        let series = String(Common.getURLParameter('series'));
        if (date == '' || date == 'undefined' || date == 'null' ||
            series == '' || series == 'undefined' || series == 'null') {
            window.location.href = window.FRONTEND_URL + '/doveso';
            return;
        }
        return {
            date,
            series,
        }
    };

    async sendData(data) {
        let response = await Common.sendToBackend('/api/result/check', data);
        let code = response.code;
        console.log(response);
        console.log(code);
        document.getElementById('divLoading').style.display = 'none';
        let divIntroText = document.getElementById('divIntroText');
        divIntroText.style.display = 'block';
        if (code > 0 && code < 10) {
            divIntroText.innerText = 'Hệ thống gặp lỗi số ' + code + ' khi xử lý thời gian tìm kiếm.\n'
                + 'Xin vui lòng liên hệ quản trị nếu quý khách cần biết thêm chi tiết!';
            return;
        }
        this.createSummaryGrid(response);
        if (code > 10 && code < 20) {
            divIntroText.innerText = 'Hệ thống gặp lỗi số ' + code + ' (' + response.detail + ') khi xử lý số vé.\n'
                + 'Xin vui lòng liên hệ quản trị nếu quý khách cần biết thêm chi tiết!';
            return;
        }
        if (code == 20) {
            divIntroText.innerText = 'Hệ thống gặp lỗi dữ liệu không đủ số ' + code + ' (' + response.detail + ') khi xử lý số vé.\n'
                + 'Xin vui lòng liên hệ quản trị nếu quý khách cần biết thêm chi tiết!';
            return;
        }
        if (code > 20) {
            divIntroText.innerText = 'Hệ thống gặp lỗi dữ liệu không hợp nhất số ' + code + ' (' + response.detail + ') khi xử lý số vé.\n'
                + 'Xin vui lòng liên hệ quản trị nếu quý khách cần biết thêm chi tiết!';
            return;
        }
        this.displayResultCheck(response.data);
    };

    displayResultCheck(data) {
        let divIntroText = document.getElementById('divIntroText');
        divIntroText.style.color = 'black';
        if (data == null || data.length < 1) {
            divIntroText.innerHTML = '<div>Không tìm được số trúng giải cho các vé cần dò trong thời gian trên.</div>' +
                '<div style="margin-top: 8px;">Quý khách có muốn thử <a href="' +
                window.FRONTEND_URL + '/doveso.html">dò vé</a> khác?</div>';
            return;
        }
        divIntroText.innerHTML = 'Trong thời gian trên, các vé cần dò có thể trúng các giải sau: (nhấn để xem chi tiết)';
        for (let i = 0; i < data.length; i++) {
            let ticketTypeData = data[i];
            this.createDisplayTicketType(ticketTypeData);
        }
    };

    createSummaryGrid(response) {
        if (response.firstDateVN != null &&
            response.queryHour != null && response.queryDate != null) {
            document.getElementById('divSummaryLabelDateStart').style.display = 'block';
            let divSummaryDateStart = document.getElementById('divSummaryDateStart');
            divSummaryDateStart.style.display = 'block';
            divSummaryDateStart.innerText = 'Đầu ngày ' + response.firstDateVN;

            document.getElementById('divSummaryLabelDateEnd').style.display = 'block';
            let divSummaryDateEnd = document.getElementById('divSummaryDateEnd');
            divSummaryDateEnd.style.display = 'block';
            divSummaryDateEnd.innerText = 'Lúc ' + response.queryHour + '\n'
                + 'Ngày ' + response.queryDate;
        }
        if (response.serials != null) {
            document.getElementById('divSummaryLabelSeries').style.display = 'block';
            let divSummarySeries = document.getElementById('divSummarySeries');
            divSummarySeries.style.display = 'block';
            let count = 0;
            let textList = [];
            for (let i = 0; i < response.serials.length; i++) {
                count = Math.floor(i / 2);
                if (textList[count] == null) {
                    textList[count] = [];
                }
                textList[count].push(response.serials[i]);
            }
            for (let i = 0; i < textList.length; i++) {
                textList[i] = textList[i].join(', ');
            }
            divSummarySeries.innerText = textList.join('\n');
        }
        document.getElementById('divSummary').style.display = 'grid';
    };

    createDisplayTicketType(ticketTypeData) {
        let divDetail = document.getElementById('divDetail');

        let divBulletTicketType = document.createElement('div');
        divBulletTicketType.classList.add('result-check-bullet');
        divBulletTicketType.innerText = this.bulletTicketTypeExpand;
        let divLabelTicketType = document.createElement('div');
        divLabelTicketType.classList.add('result-check-bullet-label')
        divLabelTicketType.innerText = ticketTypeData.name;
        let divBulletTicketTypeOuter = document.createElement('div');
        divBulletTicketTypeOuter.id = 'ticketType' + ticketTypeData.type;
        divBulletTicketTypeOuter.classList.add('result-check-bullet-outer');
        divBulletTicketTypeOuter.classList.add('ticket-type');
        divBulletTicketTypeOuter.appendChild(divBulletTicketType);
        divBulletTicketTypeOuter.appendChild(divLabelTicketType);
        divBulletTicketTypeOuter.setAttribute(this.attrNameCollapse, this.attrExpand);
        divBulletTicketTypeOuter.setAttribute(this.attrLabel, ticketTypeData.name);
        divDetail.appendChild(divBulletTicketTypeOuter);
        ticketTypeData.divOuter = divBulletTicketTypeOuter;

        let totalPrizeNumber = 0;
        let divDateOuter = document.createElement('div');
        divDateOuter.id = divBulletTicketTypeOuter.id + 'OuterDate';
        divDateOuter.classList.add('result-check-date-outer');
        for (let i = 0; i < ticketTypeData.data.length; i++) {
            let dateData = ticketTypeData.data[i];
            let prizeNumber =
                this.createDisplayDate(dateData, divDateOuter, ticketTypeData.type);
            totalPrizeNumber = totalPrizeNumber + prizeNumber;
        }
        divDetail.appendChild(divDateOuter);
        divBulletTicketTypeOuter.setAttribute(this.attrPrizeNumber, ' (' + totalPrizeNumber + ' giải)');

        let parent = this;
        divBulletTicketTypeOuter.onclick = function () {
            parent.toggleDivInfo(this, 'OuterDate',
                parent.bulletTicketTypeExpand, parent.bulletTicketTypeCollapse);
        };
    };

    createDisplayDate(dateData, divDateOuter, ticketType) {
        let checkDateIdSuffix = ticketType + dateData.oDate;
        let dayOfWeek = 'T' + (parseInt(dateData.dayOfWeek) + 1);
        if (dateData.dayOfWeek == 0) {
            dayOfWeek = 'CN';
        }
        dayOfWeek = dayOfWeek + ', ';

        let divBulletDate = document.createElement('div');
        divBulletDate.classList.add('result-check-bullet');
        divBulletDate.innerText = this.bulletDateExpand;
        let divLabelDate = document.createElement('div');
        divLabelDate.classList.add('result-check-bullet-label');
        divLabelDate.innerText = dayOfWeek + dateData.date;
        let divBulletDateOuter = document.createElement('div');
        divBulletDateOuter.id = 'date' + checkDateIdSuffix;
        divBulletDateOuter.classList.add('result-check-bullet-outer');
        divBulletDateOuter.classList.add('date');
        divBulletDateOuter.appendChild(divBulletDate);
        divBulletDateOuter.appendChild(divLabelDate);
        divBulletDateOuter.setAttribute(this.attrNameCollapse, this.attrExpand);
        divBulletDateOuter.setAttribute(this.attrLabel, divLabelDate.innerText);
        divDateOuter.appendChild(divBulletDateOuter);
        dateData.divOuter = divBulletDateOuter;

        let totalPrizeNumber = 0;
        let divPublisherOuter = document.createElement('div');
        divPublisherOuter.id = divBulletDateOuter.id + 'OuterPublisher';
        divPublisherOuter.classList.add('result-check-publisher-outer');
        for (let i = 0; i < dateData.data.length; i++) {
            let publisherData = dateData.data[i];
            let prizeNumber =
                this.createDisplayPublisher(publisherData, divPublisherOuter, checkDateIdSuffix);
            totalPrizeNumber = totalPrizeNumber + prizeNumber;
        }
        divDateOuter.appendChild(divPublisherOuter);
        divBulletDateOuter.setAttribute(this.attrPrizeNumber, ' (' + totalPrizeNumber + ' giải)');

        let parent = this;
        divBulletDateOuter.onclick = function () {
            parent.toggleDivInfo(this, 'OuterPublisher',
                parent.bulletDateExpand, parent.bulletDateCollapse);
        };
        this.collapseDiv(divBulletDateOuter, divPublisherOuter, this.bulletDateCollapse);
        return totalPrizeNumber;
    };

    createDisplayPublisher(publisherData, divPublisherOuter, checkDateIdSuffix) {
        let divBulletPublisher = document.createElement('div');
        divBulletPublisher.classList.add('result-check-bullet');
        divBulletPublisher.innerText = this.bulletPublisherExpand;
        let divLabelPublisher = document.createElement('div');
        divLabelPublisher.classList.add('result-check-bullet-label');
        divLabelPublisher.innerText = publisherData.name;
        let divBulletPublisherOuter = document.createElement('div');
        divBulletPublisherOuter.id = 'publisher' + checkDateIdSuffix + publisherData.publisher;
        divBulletPublisherOuter.classList.add('result-check-bullet-outer');
        divBulletPublisherOuter.classList.add('publisher');
        divBulletPublisherOuter.appendChild(divBulletPublisher);
        divBulletPublisherOuter.appendChild(divLabelPublisher);
        divBulletPublisherOuter.setAttribute(this.attrNameCollapse, this.attrExpand);
        divBulletPublisherOuter.setAttribute(this.attrLabel, publisherData.name);
        divPublisherOuter.appendChild(divBulletPublisherOuter);
        publisherData.divOuter = divBulletPublisherOuter;

        let totalPrizeNumber = 0;
        let divResultOuter = document.createElement('div');
        divResultOuter.id = divBulletPublisherOuter.id + 'OuterResult';
        divResultOuter.classList.add('result-check-result-outer');
        for (let i = 0; i < publisherData.data.length; i++) {
            let resultData = publisherData.data[i];
            let prizeNumber = this.createDisplayResult(resultData, divResultOuter);
            totalPrizeNumber = totalPrizeNumber + prizeNumber;
        }
        divPublisherOuter.appendChild(divResultOuter);
        divBulletPublisherOuter.setAttribute(this.attrPrizeNumber, ' (' + totalPrizeNumber + ' giải)');

        let parent = this;
        divBulletPublisherOuter.onclick = function () {
            parent.toggleDivInfo(this, 'OuterResult',
                parent.bulletPublisherExpand, parent.bulletPublisherCollapse);
        };
        this.collapseDiv(divBulletPublisherOuter, divResultOuter, this.bulletPublisherCollapse);
        return totalPrizeNumber;
    };

    createDisplayResult(resultData, divResultOuter) {
        let divSerial = document.createElement('div');
        divSerial.innerText = resultData.serial;
        divSerial.classList.add('result-check-result-cell');
        divSerial.style['grid-row'] = 'auto / span ' + resultData.data.length;
        divSerial.style.fontWeight = '700';
        divResultOuter.appendChild(divSerial);
        for (let i = 0; i < resultData.data.length; i++) {
            let prizeData = resultData.data[i];
            let divPrize = document.createElement('div');
            divPrize.innerText = prizeData.name;
            divPrize.classList.add('result-check-result-cell');
            divPrize.style.textAlign = 'center';
            divResultOuter.appendChild(divPrize);
            let divPrizeMoney = document.createElement('div');
            divPrizeMoney.innerText = Number(prizeData.money).toLocaleString('vi-vn');
            divPrizeMoney.classList.add('result-check-result-cell');
            divPrizeMoney.style.textAlign = 'right';
            divResultOuter.appendChild(divPrizeMoney);
        }
        return resultData.data.length;
    };

    toggleDivInfo(currentDiv, divInfoSuffix, bulletExpend, bulletCollapse) {
        let divOuter = document.getElementById(currentDiv.id + divInfoSuffix);
        let attrCollapse = currentDiv.getAttribute(this.attrNameCollapse);
        if (attrCollapse == this.attrCollapse) {
            this.expendDiv(currentDiv, divOuter, bulletExpend);
            return;
        }
        this.collapseDiv(currentDiv, divOuter, bulletCollapse);
    };

    expendDiv(currentDiv, divOuter, bulletExpend) {
        divOuter.style.display = 'grid';
        currentDiv.setAttribute(this.attrNameCollapse, this.attrExpand);
        currentDiv.children[0].innerText = bulletExpend;
        currentDiv.children[1].innerText = currentDiv.getAttribute(this.attrLabel);
        currentDiv.children[1].style.textDecoration = 'none';
    };

    collapseDiv(currentDiv, divOuter, bulletCollapse) {
        divOuter.style.display = 'none';
        currentDiv.setAttribute(this.attrNameCollapse, this.attrCollapse);
        currentDiv.children[0].innerText = bulletCollapse;
        currentDiv.children[1].innerText = currentDiv.getAttribute(this.attrLabel) +
            currentDiv.getAttribute(this.attrPrizeNumber);
        currentDiv.children[1].style.textDecoration = 'underline';
    }
}
