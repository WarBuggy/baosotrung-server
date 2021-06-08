const configAES256CBC = require('./config.js')['aes-256-cbc'];

module.exports = {
    'aes-256-cbc': {
        decrypt: function (text) {
            let decipher = crypto.createDecipheriv(configAES256CBC.algorithm,
                Buffer.from(configAES256CBC.key + ''), Buffer.from(configAES256CBC.iv + ''));
            let decrypted = decipher.update(text, 'hex', 'utf8');
            decrypted = decrypted + decipher.final('utf8');
            return decrypted.toString();
        },

        encrypt: function (text) {
            let cipher = crypto.createCipheriv(configAES256CBC.algorithm,
                Buffer.from(configAES256CBC.key + ''), Buffer.from(configAES256CBC.iv + ''));
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted = encrypted + cipher.final('hex');
            return encrypted;
        },
    }
};