import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  GraduationCap,
  UserPlus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Layers,
  Calendar,
  Hash,
  Award,
  BookOpen,
  FileSpreadsheet,
  Save,
  TrendingUp,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import "./StudentManagement.css";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSemOpen, setIsSemOpen] = useState(false);
  const deptRef = useRef(null);
  const semRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("profile");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    dob: "",
    email: "",
    contact: "",
    address: "",
    departmentId: "",
    departmentName: "",
    currentSemester: 1,
    marks: {},
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setIsDeptOpen(false);
      }
      if (semRef.current && !semRef.current.contains(event.target)) {
        setIsSemOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const deptSnap = await getDocs(collection(db, "departments"));
      setDepartments(
        deptSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );

      const studentSnap = await getDocs(collection(db, "students"));
      setStudents(
        studentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddForm = () => {
    setFormData({
      name: "",
      rollNo: "",
      dob: "",
      email: "",
      contact: "",
      address: "",
      departmentId: "",
      departmentName: "",
      currentSemester: 1,
      marks: {},
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (student) => {
    setFormData({ ...student });
    setIsEditing(true);
    setEditId(student.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateDoc(doc(db, "students", editId), formData);
      } else {
        await addDoc(collection(db, "students"), formData);
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Error saving student: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this student record?")) {
      await deleteDoc(doc(db, "students", id));
      fetchData();
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setActiveModalTab("profile");
    setSelectedSemester(Number(student.currentSemester) || 1);
    setStudentMarks(student.marks || {});
    fetchSubjectsForSemester(
      student.departmentId,
      Number(student.currentSemester) || 1,
    );
  };

  const fetchSubjectsForSemester = async (deptId, sem) => {
    try {
      const q = query(
        collection(db, "subjects"),
        where("deptId", "==", deptId),
        where("semester", "==", Number(sem)),
      );
      const querySnapshot = await getDocs(q);
      const subjects = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSemesterSubjects(subjects);
    } catch (error) {
      console.error("Error fetching mapped subjects:", error);
    }
  };

  const handleSemesterTabChange = (sem) => {
    setSelectedSemester(sem);
    if (selectedStudent) {
      fetchSubjectsForSemester(selectedStudent.departmentId, sem);
    }
  };

  const handleMarkChange = (subjectId, value) => {
    const markValue = Math.min(100, Math.max(0, Number(value) || 0));
    setStudentMarks({
      ...studentMarks,
      [subjectId]: markValue,
    });
  };

  const getGradeDetails = (mark) => {
    if (mark >= 90)
      return {
        grade: "O",
        point: 10,
        label: "Outstanding",
        color: "badge-green",
      };
    if (mark >= 80)
      return { grade: "A+", point: 9, label: "Excellent", color: "badge-blue" };
    if (mark >= 70)
      return {
        grade: "A",
        point: 8,
        label: "Very Good",
        color: "badge-indigo",
      };
    if (mark >= 60)
      return { grade: "B+", point: 7, label: "Good", color: "badge-yellow" };
    if (mark >= 50)
      return { grade: "B", point: 6, label: "Average", color: "badge-orange" };
    return { grade: "U", point: 0, label: "Reappear", color: "badge-red" };
  };

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    Object.entries(studentMarks || {}).forEach(([subId, mark]) => {
      const credits = 3;
      const gradeInfo = getGradeDetails(Number(mark));
      totalPoints += gradeInfo.point * credits;
      totalCredits += credits;
    });

    if (totalCredits === 0) return "0.00";
    return (totalPoints / totalCredits).toFixed(2);
  };

  const handleSaveMarks = async () => {
    if (!selectedStudent) return;
    setSavingMarks(true);
    try {
      const studentRef = doc(db, "students", selectedStudent.id);
      await updateDoc(studentRef, { marks: studentMarks });

      setSelectedStudent({ ...selectedStudent, marks: studentMarks });
      alert("Academic results & grades updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Error saving marks:", error);
      alert("Failed to save marks.");
    } finally {
      setSavingMarks(false);
    }
  };

  const selectedDeptObj = departments.find(
    (d) => d.id === formData.departmentId,
  );
  const maxSemesters = selectedDeptObj
    ? Number(selectedDeptObj.totalSemesters)
    : 8;
  const semesterOptions = Array.from({ length: maxSemesters }, (_, i) => i + 1);

  const studentDeptObj = selectedStudent
    ? departments.find((d) => d.id === selectedStudent.departmentId)
    : null;
  const studentTotalSems = studentDeptObj
    ? Number(studentDeptObj.totalSemesters) || 6
    : 6;
  const modalSemesterList = Array.from(
    { length: studentTotalSems },
    (_, i) => i + 1,
  );

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GraduationCap className="title-icon" /> Student Records
          </h1>
          <p className="page-subtitle">
            Manage student profiles, department subject mapping, and cumulative
            CGPA performance.
          </p>
        </div>
        <button className="primary-btn" onClick={openAddForm}>
          <UserPlus size={18} /> Add New Student
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="empty-state">
            <p>Loading Student Records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={48} className="empty-icon" />
            <h3>No Students Found</h3>
            <p>Click 'Add New Student' to enroll the first student.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Profile</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Performance (CGPA)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                let pts = 0,
                  creds = 0;
                Object.values(student.marks || {}).forEach((m) => {
                  const g = getGradeDetails(Number(m));
                  pts += g.point * 3;
                  creds += 3;
                });
                const cgpaPreview =
                  creds > 0 ? (pts / creds).toFixed(2) : "0.00";

                return (
                  <tr key={student.id}>
                    <td>
                      <div
                        className="user-cell clickable-row"
                        onClick={() => handleStudentClick(student)}
                      >
                        <div className="avatar-small student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-link">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-outline">
                        <Hash size={12} style={{ marginRight: "4px" }} />
                        {student.rollNo}
                      </span>
                    </td>
                    <td>{student.departmentName}</td>
                    <td>
                      <span className="badge-gray">
                        Sem {student.currentSemester}
                      </span>
                    </td>
                    <td>
                      <div className="cgpa-pill">
                        <TrendingUp size={14} />
                        <span>{cgpaPreview} CGPA</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-btn edit-btn"
                          title="Edit Profile"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(student);
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(student.id);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div
            className="modal-content-pro fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-modal-header">
              <div className="pro-header-left">
                <div className="pro-avatar-lg">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectedStudent.name}</h2>
                  <p>
                    <Hash
                      size={13}
                      style={{ display: "inline", marginRight: "2px" }}
                    />
                    {selectedStudent.rollNo} • {selectedStudent.email}
                  </p>
                  <div className="pro-badges-row">
                    <span className="pro-badge-dept">
                      {selectedStudent.departmentName}
                    </span>
                    <span className="pro-badge-sem">
                      Semester {selectedStudent.currentSemester}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pro-header-right-group">
                <div className="pro-header-cgpa-card">
                  <div className="cgpa-icon-bg">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="cgpa-title">CGPA</span>
                    <h3 className="cgpa-score">{calculateCGPA()}</h3>
                  </div>
                </div>
                <button
                  className="close-btn-pro"
                  onClick={() => setSelectedStudent(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <button
                className="close-btn-pro close-btn-pro-mobile"
                onClick={() => setSelectedStudent(null)}
              >
                <X size={18} />
              </button>
              <div className="mobile-cgpa-chip">
                <Award size={14} />
                <span>{calculateCGPA()} CGPA</span>
              </div>
            </div>

            <div className="pro-tabs">
              <button
                className={`pro-tab ${
                  activeModalTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("profile")}
              >
                <User size={16} /> Personal & Contact Profile
              </button>
              <button
                className={`pro-tab ${
                  activeModalTab === "academics" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("academics")}
              >
                <FileSpreadsheet size={16} /> Semester Marks & CGPA Report
              </button>
            </div>

            <div className="pro-modal-body">
              {activeModalTab === "profile" ? (
                <div className="profile-grid-info">
                  <div className="info-card">
                    <span className="info-label">
                      <Hash size={14} /> Roll Number / ID
                    </span>
                    <span className="info-value">{selectedStudent.rollNo}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">
                      <Building2 size={14} /> Enrolled Department
                    </span>
                    <span className="info-value">
                      {selectedStudent.departmentName}
                    </span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">
                      <Layers size={14} /> Current Semester
                    </span>
                    <span className="info-value">
                      Semester {selectedStudent.currentSemester}
                    </span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">
                      <Mail size={14} /> Email Address
                    </span>
                    <span className="info-value">{selectedStudent.email}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">
                      <Phone size={14} /> Contact Number
                    </span>
                    <span className="info-value">
                      {selectedStudent.contact}
                    </span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">
                      <Calendar size={14} /> Date of Birth
                    </span>
                    <span className="info-value">{selectedStudent.dob}</span>
                  </div>
                  <div className="info-card full-width">
                    <span className="info-label">
                      <MapPin size={14} /> Permanent Address
                    </span>
                    <span className="info-value">
                      {selectedStudent.address}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="academics-section">
                  <div className="semester-subtabs">
                    <span className="sem-label-text">Select Semester:</span>
                    {modalSemesterList.map((sem) => (
                      <button
                        key={sem}
                        className={`sem-pill ${
                          selectedSemester === sem ? "active" : ""
                        }`}
                        onClick={() => handleSemesterTabChange(sem)}
                      >
                        Sem {sem}
                      </button>
                    ))}
                  </div>

                  <div className="marks-table-wrapper">
                    {semesterSubjects.length === 0 ? (
                      <div
                        className="empty-state box-empty"
                        style={{ padding: "40px" }}
                      >
                        <BookOpen size={40} className="empty-icon" />
                        <h4>
                          No Subjects Mapped for Semester {selectedSemester}
                        </h4>
                        <p>
                          Configure and map subjects for this semester under
                          Department Management first.
                        </p>
                      </div>
                    ) : (
                      <table className="data-table marks-table">
                        <thead>
                          <tr>
                            <th>Subject Code & Title</th>
                            <th>Credits</th>
                            <th style={{ width: "150px" }}>Exam Marks (100)</th>
                            <th>Grade Awarded</th>
                            <th>Performance Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semesterSubjects.map((sub) => {
                            const mark =
                              studentMarks[sub.id] !== undefined
                                ? studentMarks[sub.id]
                                : "";
                            const gradeInfo =
                              mark !== ""
                                ? getGradeDetails(Number(mark))
                                : null;

                            return (
                              <tr key={sub.id}>
                                <td data-label="Subject">
                                  <div className="font-medium">{sub.name}</div>
                                  <div className="text-xs text-gray">
                                    {sub.code}
                                  </div>
                                </td>
                                <td data-label="Credits">
                                  {sub.credits || 3} Credits
                                </td>
                                <td data-label="Marks">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={mark}
                                    onChange={(e) =>
                                      handleMarkChange(sub.id, e.target.value)
                                    }
                                    placeholder="Enter mark"
                                    className="mark-input-pro"
                                  />
                                </td>
                                <td data-label="Grade">
                                  {gradeInfo ? (
                                    <span
                                      className={`grade-badge ${gradeInfo.color}`}
                                    >
                                      {gradeInfo.grade} - {gradeInfo.label}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray">
                                      Pending Entry
                                    </span>
                                  )}
                                </td>
                                <td data-label="Status">
                                  {mark !== "" ? (
                                    Number(mark) >= 50 ? (
                                      <span className="status-pass">
                                        <CheckCircle
                                          size={14}
                                          style={{
                                            display: "inline",
                                            marginRight: "3px",
                                          }}
                                        />{" "}
                                        Pass
                                      </span>
                                    ) : (
                                      <span className="status-fail">
                                        Reappear
                                      </span>
                                    )
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="modal-footer-pro">
                    <div className="footer-cgpa-hint">
                      <span>
                        Calculated CGPA for profile:{" "}
                        <strong>{calculateCGPA()}</strong>
                      </span>
                    </div>
                    <button
                      className="primary-btn"
                      onClick={handleSaveMarks}
                      disabled={savingMarks || semesterSubjects.length === 0}
                    >
                      <Save size={16} />{" "}
                      {savingMarks
                        ? "Saving Results..."
                        : "Save Semester Results"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`slide-panel ${showForm ? "open" : ""}`}>
        <div className="panel-header">
          <div className="panel-title-wrapper">
            {isEditing ? (
              <Edit2 className="panel-icon edit-icon" size={24} />
            ) : (
              <UserPlus className="panel-icon" size={24} />
            )}
            <h2>{isEditing ? "Edit Student Details" : "Student Enrollment"}</h2>
          </div>
          <button className="close-btn" onClick={() => setShowForm(false)}>
            <X size={20} />
          </button>
        </div>

        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h4 className="section-title">Personal Information</h4>
            <div className="form-group">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Student Name"
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Roll Number / ID <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Hash size={18} className="input-icon" />
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    required
                    placeholder="21CS001"
                    className="modern-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Date of Birth <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="modern-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="student@email.com"
                    className="modern-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Contact Number <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                    placeholder="9876543210"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                Address <span className="required">*</span>
              </label>
              <div className="input-wrapper textarea-wrapper">
                <MapPin size={18} className="input-icon" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  required
                  placeholder="Home Address"
                  className="modern-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section">
            <h4 className="section-title">Academic Mapping</h4>

            <div className="form-group" ref={deptRef}>
              <label>
                Department <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <Building2 size={18} className="input-icon" />
                <div
                  className={`custom-dropdown-trigger ${
                    isDeptOpen ? "active" : ""
                  }`}
                  onClick={() => setIsDeptOpen(!isDeptOpen)}
                >
                  <span className="selected-value-text">
                    {formData.departmentName || "Select Department"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`dropdown-chevron ${isDeptOpen ? "open" : ""}`}
                  />
                </div>

                {isDeptOpen && (
                  <div className="custom-dropdown-list-box fade-in">
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        className={`custom-dropdown-item ${
                          formData.departmentId === dept.id ? "selected" : ""
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            departmentId: dept.id,
                            departmentName: dept.name,
                            currentSemester: 1,
                          });
                          setIsDeptOpen(false);
                        }}
                      >
                        {dept.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" ref={semRef}>
              <label>
                Current Semester <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <Layers size={18} className="input-icon" />
                <div
                  className={`custom-dropdown-trigger ${
                    !formData.departmentId ? "disabled" : ""
                  } ${isSemOpen ? "active" : ""}`}
                  onClick={() =>
                    formData.departmentId && setIsSemOpen(!isSemOpen)
                  }
                >
                  <span className="selected-value-text">
                    {formData.departmentId
                      ? `Semester ${formData.currentSemester}`
                      : "Select Department First"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`dropdown-chevron ${isSemOpen ? "open" : ""}`}
                  />
                </div>

                {isSemOpen && formData.departmentId && (
                  <div className="custom-dropdown-list-box fade-in">
                    {semesterOptions.map((sem) => (
                      <div
                        key={sem}
                        className={`custom-dropdown-item ${
                          Number(formData.currentSemester) === sem
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setFormData({ ...formData, currentSemester: sem });
                          setIsSemOpen(false);
                        }}
                      >
                        Semester {sem}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="panel-footer">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn submit-btn"
              disabled={loading}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle2 size={18} />{" "}
                  {isEditing ? "Update Profile" : "Enroll Student"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showForm && (
        <div className="panel-overlay" onClick={() => setShowForm(false)}></div>
      )}
    </div>
  );
};

export default StudentManagement;
