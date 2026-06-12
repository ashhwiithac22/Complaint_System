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

// Get all customers (for dropdown)
app.get('/api/customers', (req, res) => {
    db.query('SELECT id, customer_code, customer_name FROM customers', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// Get invoices by customer (last 30 days only)
app.get('/api/invoices/:customerId', (req, res) => {
    const { customerId } = req.params;
    const sql = `SELECT id, invoice_number, invoice_date FROM invoices 
                 WHERE customer_id = ? AND invoice_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
                 ORDER BY invoice_date DESC`;
    db.query(sql, [customerId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// Get warehouse by customer
app.get('/api/warehouse/:customerId', (req, res) => {
    const { customerId } = req.params;
    const sql = `SELECT w.warehouse_name, w.location FROM warehouses w 
                 JOIN customers c ON c.warehouse_id = w.id 
                 WHERE c.id = ?`;
    db.query(sql, [customerId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results[0] || null);
    });
});

// Raise complaint
app.post('/api/complaints', (req, res) => {
    const { customer_id, invoice_id, complaint_type, complaint_subtype, description, employee_code } = req.body;
    const complaint_id = `C${Date.now()}`;
    const status = 'Pending';
    const created_at = new Date();
    
    // First get invoice number from invoice_id
    const getInvoiceSql = 'SELECT invoice_number FROM invoices WHERE id = ?';
    db.query(getInvoiceSql, [invoice_id], (err, invoiceResult) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        const invoice_number = invoiceResult[0].invoice_number;
        
        const sql = `INSERT INTO complaints (complaint_id, customer_id, invoice_number, complaint_type, complaint_subtype, description, status, created_at, escalation_level) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`;
        
        db.query(sql, [complaint_id, customer_id, invoice_number, complaint_type, complaint_subtype, description, status, created_at], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ success: true, complaint_id, message: 'Complaint raised successfully' });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:5000`);
});