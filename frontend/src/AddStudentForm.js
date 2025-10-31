import React, { useState } from "react";
import "./AddStudentForm.css";
import axios from "axios";

const AddStudentForm = ({ onStudentAdded }) => {
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
      const res = await axios.post("http://localhost:5000/api/add-student", formData);
      alert(res.data.message);
      setFormData({
        studentName: "",
        studentEmail: "",
        supervisorName: "",
        supervisorEmail: "",
        studyStartDate: "",
      });
      onStudentAdded(); // refresh student list
    } catch (error) {
      if (error.response && error.response.data.error) {
        alert("❌ " + error.response.data.error);
      } else {
        alert("❌ Error: " + error.message);
      }
    }
  };

  return (
    <div className="add-student-card">
      <img src="/logo.png" alt="University Logo" className="form-logo" />
      <h2>Add Student</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="studentName" placeholder="Student Name" value={formData.studentName} onChange={handleChange} required />
        <input type="email" name="studentEmail" placeholder="Student Email" value={formData.studentEmail} onChange={handleChange} required />
        <input type="text" name="supervisorName" placeholder="Supervisor Name" value={formData.supervisorName} onChange={handleChange} required />
        <input type="email" name="supervisorEmail" placeholder="Supervisor Email" value={formData.supervisorEmail} onChange={handleChange} required />
        <input type="date" name="studyStartDate" value={formData.studyStartDate} onChange={handleChange} required />
        <button type="submit">Save Student</button>
      </form>
    </div>
  );
};

export default AddStudentForm;
