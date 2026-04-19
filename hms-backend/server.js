const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) { console.error('DB Connection Failed:', err); return; }
    console.log('✅ Connected to MySQL Database!');
});

// --- AUTH ---
app.post('/api/register', (req, res) => {
    const { full_name, email, password, role } = req.body;
    db.query("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
        [full_name, email, password, role], (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Account created successfully!" });
        });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT id, full_name, role FROM users WHERE email = ? AND password = ?",
        [email, password], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (results.length > 0) res.json({ success: true, user: results[0] });
            else res.status(401).json({ success: false, message: "Invalid email or password" });
        });
});

// --- ADMIN ---
app.get('/api/admin/stats', (req, res) => {
    const stats = {};
    db.query("SELECT COUNT(*) as count FROM doctors", (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalDoctors = r[0].count;
        db.query("SELECT COUNT(*) as count FROM users WHERE role = 'patient'", (err, r) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalPatients = r[0].count;
            db.query("SELECT COUNT(*) as count FROM appointments", (err, r) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.totalAppointments = r[0].count;
                db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'", (err, r) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.pendingAppointments = r[0].count;
                    res.json(stats);
                });
            });
        });
    });
});

app.post('/api/admin/add-doctor', (req, res) => {
    const { full_name, email, password, specialization, fees, timing } = req.body;
    db.query("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'doctor')",
        [full_name, email, password], (err, userResult) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            db.query("INSERT INTO doctors (user_id, specialization, fees, timing) VALUES (?, ?, ?, ?)",
                [userResult.insertId, specialization, fees, timing], (err) => {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, message: "Doctor added successfully!" });
                });
        });
});

app.delete('/api/admin/delete-doctor/:doc_id', (req, res) => {
    db.query("SELECT user_id FROM doctors WHERE doc_id = ?", [req.params.doc_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ success: false, message: "Doctor not found" });
        const userId = result[0].user_id;
        db.query("DELETE FROM doctors WHERE doc_id = ?", [req.params.doc_id], (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, message: "Doctor removed successfully!" });
            });
        });
    });
});

// --- PATIENT ---
app.get('/api/doctors', (req, res) => {
    db.query(`SELECT d.doc_id, u.full_name as doc_name, d.specialization, d.fees, d.timing 
              FROM doctors d JOIN users u ON d.user_id = u.id`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/appointments/book', (req, res) => {
    const { patient_id, doctor_id, appointment_date } = req.body;
    db.query("INSERT INTO appointments (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, 'pending')",
        [patient_id, doctor_id, appointment_date], (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Appointment booked successfully!" });
        });
});

app.get('/api/patient/appointments/:patient_id', (req, res) => {
    const sql = `SELECT a.app_id, u.full_name AS doctor_name, d.specialization, 
                 a.appointment_date, a.status 
                 FROM appointments a 
                 JOIN doctors d ON a.doctor_id = d.doc_id 
                 JOIN users u ON d.user_id = u.id 
                 WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`;
    db.query(sql, [req.params.patient_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- DOCTOR ---
app.get('/api/doctor/profile/:user_id', (req, res) => {
    db.query("SELECT doc_id, specialization, fees, timing FROM doctors WHERE user_id = ?",
        [req.params.user_id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ error: "Doctor not found" });
            res.json(result[0]); // direct { doc_id, specialization, fees, timing }
        });
});

app.get('/api/doctor/appointments/:doc_id', (req, res) => {
    const sql = `SELECT a.app_id, u.full_name AS patient_name, a.appointment_date, a.status 
                 FROM appointments a JOIN users u ON a.patient_id = u.id 
                 WHERE a.doctor_id = ? ORDER BY a.appointment_date DESC`;
    db.query(sql, [req.params.doc_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/appointments/update-status', (req, res) => {
    const { app_id, status } = req.body;
    db.query("UPDATE appointments SET status = ? WHERE app_id = ?", [status, app_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: `Appointment ${status} successfully` });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏥 HMS Server running on port ${PORT}`));