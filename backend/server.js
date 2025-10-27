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
// 📧 Email Transporter (Initial Test Only)
// ==========================
const testTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection at startup
testTransporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server Ready to Send Emails");
  }
});

// ==========================
// ➕ Add Student Endpoint
// ==========================
app.post("/api/add-student", (req, res) => {
  const {
    studentName,
    studentEmail,
    supervisorName,
    supervisorEmail,
    studyStartDate,
  } = req.body;

  if (
    !studentName ||
    !studentEmail ||
    !supervisorName ||
    !supervisorEmail ||
    !studyStartDate
  ) {
    return res.status(400).json({ error: "⚠️ All fields are required!" });
  }

  const checkQuery = "SELECT * FROM students WHERE student_email = ?";
  db.query(checkQuery, [studentEmail], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database query failed!" });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: "❌ This student already exists!" });
    }

    const insertQuery = `
      INSERT INTO students (student_name, student_email, supervisor_name, supervisor_email, study_start_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [studentName, studentEmail, supervisorName, supervisorEmail, studyStartDate],
      (err) => {
        if (err) {
          console.error("❌ Insert failed:", err);
          return res.status(500).json({ error: "Database insert failed!" });
        }

        res.json({ message: "✅ Student added successfully!" });
      }
    );
  });
});

// ==========================
// 📩 Manual Reminder Endpoint
// ==========================
app.post("/api/send-reminders", async (req, res) => {
  console.log("📧 Sending manual reminder emails...");

  const query = "SELECT * FROM students";
  db.query(query, async (err, students) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database query failed!" });
    }

    for (const student of students) {
      await sendReminderEmails(student, "manual");
    }

    res.json({ message: "✅ Reminder emails sent to all students!" });
  });
});

// ==========================
// ⏰ Cron Job - Every 10 Minutes Daily
// ==========================
cron.schedule("*/10 * * * *", async () => {
  console.log("📧 Sending reminder emails every 10 minutes...");

  const query = "SELECT * FROM students";
  db.query(query, async (err, students) => {
    if (err) {
      console.error("❌ Database error:", err);
      return;
    }

    for (const student of students) {
      await sendReminderEmails(student, "auto");
    }
  });
});

// ==========================
// 📨 Function to Send Emails
// ==========================
async function sendReminderEmails(student, type) {
  const {
    student_name,
    student_email,
    supervisor_name,
    supervisor_email,
    study_start_date,
  } = student;

  // ✅ Create a fresh transporter each time (prevents socket timeout)
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

  const message = `
Hello ${student_name},

This is your study reminder. 📚
Study Start Date: ${new Date(study_start_date).toDateString()}

Supervisor: ${supervisor_name}
Supervisor Email: ${supervisor_email}

Stay focused and have a great study session!
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student_email,
      subject: type === "auto" ? "📖 Automatic Study Reminder" : "📖 Study Reminder",
      text: message,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: supervisor_email,
      subject: type === "auto" ? "👨‍🏫 Auto Student Reminder" : "👨‍🏫 Student Reminder",
      text: `Hello ${supervisor_name},\n\nReminder for your student ${student_name}.\n\n${message}`,
    });

    console.log(`✅ Email sent to ${student_email} & ${supervisor_email}`);
  } catch (e) {
    console.error("❌ Email failed:", e.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
