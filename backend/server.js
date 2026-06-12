const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'ramraj_complaint_db'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL Error:', err);
    } else {
        console.log('MySQL Connected');
    }
});

// Login API
app.post('/api/login', (req, res) => {
    const { employee_code, password } = req.body;
    
    const sql = 'SELECT * FROM users WHERE employee_code = ? AND password = ?';
    db.query(sql, [employee_code, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length > 0) {
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: results[0]
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials'
            });
        }
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});