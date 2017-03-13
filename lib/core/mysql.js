const process = require("process"),
    mysql = require("mysql"),
    config = require("../../config.json");

module.exports = (function() {

    const connectURL = `${config.databaseEndPoint || process.env["OPENSHIFT_MYSQL_DB_URL"]}bot`;

    // TODO: Pooling

    const query = (...args) => {
        const connection = mysql.createConnection(connectURL);
        connection.connect();
        connection.query(...args);
        connection.end()
    };

    return {
        query
    }

})()