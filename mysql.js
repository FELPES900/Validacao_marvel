const mysql = require('mysql');

const connection = mysql.createPool({
    "user"     : "root",
    "password" : "123456",
    "database" : "atividades",
    "host"     : "localhost" 
});

exports.connection = connection;