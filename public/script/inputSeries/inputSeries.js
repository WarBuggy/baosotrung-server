class InputSeries {
    constructor() {
        this.div = document.createElement('div');
        this.div.classList.add('input-series-grid');
    };

    createTicketTypeRadio(data) {
        let ticketTypeData = data.ticketTypeData;
        let ticketTypeId = Object.keys(ticketTypeData);
        for (let i = 0; i < ticketTypeId.length; i++) {
            let aTicketTypeId = ticketTypeId[i];
            let aTicketTypeData = ticketTypeData[aTicketTypeId];
            if (aTicketTypeData.allowUserAlert !== true) {
                continue;
            }
            let aRadio = document.createElement('input');
            aRadio.type = 'radio';

        }
    };
};