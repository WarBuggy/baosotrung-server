const dayjs = require('dayjs');
const dayjsCustomParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(dayjsCustomParseFormat);

module.exports = {
    getCurrentTime: function () {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
    },

    sleep: function (ms) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, ms);
        });
    },

    consoleLog: function (string, consoleColor, time) {
        if (time == null) {
            time = module.exports.getCurrentTime();
        }
        console.log(consoleColor + '%s\x1b[0m', time + ': ' + string + '.');
    },

    consoleLogError: function (string, consoleColor, time) {
        if (time == null) {
            time = module.exports.getCurrentTime();
        }
        console.log(consoleColor + '\x1b[31m%s\x1b[0m', time + ': ' + string + '.');
    },

    cloneObject(object) {
        let string = JSON.stringify(object);
        return JSON.parse(string);
    },

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
};