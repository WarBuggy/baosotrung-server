class InputSeries {
    constructor() {
        this.div = document.createElement('div');
        this.div.classList.add('input-series-grid');
        this.createInputRadio();
    };

    createInputRadio() {
        let divTicketTypeGrid = document.createElement('div');
        divTicketTypeGrid.classList.add('input-series-ticket-type-grid');
        this.div.appendChild(divTicketTypeGrid);
        for (let i = 0; i < window.coreTicketData.length; i++) {
            let aTicketTypeData = window.coreTicketData[i];
            let aTicketTypeId = aTicketTypeData.id;
            let aDivTicketType = document.createElement('div');
            let radioTicketTypeId = 'ticketType' + aTicketTypeId;
            let aRadioTicketType = document.createElement('input');
            aRadioTicketType.type = 'radio';
            aRadioTicketType.id = radioTicketTypeId;
            aRadioTicketType.name = 'ticketType';
            aRadioTicketType.value = radioTicketTypeId;
            let aLabelTicketType = document.createElement('label');
            aLabelTicketType.for = radioTicketTypeId;
            aLabelTicketType.innerText = aTicketTypeData.name;
            aDivTicketType.appendChild(aRadioTicketType);
            aDivTicketType.appendChild(aLabelTicketType);
            divTicketTypeGrid.appendChild(aDivTicketType);
            this.createRadioDate(aTicketTypeData);
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
            let aLabelDate = document.createElement('label');
            aLabelDate.for = aRadioDateId;
            aLabelDate.innerText = aDateData.name +
                ' (' + aDateData.displayDateString + ')';
            let aDivDate = document.createElement('div');
            aDivDate.appendChild(aRadioDate);
            aDivDate.appendChild(aLabelDate);
            aDivDateGrid.appendChild(aDivDate);
            this.createRadioPublisher(aDateData);
        }
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
            let aLabelPublisher = document.createElement('label');
            aLabelPublisher.for = aRadioPublisherId;
            aLabelPublisher.innerText = aPublisher.name;
            let aDivPublisher = document.createElement('div');
            aDivPublisher.appendChild(aRadioPublisher);
            aDivPublisher.appendChild(aLabelPublisher);
            aDivPublisherGrid.appendChild(aDivPublisher);
        }
    };
};