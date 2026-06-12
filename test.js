const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',  // Try different passwords here
    database: 'ramraj_complaint_db'
});

connection.connect((err) => {
    if (err) {
        console.log('Failed with password: AshwithaChandru*1');
        console.log('Error:', err.message);
    } else {
        console.log('SUCCESS! Password is correct');
    }
    connection.end();
});
