const configAES256CBC = require('./config.js')['aes-256-cbc'];
const crypto = require('crypto');

module.exports = {
    'aes-256-cbc': {
        decrypt: function (text) {
            try {
                let decipher = crypto.createDecipheriv(configAES256CBC.algorithm,
                    Buffer.from(configAES256CBC.key + ''), Buffer.from(configAES256CBC.iv + ''));
                let decrypted = decipher.update(text, 'hex', 'utf8');
                decrypted = decrypted + decipher.final('utf8');
                return {
                    success: true,
                    result: decrypted.toString(),
                };
            } catch (error) {
                return {
                    success: false,
                    error,
                };
            }
        },

        encrypt: function (text) {
            try {
                let cipher = crypto.createCipheriv(configAES256CBC.algorithm,
                    Buffer.from(configAES256CBC.key + ''), Buffer.from(configAES256CBC.iv + ''));
                let encrypted = cipher.update(text, 'utf8', 'hex');
                encrypted = encrypted + cipher.final('hex');
                return {
                    success: true,
                    result: encrypted.toString(),
                };
            } catch (error) {
                return {
                    success: false,
                    error,
                };
            }
        },
    }
};