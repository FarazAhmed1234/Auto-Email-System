import React, { useState, useEffect } from "react";
import axios from "axios";
import AddStudentForm from "./AddStudentForm";
import "./HomePage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HomePage = () => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showTable, setShowTable] = useState(false);

  // ===== Fetch Students =====
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (error) {
      toast.error("❌ Failed to fetch students: " + error.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ===== Delete Student =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      toast.success("🗑️ Student deleted successfully!");
      fetchStudents();
    } catch (error) {
      toast.error("❌ Error deleting student: " + error.message);
    }
  };

  // ===== Edit Student =====
  const handleEdit = (student) => {
    setEditingStudent({ ...student });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleSaveUpdate = async () => {
    if (
      !editingStudent.studentName ||
      !editingStudent.studentEmail ||
      !editingStudent.supervisorName ||
      !editingStudent.supervisorEmail ||
      !editingStudent.studyStartDate
    ) {
      toast.warning("⚠️ All fields are required!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/students/${editingStudent.id}`,
        editingStudent
      );
      toast.success("✅ Student updated successfully!");
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error("❌ Error updating student: " + error.message);
    }
  };

  // ===== Input Change for Edit =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===== Send Email =====
  const handleSendEmail = async (email) => {
    try {
      await axios.post("http://localhost:5000/api/send-email", { email });
      toast.info(`📧 Email sent to ${email}`);
    } catch (error) {
      toast.error("❌ Error sending email: " + error.message);
    }
  };

  // ===== Send All Reminders =====
  const handleSendReminders = async () => {
    try {
      await axios.post("http://localhost:5000/api/send-reminders");
      toast.success("📩 Reminder emails sent to all students!");
    } catch (error) {
      toast.error("❌ Error sending reminders: " + error.message);
    }
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setShowForm(false);
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
          <button className="btn add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close Form" : "Add Student"}
          </button>
          <button className="btn reminder-btn" onClick={handleSendReminders}>
            Send Reminders
          </button>
        </div>
      </header>

      <div className="welcome-text">
        <h2>Welcome to the Directorate of Postgraduate Studies</h2>
      </div>

      {/* ======= IMAGE / TABLE SECTION ======= */}
      {showForm ? (
        <AddStudentForm onStudentAdded={handleStudentAdded} />
      ) : (
        <div className="student-display">
          {!showTable ? (
            <div
              className="image-section"
              onClick={() => setShowTable(true)}
              onMouseEnter={() => setShowTable(true)}
            >
              <img
                src="/students.png"
                alt="View Students"
                className="hover-image"
              />
              <p className="hover-text">Click or Hover to View Student Records</p>
            </div>
          ) : (
            <div className="table-section">
              <h2>📋 Student Records</h2>
              {students.length > 0 ? (
                <table className="students-table">
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
                        {editingStudent && editingStudent.id === s.id ? (
                          <>
                            <td>
                              <input
                                type="text"
                                name="studentName"
                                value={editingStudent.studentName}
                                onChange={handleInputChange}
                              />
                            </td>
                            <td>
                              <input
                                type="email"
                                name="studentEmail"
                                value={editingStudent.studentEmail}
                                onChange={handleInputChange}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name="supervisorName"
                                value={editingStudent.supervisorName}
                                onChange={handleInputChange}
                              />
                            </td>
                            <td>
                              <input
                                type="email"
                                name="supervisorEmail"
                                value={editingStudent.supervisorEmail}
                                onChange={handleInputChange}
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                name="studyStartDate"
                                value={editingStudent.studyStartDate}
                                onChange={handleInputChange}
                              />
                            </td>
                            <td className="actions-cell">
                              <button className="btn save-btn" onClick={handleSaveUpdate}>
                                Save
                              </button>
                              <button className="btn cancel-btn" onClick={handleCancelEdit}>
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{s.studentName}</td>
                            <td>{s.studentEmail}</td>
                            <td>{s.supervisorName}</td>
                            <td>{s.supervisorEmail}</td>
                            <td>{s.studyStartDate}</td>
                            <td className="actions-cell">
                              <button className="btn update-btn" onClick={() => handleEdit(s)}>
                                Update
                              </button>
                              <button className="btn delete-btn" onClick={() => handleDelete(s.id)}>
                                Delete
                              </button>
                              <button
                                className="btn email-btn"
                                onClick={() => handleSendEmail(s.studentEmail)}
                              >
                                Email
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No students found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== Toast Container ===== */}
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default HomePage;
