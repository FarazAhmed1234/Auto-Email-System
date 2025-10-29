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

  return (
    <div className="add-student-page">
      <div className="add-student-card">
        <img src="/logo.png" alt="University Logo" className="form-logo" />
        <h2 className="form-title">Add Student</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            onChange={handleChange}
            value={formData.studentName}
            required
          />
          <input
            type="email"
            name="studentEmail"
            placeholder="Student Email"
            onChange={handleChange}
            value={formData.studentEmail}
            required
          />
          <input
            type="text"
            name="supervisorName"
            placeholder="Supervisor Name"
            onChange={handleChange}
            value={formData.supervisorName}
            required
          />
          <input
            type="email"
            name="supervisorEmail"
            placeholder="Supervisor Email"
            onChange={handleChange}
            value={formData.supervisorEmail}
            required
          />
          <input
            type="date"
            name="studyStartDate"
            onChange={handleChange}
            value={formData.studyStartDate}
            required
          />
          <button type="submit">Save Student</button>
        </form>
      </div>
    </div>
  );
};

export default AddStudentForm;
