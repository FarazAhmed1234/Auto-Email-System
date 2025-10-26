import React, { useState } from "react";
import "./AddStudentForm.css";
import axios from "axios";

const AddStudentForm = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    supervisorName: "",
    supervisorEmail: "",
    studyStartDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/add-student", formData);
      alert("✅ Student added successfully!");
      setFormData({
        studentName: "",
        studentEmail: "",
        supervisorName: "",
        supervisorEmail: "",
        studyStartDate: "",
      });
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  const handleSendReminders = async () => {
    try {
      await axios.post("http://localhost:5000/api/send-reminders");
      alert("📧 Reminder emails sent to all students!");
    } catch (error) {
      alert("❌ Error sending emails: " + error.message);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px", margin: "auto" }}>
      <h2>Add Student</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          onChange={handleChange}
          value={formData.studentName}
          required
        />
        <br /><br />
        <input
          type="email"
          name="studentEmail"
          placeholder="Student Email"
          onChange={handleChange}
          value={formData.studentEmail}
          required
        />
        <br /><br />
        <input
          type="text"
          name="supervisorName"
          placeholder="Supervisor Name"
          onChange={handleChange}
          value={formData.supervisorName}
          required
        />
        <br /><br />
        <input
          type="email"
          name="supervisorEmail"
          placeholder="Supervisor Email"
          onChange={handleChange}
          value={formData.supervisorEmail}
          required
        />
        <br /><br />
        <input
          type="date"
          name="studyStartDate"
          onChange={handleChange}
          value={formData.studyStartDate}
          required
        />
        <br /><br />
        <button type="submit">Save Student</button>
      </form>

      <br />
      <button
        onClick={handleSendReminders}
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Send Reminder Emails
      </button>
    </div>
  );
};

export default AddStudentForm;
