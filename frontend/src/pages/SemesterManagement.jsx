import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  FileText,
  Hash,
  UserCheck,
  LayoutList,
  ChevronDown,
} from "lucide-react";
import "./SemesterManagement.css";

const SemesterManagement = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [activeSemester, setActiveSemester] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const staffRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: "",
    syllabus: "",
    staffId: "",
    staffName: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (staffRef.current && !staffRef.current.contains(event.target)) {
        setIsStaffOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSubjects = useCallback(async () => {
    if (!deptId) return;
    try {
      const q = query(
        collection(db, "subjects"),
        where("deptId", "==", deptId),
      );
      const querySnapshot = await getDocs(q);
      setSubjects(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (error) {
      console.error("Error fetching subjects: ", error);
    }
  }, [deptId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptRef = doc(db, "departments", deptId);
        const deptSnap = await getDoc(deptRef);

        if (deptSnap.exists()) {
          setDepartment({ id: deptSnap.id, ...deptSnap.data() });
        } else {
          console.error("Department not found in database.");
          setDepartment({ name: "Unknown Department", totalSemesters: 8 });
        }

        const staffSnap = await getDocs(collection(db, "staff"));
        setStaffList(
          staffSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );

        fetchSubjects();
      } catch (error) {
        console.error("Error fetching initial data: ", error);
      }
    };

    if (deptId) {
      fetchData();
    }
  }, [deptId, fetchSubjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStaffSelect = (staff) => {
    setFormData({
      ...formData,
      staffId: staff.id,
      staffName: staff.name,
    });
    setIsStaffOpen(false);
  };

  const openAddForm = () => {
    setFormData({
      name: "",
      code: "",
      credits: "",
      syllabus: "",
      staffId: "",
      staffName: "",
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (sub) => {
    setFormData({
      name: sub.name || "",
      code: sub.code || "",
      credits: sub.credits || "",
      syllabus: sub.syllabus || "",
      staffId: sub.staffId || "",
      staffName: sub.staffName || "",
    });
    setIsEditing(true);
    setEditId(sub.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subjectData = { ...formData, deptId, semester: activeSemester };
      if (isEditing) {
        await updateDoc(doc(db, "subjects", editId), subjectData);
      } else {
        await addDoc(collection(db, "subjects"), subjectData);
      }
      setShowForm(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error saving subject: ", error);
      alert("Failed to save subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteDoc(doc(db, "subjects", id));
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject: ", error);
      }
    }
  };

  if (!department) {
    return (
      <div
        className="page-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <h2>Loading Department Details...</h2>
      </div>
    );
  }

  const activeSubjects = subjects.filter(
    (sub) => sub.semester === activeSemester,
  );

  const semesterCount = Number(department.totalSemesters) || 8;
  const totalSemestersArray = Array.from(
    { length: semesterCount },
    (_, i) => i + 1,
  );

  const selectedStaffObj = staffList.find((s) => s.id === formData.staffId);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate("/departments")}>
            <ArrowLeft size={16} /> Back to Departments
          </button>
          <h1 className="page-title mt-2">
            <BookOpen className="title-icon" /> {department.name}
          </h1>
          <p className="page-subtitle">
            Manage semesters, syllabus, and staff assignments.
          </p>
        </div>
        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Subject to Sem {activeSemester}
        </button>
      </div>

      <div className="semester-layout">
        <div className="semester-tabs">
          <h3 className="tabs-title">
            <LayoutList size={18} /> Semesters
          </h3>
          <div className="tabs-list">
            {totalSemestersArray.map((sem) => (
              <button
                key={sem}
                className={`sem-tab ${activeSemester === sem ? "active" : ""}`}
                onClick={() => setActiveSemester(sem)}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        <div className="subjects-container">
          <div className="subjects-header">
            <h3>Subjects for Semester {activeSemester}</h3>
            <span className="badge-blue">{activeSubjects.length} Subjects</span>
          </div>

          {activeSubjects.length === 0 ? (
            <div className="empty-state box-empty">
              <BookOpen size={40} className="empty-icon" />
              <h4>No Subjects Added</h4>
              <p>Add subjects and assign staff for this semester.</p>
            </div>
          ) : (
            <div className="subject-list">
              {activeSubjects.map((sub) => (
                <div className="subject-card" key={sub.id}>
                  <div className="sub-card-top">
                    <span className="sub-code">{sub.code}</span>
                    <div className="action-buttons">
                      <button
                        className="icon-btn edit-btn"
                        onClick={() => openEditForm(sub)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => handleDelete(sub.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 className="sub-name">{sub.name}</h4>

                  <div className="sub-details">
                    <div className="detail-item">
                      <Hash size={14} /> {sub.credits} Credits
                    </div>
                    {sub.staffName ? (
                      <div className="detail-item staff-assigned">
                        <UserCheck size={14} /> {sub.staffName}
                      </div>
                    ) : (
                      <div className="detail-item staff-pending">
                        <UserCheck size={14} /> Unassigned
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`slide-panel ${showForm ? "open" : ""}`}>
        <div className="panel-header">
          <div className="panel-title-wrapper">
            {isEditing ? (
              <Edit2 className="panel-icon edit-icon" size={24} />
            ) : (
              <BookOpen className="panel-icon" size={24} />
            )}
            <h2>
              {isEditing
                ? "Edit Subject"
                : `Add Subject (Sem ${activeSemester})`}
            </h2>
          </div>
          <button className="close-btn" onClick={() => setShowForm(false)}>
            <X size={20} />
          </button>
        </div>

        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h4 className="section-title">Subject Details</h4>

            <div className="form-group">
              <label>
                Subject Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <BookOpen size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Data Structures"
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Subject Code <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Hash size={18} className="input-icon" />
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="CS8391"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Credits <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FileText size={18} className="input-icon" />
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="10"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "10px" }}>
              <label>
                Syllabus / Units <span className="required">*</span>
              </label>
              <div className="input-wrapper textarea-wrapper">
                <FileText size={18} className="input-icon" />
                <textarea
                  name="syllabus"
                  value={formData.syllabus}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder="Enter syllabus details..."
                  className="modern-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section">
            <h4 className="section-title">Staff Assignment</h4>

            {/* Custom Styled Staff Dropdown */}
            <div className="form-group" ref={staffRef}>
              <label>
                Assign to Staff <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <UserCheck size={18} className="input-icon" />
                <div
                  className={`custom-dropdown-trigger ${
                    isStaffOpen ? "active" : ""
                  }`}
                  onClick={() => setIsStaffOpen(!isStaffOpen)}
                >
                  <span className="selected-value-text">
                    {formData.staffName
                      ? `${formData.staffName} ${
                          selectedStaffObj?.qualification
                            ? `(${selectedStaffObj.qualification})`
                            : ""
                        }`
                      : "Select a Staff Member"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`dropdown-chevron ${isStaffOpen ? "open" : ""}`}
                  />
                </div>

                {isStaffOpen && (
                  <div className="custom-dropdown-list-box fade-in">
                    {staffList.length === 0 ? (
                      <div
                        className="custom-dropdown-item"
                        style={{ color: "#94a3b8" }}
                      >
                        No staff members found
                      </div>
                    ) : (
                      staffList.map((staff) => (
                        <div
                          key={staff.id}
                          className={`custom-dropdown-item ${
                            formData.staffId === staff.id ? "selected" : ""
                          }`}
                          onClick={() => handleStaffSelect(staff)}
                        >
                          {staff.name} ({staff.qualification || "Staff"})
                        </div>
                      ))
                    )}
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
                  <CheckCircle2 size={18} /> Save Subject
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

export default SemesterManagement;
