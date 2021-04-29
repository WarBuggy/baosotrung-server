const mailerInfo = require('./mailerInfo.js');
const nodemailer = require('nodemailer');
const common = require('../common/common.js');
const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(dayjsCustomParseFormat);

let transporter = null;

module.exports = {
    sendRssParsedEmail: function (domain, rssName, startTime, feededTime, domainColor) {
        let transporter = getTransporter();
        let mailInfo = {
            from: mailerInfo.sender + '<' + mailerInfo.sendFrom + '>',
            to: 'hovanbuu@gmail.com',
            subject: 'RSS from ' + domain + ', ' + rssName + ' received',
        };
        mailInfo.text =
            'Domain:' + domain + '\n' +
            'Date: ' + dayjs().format(dateFormat) + '\n' +
            'Start time: ' + startTime + '\n' +
            'Feed time: ' + feededTime;
        common.consoleLog('Sending email for ' + domain + ', ' + rssName + '..', domainColor);
        transporter.sendMail(mailInfo)
            .then(function () {
                common.consoleLog('Email sent', domainColor);
            })
            .catch(function (error) {
                let errorMessage = 'Unknown error';
                if (error.errno) {
                    errorMessage = error.errno;
                } else if (error.code) {
                    errorMessage = error.code;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                common.consoleLogError('Email could not be sent. Error: ' + errorMessage, domainColor);
            });
    },
};

function createTransporter() {
    let transporterInfo = {
        service: 'gmail',
        auth: {
            user: mailerInfo.username,
            pass: mailerInfo.password,
        },
    };
    let transporter = nodemailer.createTransport(transporterInfo);
    return transporter;
};

function getTransporter() {
    if (transporter == null) {
        transporter = createTransporter();
    }
    return transporter;
};