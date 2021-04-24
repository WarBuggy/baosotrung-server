require('dotenv').config();
const nodemailer = require('nodemailer');

function createEmailTransporter() {
    let transporterInfo = {
        service: 'gmail',
        auth: {
            user: emailData.username,
            pass: emailData.password,
        },
    };
    let transporter = nodemailer.createTransport(transporterInfo);
    return transporter;
};


module.exports = {

};