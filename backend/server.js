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
// 📧 Gmail Transporter (Secure Setup)
// ==========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // ✅ Secure SSL port
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password here
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

// ==========================
// 🧪 Test Email Endpoint
// ==========================
app.get("/api/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "✅ Test Email",
      text: "This is a test email from your Nodemailer setup.",
    });
    res.json({ message: "✅ Test email sent successfully!" });
  } catch (error) {
    console.error("❌ Test email failed:", error.message);
    res.status(500).json({ error: error.message });
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


app.post("/api/send-reminders", async (req, res) => {
  console.log("📧 Sending manual reminder emails...");

  const query = "SELECT * FROM students";
  db.query(query, async (err, students) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database query failed!" });
    }

    for (const student of students) {
      const {
        student_name,
        student_email,
        supervisor_name,
        supervisor_email,
        study_start_date,
      } = student;

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
          subject: "📖 Study Reminder",
          text: message,
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: supervisor_email,
          subject: "👨‍🏫 Student Reminder",
          text: `Hello ${supervisor_name},\n\nReminder for your student ${student_name}.\n\n${message}`,
        });

        console.log(`✅ Email sent to ${student_email} & ${supervisor_email}`);
      } catch (e) {
        console.error("❌ Email failed:", e.message);
      }
    }

    res.json({ message: "✅ Reminder emails sent to all students!" });
  });
});


cron.schedule("0 * * * *", async () => {
  console.log("📧 Sending hourly reminder emails...");

  const query = "SELECT * FROM students";
  db.query(query, async (err, students) => {
    if (err) {
      console.error("❌ Database error:", err);
      return;
    }

    for (const student of students) {
      const {
        student_name,
        student_email,
        supervisor_name,
        supervisor_email,
        study_start_date,
      } = student;

      const message = `
Hello ${student_name},

This is your hourly study reminder. 📚
Study Start Date: ${new Date(study_start_date).toDateString()}

Supervisor: ${supervisor_name}
Supervisor Email: ${supervisor_email}

Stay focused and have a great study session!
      `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student_email,
          subject: "📖 Hourly Study Reminder",
          text: message,
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: supervisor_email,
          subject: "👨‍🏫 Hourly Student Reminder",
          text: `Hello ${supervisor_name},\n\nReminder for your student ${student_name}.\n\n${message}`,
        });

        console.log(`✅ Email sent to ${student_email} & ${supervisor_email}`);
      } catch (e) {
        console.error("❌ Email failed:", e.message);
      }
    }
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
