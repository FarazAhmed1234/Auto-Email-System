import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// 📧 Email Transporter Setup
// ==========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ✅ prevents self-signed cert errors
  },
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

  // ✅ Check if student already exists
  const checkQuery = "SELECT * FROM students WHERE student_email = ?";
  db.query(checkQuery, [studentEmail], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database query failed!" });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: "❌ This student already exists!" });
    }

    // ✅ Insert student into DB
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

        // ===============================
        // 🔁 Send email every 1 hour
        // ===============================
        const sendEmail = async () => {
          try {
            const message = `
Hello ${studentName},

This is your hourly study reminder. 📚
Study Start Date: ${new Date(studyStartDate).toDateString()}

Supervisor: ${supervisorName}
Supervisor Email: ${supervisorEmail}

Stay focused and have a great study session!
            `;

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: studentEmail,
              subject: "📖 Hourly Study Reminder",
              text: message,
            });

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: supervisorEmail,
              subject: "👨‍🏫 Hourly Student Reminder",
              text: `Hello ${supervisorName},\n\nReminder for your student ${studentName}.\n\n${message}`,
            });

            console.log(`✅ Email sent to ${studentEmail} & ${supervisorEmail}`);
          } catch (e) {
            console.error("❌ Email failed:", e.message);
          }
        };

        // ✅ Send first email immediately
        sendEmail();

        // ✅ Repeat every 1 hour (3600000 ms)
        setInterval(sendEmail, 60 * 60 * 1000);
      }
    );
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
