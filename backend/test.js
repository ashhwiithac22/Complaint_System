const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'AshwithaChandru*1',
    database: 'ramraj_complaint_db'
});

connection.connect((err) => {
    if (err) {
        console.log('❌ Failed with password: AshwithaChandru*1');
        console.log('Error:', err.message);
    } else {
        console.log('✅ SUCCESS! Password is correct');
        console.log('MySQL Connected!');
    }
    connection.end();
});