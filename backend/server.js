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

/* ===============================
   📘 API: Add New Student
=============================== */
app.post("/api/add-student", (req, res) => {
  const {
    studentName,
    studentEmail,
    supervisorName,
    supervisorEmail,
    studyStartDate,
  } = req.body;

  if (!studentName || !studentEmail || !supervisorName || !supervisorEmail || !studyStartDate) {
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


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


cron.schedule("15 11 * * *", () => {
  console.log("📧 Sending daily emails...");

  const sql = "SELECT * FROM students";
  db.query(sql, async (err, students) => {
    if (err) {
      console.error("❌ Database error:", err);
      return;
    }

    for (const s of students) {
      const message = `
Hello ${s.student_name},

This is your daily study reminder. 📅
Study Start Date: ${new Date(s.study_start_date).toDateString()}

Supervisor: ${s.supervisor_name}
Supervisor Email: ${s.supervisor_email}

Have a productive day ahead!
      `;

      try {
        // Send to student
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: s.student_email,
          subject: "📚 Daily Study Reminder",
          text: message,
        });

        // Send to supervisor
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: s.supervisor_email,
          subject: "👨‍🏫 Student Daily Reminder",
          text: `Hello ${s.supervisor_name},\n\nReminder for your student ${s.student_name}.\n\n${message}`,
        });

        console.log(`✅ Email sent to ${s.student_email} & ${s.supervisor_email}`);
      } catch (e) {
        console.error("❌ Email failed:", e.message);
      }
    }
  });
});

/* ===============================
   🚀 Start Server
=============================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
