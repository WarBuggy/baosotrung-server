class InputSeries {
    constructor(index) {
        this.index = index;
        this.div = document.createElement('div');
        this.div.classList.add('input-series-grid');
        this.value = {
            ticketType: null,
            date: null,
            publisher: null,
        };
        this.createInputRadio();
        this.inputSeries = new InputNumber(null, null, 'Số vé');
        this.inputSeries.div.style.marginTop = '8px';
        this.inputSeries.input.min = 0;
        this.div.appendChild(this.inputSeries.div);
        this.createDivDelete();
    };

    createInputRadio() {
        let idKeywordTicketType = '.ticketType.';
        let idKeywordDate = '.divDateGrid.';
        let idKeywordPublisher = '.divPublisherGrid.';
        let divTicketTypeGrid = document.createElement('div');
        divTicketTypeGrid.classList.add('input-series-ticket-type-grid');
        this.div.appendChild(divTicketTypeGrid);
        for (let i = 0; i < window.coreTicketData.length; i++) {
            let aTicketTypeData = window.coreTicketData[i];
            let aTicketTypeId = aTicketTypeData.id;
            let aDivTicketType = document.createElement('div');
            let radioTicketTypeId = this.index + idKeywordTicketType + aTicketTypeId;
            let aRadioTicketType = document.createElement('input');
            aRadioTicketType.type = 'radio';
            aRadioTicketType.id = radioTicketTypeId;
            aRadioTicketType.name = this.index;
            aRadioTicketType.value = aTicketTypeId;
            let aLabelTicketType = document.createElement('label');
            aLabelTicketType.htmlFor = radioTicketTypeId;
            aLabelTicketType.innerText = aTicketTypeData.name;
            aDivTicketType.appendChild(aRadioTicketType);
            aDivTicketType.appendChild(aLabelTicketType);
            divTicketTypeGrid.appendChild(aDivTicketType);
            if (i == 0) {
                aRadioTicketType.checked = true;
                this.value.ticketType = aTicketTypeId;
            }
            let aDivDateGrid = this.createRadioDate(aTicketTypeData,
                idKeywordDate, idKeywordPublisher);
            if (i > 0) {
                aDivDateGrid.style.display = 'none';
            }
            let parent = this;
            aRadioTicketType.onchange = function () {
                let divDateGrid =
                    parent.div.getElementsByClassName('input-serie-date-grid');
                for (let j = 0; j < divDateGrid.length; j++) {
                    let aGrid = divDateGrid[j];
                    aGrid.style.display = 'none';
                }
                let ticketTypeId = this.value;
                let divSelectGrid =
                    document.getElementById(parent.index + idKeywordDate + ticketTypeId);
                divSelectGrid.style.display = 'grid';
                parent.value.ticketType = ticketTypeId;
            };
        }
    };

    createRadioDate(aTicketTypeData, idKeywordDate, idKeywordPublisher) {
        let aTicketTypeId = aTicketTypeData.id;
        let aDivDateGrid = document.createElement('div');
        aDivDateGrid.classList.add('input-serie-date-grid');
        aDivDateGrid.id = this.index + idKeywordDate + aTicketTypeId;
        this.div.appendChild(aDivDateGrid);
        for (let i = 0; i < aTicketTypeData.date.length; i++) {
            let aDateData = aTicketTypeData.date[i];
            let aRadioDate = document.createElement('input');
            aRadioDate.type = 'radio';
            let aRadioDateId = this.index + '.' + aDateData.dateString + '.' + aTicketTypeId;
            aDateData.id = aRadioDateId;
            aRadioDate.id = aRadioDateId;
            aRadioDate.name = this.index + '.' + aTicketTypeId;
            aRadioDate.value = aDateData.dateString;
            let aLabelDate = document.createElement('label');
            aLabelDate.htmlFor = aRadioDateId;
            aLabelDate.innerHTML = aDateData.name +
                ' (' + aDateData.displayDateString + ')';
            let aDivDate = document.createElement('div');
            aDivDate.appendChild(aRadioDate);
            aDivDate.appendChild(aLabelDate);
            aDivDateGrid.appendChild(aDivDate);
            if (i == 0) {
                aRadioDate.checked = true;
                this.value.date = aDateData.dateString;
            }
            let aDivPublisherGrid = this.createRadioPublisher(aDateData, idKeywordPublisher);
            if (i > 0) {
                aDivPublisherGrid.style.display = 'none';
            }
            let parent = this;
            aRadioDate.onchange = function () {
                let divPublisherGrid =
                    parent.div.getElementsByClassName('input-serie-publisher-grid');
                for (let j = 0; j < divPublisherGrid.length; j++) {
                    let aGrid = divPublisherGrid[j];
                    aGrid.style.display = 'none';
                }
                let divSelectGrid =
                    document.getElementById(parent.index + idKeywordPublisher + this.value);
                divSelectGrid.style.display = 'grid';
                parent.value.date = this.value;
            };
        }
        return aDivDateGrid;
    };

    createRadioPublisher(aDateData, idKeywordPublisher) {
        let dateString = aDateData.dateString;
        let aDivPublisherGrid = document.createElement('div');
        aDivPublisherGrid.classList.add('input-serie-publisher-grid');
        aDivPublisherGrid.id = this.index + idKeywordPublisher + dateString;
        this.div.appendChild(aDivPublisherGrid);
        for (let i = 0; i < aDateData.publisher.length; i++) {
            let aPublisher = aDateData.publisher[i];
            let aPublisherId = aPublisher.id;
            let aRadioPublisher = document.createElement('input');
            aRadioPublisher.type = 'radio';
            let aRadioPublisherId = this.index + '.' + aPublisherId + '.' + dateString;
            aRadioPublisher.id = aRadioPublisherId;
            aRadioPublisher.name = this.index + '.' + dateString;
            aRadioPublisher.value = aPublisherId;
            let aLabelPublisher = document.createElement('label');
            aLabelPublisher.htmlFor = aRadioPublisherId;
            aLabelPublisher.innerText = aPublisher.name;
            let aDivPublisher = document.createElement('div');
            aDivPublisher.appendChild(aRadioPublisher);
            aDivPublisher.appendChild(aLabelPublisher);
            aDivPublisherGrid.appendChild(aDivPublisher);
            let parent = this;
            aRadioPublisher.onchange = function () {
                parent.value.publisher = this.value;
            };
        }
        return aDivPublisherGrid;
    };

    createDivDelete() {
        this.divDelete = document.createElement('div');
        this.divDelete.classList.add('input-series-delete');
        this.divDelete.setAttribute('selected', 'false');
        this.divDelete.style.display = 'none';
        this.div.appendChild(this.divDelete);
        let parent = this;
        this.divDelete.onclick = function () {
            let selected = parent.getDivDeleteSelected();
            if (selected === 'false') {
                parent.setDivDeleteSelected();
            } else {
                parent.setDivDeleteDeselected();
            }
        };
    };

    getDivDeleteSelected() {
        return this.divDelete.getAttribute('selected');
    };

    setDivDeleteSelected() {
        this.divDelete.style.backgroundImage = 'var(--input-series-delete-selected)';
        this.divDelete.setAttribute('selected', 'true');
    };

    setDivDeleteDeselected() {
        this.divDelete.style.backgroundImage = 'var(--input-series-delete)';
        this.divDelete.setAttribute('selected', 'false');
    };

    showDivDelete() {
        this.setDivDeleteDeselected();
        this.divDelete.style.display = 'block';
    };

    hideDivDelete() {
        this.divDelete.style.display = 'none';
    };
};