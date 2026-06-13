const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'AshwithaChandru*1',
    database: 'ramraj_complaint_db'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL Error:', err);
    } else {
        console.log('MySQL Connected');
    }
});

// ==================== LOGIN API ====================
app.post('/api/login', (req, res) => {
    const { employee_code, password } = req.body;
    
    const sql = `SELECT id, employee_code, employee_name, role, warehouse_id, unit 
                 FROM users WHERE employee_code = ? AND password = ?`;
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

// ==================== GET CUSTOMERS ====================
app.get('/api/customers', (req, res) => {
    db.query('SELECT id, customer_code, customer_name FROM customers', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// ==================== GET INVOICES BY CUSTOMER ====================
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

// ==================== GET WAREHOUSE BY CUSTOMER ====================
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

// ==================== RAISE COMPLAINT ====================
app.post('/api/complaints', (req, res) => {
    const { customer_id, invoice_id, complaint_type, complaint_subtype, description, employee_code } = req.body;
    const complaint_id = `C${Date.now()}`;
    const status = 'Pending';
    const created_at = new Date();
    
    const getInvoiceSql = `SELECT i.invoice_number, i.warehouse_id, c.sales_exec_id 
                           FROM invoices i 
                           JOIN customers c ON c.id = i.customer_id
                           WHERE i.id = ?`;
    db.query(getInvoiceSql, [invoice_id], (err, invoiceResult) => {
        if (err || invoiceResult.length === 0) {
            console.error('Invoice not found:', err);
            return res.status(500).json({ message: 'Invoice not found' });
        }
        
        const invoice_number = invoiceResult[0].invoice_number;
        const warehouse_id = invoiceResult[0].warehouse_id;
        const sales_exec_id = invoiceResult[0].sales_exec_id;
        
        const sql = `INSERT INTO complaints (
            complaint_id, customer_id, invoice_id, invoice_number, warehouse_id, 
            sales_exec_id, complaint_type, complaint_subtype, complaint_text, 
            status, created_at, escalation_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
        
        db.query(sql, [
            complaint_id, customer_id, invoice_id, invoice_number, warehouse_id, 
            sales_exec_id, complaint_type, complaint_subtype, description, 
            status, created_at
        ], (err) => {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ success: true, complaint_id, message: 'Complaint raised successfully' });
        });
    });
});

// ==================== GET COMPLAINTS (Role-Based) ====================
app.get('/api/complaints', (req, res) => {
    const { user_id, role, warehouse_id, unit } = req.query;
    
    console.log('Request params:', { user_id, role, warehouse_id, unit });
    
    let sql = `
        SELECT c.*, cust.customer_name, u.employee_name as sales_exec_name,
               w.warehouse_name, w.unit
        FROM complaints c 
        JOIN customers cust ON cust.id = c.customer_id 
        LEFT JOIN users u ON u.id = c.sales_exec_id
        LEFT JOIN warehouses w ON w.id = c.warehouse_id
        WHERE 1=1
    `;
    
    // Role-based filtering
    if (role === 'sales') {
        sql += ` AND c.sales_exec_id = ${user_id}`;
    } else if (role === 'warehouse_team') {
        // Team members only see their assigned warehouse
        if (warehouse_id && warehouse_id !== 'null' && warehouse_id !== 'undefined') {
            sql += ` AND c.warehouse_id = ${warehouse_id}`;
        }
    } else if (role === 'warehouse_manager') {
        // Managers see ALL complaints from ALL warehouses
        // No warehouse filter - they can see everything
        console.log('Warehouse Manager - viewing all complaints');
    } else if (role === 'unit_head') {
        if (unit && unit !== 'null' && unit !== 'undefined') {
            sql += ` AND w.unit = '${unit}'`;
        }
    }
    
    sql += ` ORDER BY c.created_at DESC`;
    
    console.log('SQL Query:', sql);
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        console.log('Results count:', results.length);
        res.json(results);
    });
});

// ==================== UPDATE COMPLAINT STATUS ====================
app.put('/api/complaints/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, resolved_by, resolution_notes } = req.body;
    const resolved_at = status === 'Resolved' ? new Date() : null;
    
    const sql = `UPDATE complaints SET status = ?, resolved_at = ?, resolved_by = ?, resolution_notes = ? WHERE id = ?`;
    db.query(sql, [status, resolved_at, resolved_by, resolution_notes, id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ success: true });
    });
});

// ==================== ESCALATE COMPLAINT ====================
app.put('/api/complaints/:id/escalate', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE complaints SET status = "Escalated", escalation_level = escalation_level + 1 WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ success: true });
    });
});

// ==================== SEND MESSAGE TO SALES EXECUTIVE ====================
app.post('/api/send-message', (req, res) => {
    const { complaint_id, from_user_id, to_user_id, message } = req.body;
    
    const sql = `INSERT INTO notifications (complaint_id, sent_to, message, sent_via, sent_at) 
                 VALUES (?, ?, ?, 'Message', NOW())`;
    db.query(sql, [complaint_id, to_user_id, message], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ success: true, message: 'Message sent successfully' });
    });
});

// ==================== GET NOTIFICATIONS FOR USER ====================
app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `SELECT n.*, c.complaint_id as complaint_code 
                 FROM notifications n
                 JOIN complaints c ON c.id = n.complaint_id
                 WHERE n.sent_to = ? AND n.is_read = FALSE
                 ORDER BY n.sent_at DESC`;
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// ==================== MARK NOTIFICATION AS READ ====================
app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ success: true });
    });
});

// ==================== GET DASHBOARD STATS ====================
app.get('/api/dashboard/stats', (req, res) => {
    const { user_id, role, warehouse_id, unit } = req.query;
    
    let sql = `SELECT 
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'Escalated' THEN 1 END) as escalated,
        COUNT(*) as total
        FROM complaints c
        LEFT JOIN warehouses w ON w.id = c.warehouse_id
        WHERE 1=1
    `;
    
    if (role === 'sales') {
        sql += ` AND c.sales_exec_id = ${user_id}`;
    } else if (role === 'warehouse_team') {
        if (warehouse_id && warehouse_id !== 'null' && warehouse_id !== 'undefined') {
            sql += ` AND c.warehouse_id = ${warehouse_id}`;
        }
    } else if (role === 'warehouse_manager') {
        // Manager sees ALL complaints
        console.log('Manager stats - showing all complaints');
    } else if (role === 'unit_head') {
        if (unit && unit !== 'null' && unit !== 'undefined') {
            sql += ` AND w.unit = '${unit}'`;
        }
    }
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results[0]);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});