import React, { useState, useEffect } from "react";
import axios from "axios";
import AddStudentForm from "./AddStudentForm";
import "./HomePage.css";

const HomePage = () => {
    const [students, setStudents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

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

    // Start editing a student
    const handleEdit = (student) => {
        setEditingStudent({ ...student });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingStudent(null);
    };

    // Save updated student
    const handleSaveUpdate = async () => {
        if (!editingStudent.studentName || !editingStudent.studentEmail || 
            !editingStudent.supervisorName || !editingStudent.supervisorEmail || 
            !editingStudent.studyStartDate) {
            alert("⚠️ All fields are required!");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/students/${editingStudent.id}`, editingStudent);
            alert("✅ Student updated successfully!");
            setEditingStudent(null);
            fetchStudents();
        } catch (error) {
            alert("❌ Error updating student: " + error.message);
        }
    };

    // Handle input change for editing
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingStudent(prev => ({
            ...prev,
            [name]: value
        }));
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
                                    {editingStudent && editingStudent.id === s.id ? (
                                        // Edit Mode
                                        <>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="studentName"
                                                    value={editingStudent.studentName}
                                                    onChange={handleInputChange}
                                                    className="edit-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="email"
                                                    name="studentEmail"
                                                    value={editingStudent.studentEmail}
                                                    onChange={handleInputChange}
                                                    className="edit-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="supervisorName"
                                                    value={editingStudent.supervisorName}
                                                    onChange={handleInputChange}
                                                    className="edit-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="email"
                                                    name="supervisorEmail"
                                                    value={editingStudent.supervisorEmail}
                                                    onChange={handleInputChange}
                                                    className="edit-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="date"
                                                    name="studyStartDate"
                                                    value={editingStudent.studyStartDate}
                                                    onChange={handleInputChange}
                                                    className="edit-input"
                                                />
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn save-btn"
                                                        onClick={handleSaveUpdate}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        className="action-btn cancel-btn"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // View Mode
                                        <>
                                            <td>{s.studentName}</td>
                                            <td>{s.studentEmail}</td>
                                            <td>{s.supervisorName}</td>
                                            <td>{s.supervisorEmail}</td>
                                            <td>{s.studyStartDate}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn update-btn"
                                                        onClick={() => handleEdit(s)}
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleDelete(s.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        className="action-btn email-btn"
                                                        onClick={() => handleSendEmail(s.studentEmail)}
                                                    >
                                                        Email
                                                    </button>
                                                </div>
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
        </div>
    );
};

export default HomePage;