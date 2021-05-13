class InputSeries {
    constructor() {
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
        let idKeyword = 'ticketType';
        let divTicketTypeGrid = document.createElement('div');
        divTicketTypeGrid.classList.add('input-series-ticket-type-grid');
        this.div.appendChild(divTicketTypeGrid);
        for (let i = 0; i < window.coreTicketData.length; i++) {
            let aTicketTypeData = window.coreTicketData[i];
            let aTicketTypeId = aTicketTypeData.id;
            let aDivTicketType = document.createElement('div');
            let radioTicketTypeId = idKeyword + aTicketTypeId;
            let aRadioTicketType = document.createElement('input');
            aRadioTicketType.type = 'radio';
            aRadioTicketType.id = radioTicketTypeId;
            aRadioTicketType.name = idKeyword;
            aRadioTicketType.value = radioTicketTypeId;
            aRadioTicketType.setAttribute(idKeyword, aTicketTypeId);
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
            let aDivDateGrid = this.createRadioDate(aTicketTypeData);
            if (i > 0) {
                aDivDateGrid.style.display = 'none';
            }
            let parent = this;
            aRadioTicketType.onchange = function () {
                let ticketTypeId = parseInt(this.getAttribute(idKeyword));
                let divDateGrid =
                    document.getElementsByClassName('input-serie-date-grid');
                for (let j = 0; j < divDateGrid.length; j++) {
                    let aGrid = divDateGrid[j];
                    aGrid.style.display = 'none';
                }
                let divSelectGrid =
                    document.getElementById('divDateGrid' + ticketTypeId);
                divSelectGrid.style.display = 'grid';
                parent.value.ticketType = ticketTypeId;
            };
        }
    };

    createRadioDate(aTicketTypeData) {
        let aTicketTypeId = aTicketTypeData.id;
        let aDivDateGrid = document.createElement('div');
        aDivDateGrid.classList.add('input-serie-date-grid');
        aDivDateGrid.id = 'divDateGrid' + aTicketTypeId;
        this.div.appendChild(aDivDateGrid);
        for (let i = 0; i < aTicketTypeData.date.length; i++) {
            let aDateData = aTicketTypeData.date[i];
            let aRadioDate = document.createElement('input');
            aRadioDate.type = 'radio';
            let aRadioDateId = aDateData.dateString + '.' + aTicketTypeId;
            aDateData.id = aRadioDateId;
            aRadioDate.id = aRadioDateId;
            aRadioDate.name = 'dateTicketType' + aTicketTypeId;
            aRadioDate.value = aDateData.dateString;
            aRadioDate.setAttribute('dateString', aDateData.dateString);
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
            let aDivPublisherGrid = this.createRadioPublisher(aDateData);
            if (i > 0) {
                aDivPublisherGrid.style.display = 'none';
            }
            let parent = this;
            aRadioDate.onchange = function () {
                let divPublisherGrid =
                    document.getElementsByClassName('input-serie-publisher-grid');
                for (let j = 0; j < divPublisherGrid.length; j++) {
                    let aGrid = divPublisherGrid[j];
                    aGrid.style.display = 'none';
                }
                let divSelectGrid =
                    document.getElementById('divPublisherGrid' + this.id);
                divSelectGrid.style.display = 'grid';
                parent.value.date = this.getAttribute('dateString');
            };
        }
        return aDivDateGrid;
    };

    createRadioPublisher(aDateData) {
        let aDateDataId = aDateData.id;
        let aDivPublisherGrid = document.createElement('div');
        aDivPublisherGrid.classList.add('input-serie-publisher-grid');
        aDivPublisherGrid.id = 'divPublisherGrid' + aDateDataId;
        this.div.appendChild(aDivPublisherGrid);
        for (let i = 0; i < aDateData.publisher.length; i++) {
            let aPublisher = aDateData.publisher[i];
            let aPublisherId = aPublisher.id;
            let aRadioPublisher = document.createElement('input');
            aRadioPublisher.type = 'radio';
            let aRadioPublisherId = aPublisherId + '.' + aDateDataId;
            aRadioPublisher.id = aRadioPublisherId;
            aRadioPublisher.name = 'publisher' + aDateDataId;
            aRadioPublisher.value = aPublisherId;
            aRadioPublisher.setAttribute('publisherId', aPublisherId);
            let aLabelPublisher = document.createElement('label');
            aLabelPublisher.htmlFor = aRadioPublisherId;
            aLabelPublisher.innerText = aPublisher.name;
            let aDivPublisher = document.createElement('div');
            aDivPublisher.appendChild(aRadioPublisher);
            aDivPublisher.appendChild(aLabelPublisher);
            aDivPublisherGrid.appendChild(aDivPublisher);
            let parent = this;
            aRadioPublisher.onchange = function () {
                let id = parseInt(this.getAttribute('publisherId'));
                parent.value.publisher = id;
            };
        }
        return aDivPublisherGrid;
    };

    createDivDelete() {
        this.divDelete = document.createElement('div');
        this.divDelete.classList.add('input-series-delete');
        this.divDelete.setAttribute('selected', 'false');
        this.div.appendChild(this.divDelete);
        this.divDelete.onclick = function () {
            let selected = this.getAttribute('selected');
            if (selected === 'false') {
                console.log(window.rootStyle.getPropertyValue('--input-series-delete-selected'));
                // this.style.backgroundImage =
                //     window.rootStyle.getPropertyValue('--input-series-delete-selected');
                this.style.backgroundImage = 'var(--input-series-delete-selected)';
                this.setAttribute('selected', 'true');
            } else {
                // this.style.backgroundImage =
                //     window.rootStyle.getPropertyValue('--input-series-delete');
                this.style.backgroundImage = 'var(--input-series-delete)';
                this.setAttribute('selected', 'false');
            }
        };
    };
};