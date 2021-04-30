const dbConfig = require('./config.js');
const common = require('../common/common.js');
const mysql = require('mysql');

let connection = null;

module.exports = {
    query: function (params, logInfo) {
        let connection = getConnection();
        if (connection == null) {
            return 900;
        }
        let sql = 'CALL ' + logInfo.source + '(';
        if (params) {
            let questionMark = [];
            for (let i = 0; i < params.length; i++) {
                questionMark.push('?');
            }
            sql = sql + questionMark.join(',');
        }
        sql = sql + ')';
        let formatQuery = mysql.format(sql, params);
        connection.query(formatQuery, function (selectErr, selectResult, fields) {
            if (selectErr) {
                let consoleMessage = 'Error while executing a query from database:\n' + selectErr;
                common.consoleLogError(consoleMessage);
                return 901;
            }
            let resultCode = selectResult[0][0].result;
            if (resultCode == null) {
                let errorMessage = 'No result code found in database response: ' + logInfo.source;
                common.consoleLogError(errorMessage);
                return 902;
            }
            let result = {
                sqlResults: selectResult,
                fields: fields,
                result: resultCode,
            };
            return result;
        });
    },
};

function getConnection() {
    if (connection == null) {
        connection = createConnection();
    }
    return connection;
};

function createConnection() {
    let aConnection = mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.initDB,
        port: dbConfig.port,
    });
    aConnection.connect(function (connectionError) {
        if (connectionError) {
            common.consoleLogError('Error while connecting to database:\n' + connectionError);
            return null;
        }
        common.consoleLog('Database connected with id ' + aConnection.threadId);
        return aConnection;
    });
};

function closeConnection() {
    if (connection == null) {
        return;
    }
    try {
        connection.end();
    } catch (closingError) {
        common.consoleLogError('Error while closing database connection:\n' + closingError);
        connection.destroy();
    }
};