// config/db.

// Importing the 'mysql2/promise' module to interact with MySQL using promises
const mysql = require('mysql2/promise');

// Creating a MySQL connection pool with necessary configuration details
const db = mysql.createPool(
{
    host: 'localhost', // The hostname or IP address of the MySQL server (localhost means it's on the same machine)
    user: 'root', // The username used to connect to the MySQL database
    password: '', // The password for the MySQL user (empty here)
    database: 'heart_failure' // The name of the database to connect to
});

// Exporting the db connection pool so it can be used in other files
module.exports = db;