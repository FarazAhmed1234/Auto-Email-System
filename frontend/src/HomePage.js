import React, { useState, useEffect } from "react";
import axios from "axios";
import AddStudentForm from "./AddStudentForm";
import "./HomePage.css";

const HomePage = () => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (error) {
      alert("❌ Failed to fetch students: " + error.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Delete a student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      alert("🗑️ Student deleted successfully!");
      fetchStudents();
    } catch (error) {
      alert("❌ Error deleting student: " + error.message);
    }
  };

  // Send email to a single student
  const handleSendEmail = async (email) => {
    try {
      await axios.post("http://localhost:5000/api/send-email", { email });
      alert(`📧 Email sent to ${email}`);
    } catch (error) {
      alert("❌ Error sending email: " + error.message);
    }
  };

  // Send reminders to all students
  const handleSendReminders = async () => {
    try {
      await axios.post("http://localhost:5000/api/send-reminders");
      alert("📩 Reminder emails sent to all students!");
    } catch (error) {
      alert("❌ Error sending reminders: " + error.message);
    }
  };

  return (
    <div className="homepage-container">
      {/* ======= HEADER ======= */}
      <header className="header">
  <div className="logo-section">
    <img src="/logo.png" alt="University Logo" className="logo" />
    <h1>Shah Abdul Latif University, Khairpur</h1>
  </div>

  <div className="button-section">
    <button onClick={() => setShowForm(!showForm)}>
      {showForm ? "Close Form" : "Add Student"}
    </button>
    <button className="reminder-btn" onClick={handleSendReminders}>
      Send Reminders
    </button>
  </div>
</header>


      {/* ======= ADD STUDENT FORM ======= */}
      {showForm && (
        <div className="form-section">
          <AddStudentForm />
        </div>
      )}

      {/* ======= STUDENT TABLE ======= */}
      <div className="table-section">
        <h2>All Students</h2>
        {students.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Supervisor</th>
                <th>Supervisor Email</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.studentName}</td>
                  <td>{s.studentEmail}</td>
                  <td>{s.supervisorName}</td>
                  <td>{s.supervisorEmail}</td>
                  <td>{s.studyStartDate}</td>
                 <td>
  <button className="action-btn update-btn" onClick={() => alert("Update feature coming soon!")}>
    Update
  </button>
  <button className="action-btn delete-btn" onClick={() => handleDelete(s.id)}>
    Delete
  </button>
  <button className="action-btn email-btn" onClick={() => handleSendEmail(s.studentEmail)}>
    Email
  </button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
