import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import nodemailer from "nodemailer";
import cron from "node-cron";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// 📧 Email Transporter
// ==========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error) => {
  if (error) console.error("❌ SMTP Connection Error:", error);
  else console.log("✅ SMTP Ready to Send Emails");
});

// ==========================
// ➕ Add Student
// ==========================
app.post("/api/add-student", (req, res) => {
  const { studentName, studentEmail, supervisorName, supervisorEmail, studyStartDate } = req.body;
  console.log("🧾 Received data:", req.body);

  if (!studentName || !studentEmail || !supervisorName || !supervisorEmail || !studyStartDate)
    return res.status(400).json({ error: "⚠️ All fields are required!" });

  const check = "SELECT * FROM students WHERE student_email = ?";
  db.query(check, [studentEmail], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length > 0) return res.status(400).json({ error: "Student already exists!" });

    const insert =
      "INSERT INTO students (student_name, student_email, supervisor_name, supervisor_email, study_start_date) VALUES (?, ?, ?, ?, ?)";
    db.query(insert, [studentName, studentEmail, supervisorName, supervisorEmail, studyStartDate], (err2) => {
      if (err2) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "✅ Student added successfully!" });
    });
  });
});

// ==========================
// 📋 Get All Students
// ==========================
app.get("/api/students", (req, res) => {
  db.query("SELECT * FROM students", (err, rows) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    res.json(
      rows.map((r) => ({
        id: r.id,
        studentName: r.student_name,
        studentEmail: r.student_email,
        supervisorName: r.supervisor_name,
        supervisorEmail: r.supervisor_email,
        studyStartDate: r.study_start_date ? r.study_start_date.toISOString().split("T")[0] : null,
      }))
    );
  });
});

// ==========================
// ✏️ Update Student
// ==========================
app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { studentName, studentEmail, supervisorName, supervisorEmail, studyStartDate } = req.body;

  if (!studentName || !studentEmail || !supervisorName || !supervisorEmail || !studyStartDate)
    return res.status(400).json({ error: "⚠️ All fields are required!" });

  const updateQuery = `
    UPDATE students 
    SET student_name = ?, student_email = ?, supervisor_name = ?, supervisor_email = ?, study_start_date = ?
    WHERE id = ?
  `;

  db.query(
    updateQuery,
    [studentName, studentEmail, supervisorName, supervisorEmail, studyStartDate, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database update failed" });
      res.json({ message: "✅ Student updated successfully!" });
    }
  );
});

// ==========================
// 🗑️ Delete Student
// ==========================
app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM students WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "🗑️ Student deleted successfully!" });
  });
});




// ==========================

async function sendEmail(student) {
  const { student_name, student_email, supervisor_name, supervisor_email } = student;

  const messageBody = `
Dear Students and Supervisors,

This is a kind reminder from the Postgraduate Studies (PGS) Office, Shah Abdul Latif University, Khairpur, to submit your research synopsis as per the announced schedule.

All M.Phil./Ph.D. scholars are requested to ensure submission by deadline to avoid any delay in processing.

If you have already submitted your synopsis, please ignore this email.

Thank you for your cooperation.

Best regards,
Postgraduate Studies (PGS) Office
SALU Khairpur
  `;

  try {
    // Send email to student
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student_email,
      subject: "Reminder: Submission of Research Synopsis",
      text: messageBody,
    });

    // Send email to supervisor
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: supervisor_email,
      subject: "Reminder: Submission of Research Synopsis",
      text: messageBody,
    });

    console.log(`✅ Emails sent to ${student_email} & ${supervisor_email}`);
  } catch (e) {
    console.error("❌ Email failed:", e.message);
  }
}

// ==========================
// 📤 Send Email to Single Student + Supervisor
// ==========================
app.post("/api/send-email", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "⚠️ Email is required!" });

  const query = "SELECT * FROM students WHERE student_email = ?";
  db.query(query, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(404).json({ error: "Student not found!" });

    try {
      await sendEmail(result[0]);
      res.json({ message: `📧 Emails sent to ${email} and their supervisor` });
    } catch (e) {
      res.status(500).json({ error: "❌ Failed to send emails: " + e.message });
    }
  });
});

// ==========================
// 📩 Send Reminders to All Students + Supervisors
// ==========================
app.post("/api/send-reminders", (req, res) => {
  db.query("SELECT * FROM students", async (err, students) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    for (const s of students) await sendEmail(s);
    res.json({ message: "📩 Reminder emails sent to all students and supervisors!" });
  });
});

// ==========================
// ⏰ Auto Cron Job (every 10 min)
// ==========================
cron.schedule("*/10 * * * *", () => {
  db.query("SELECT * FROM students", async (err, students) => {
    if (err) return console.error("Cron DB error:", err);
    for (const s of students) await sendEmail(s);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
