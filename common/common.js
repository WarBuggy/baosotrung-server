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
            time = getCurrentTime();
        }
        console.log(consoleColor + '%s\x1b[0m', time + ': ' + string + '.');
    },

    errorLog: function (string, consoleColor, time) {
        if (time == null) {
            time = getCurrentTime();
        }
        console.log(consoleColor + '\x1b[31m%s\x1b[0m', time + ': ' + string + '.');
    },
};