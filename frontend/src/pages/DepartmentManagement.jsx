import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  BookOpen,
  Layers,
  FileText,
  ArrowRight,
  Users,
  ChevronDown,
} from "lucide-react";
import "./DepartmentManagement.css";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSemOpen, setIsSemOpen] = useState(false);
  const semRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalSemesters: "", 
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (semRef.current && !semRef.current.contains(event.target)) {
        setIsSemOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDepartments = async () => {
    const deptCollection = collection(db, "departments");
    const deptSnapshot = await getDocs(deptCollection);
    setDepartments(
      deptSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddForm = () => {
    setFormData({ name: "", description: "", totalSemesters: "" });
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (dept) => {
    setFormData({
      name: dept.name,
      description: dept.description,
      totalSemesters: dept.totalSemesters,
    });
    setIsEditing(true);
    setEditId(dept.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.totalSemesters) {
      alert("Please select total semesters");
      return;
    }
    setLoading(true);
    try {
      if (isEditing) await updateDoc(doc(db, "departments", editId), formData);
      else await addDoc(collection(db, "departments"), formData);
      setShowForm(false);
      fetchDepartments();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Department?")) {
      await deleteDoc(doc(db, "departments", id));
      fetchDepartments();
    }
  };

  const semesterList = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Building2 className="title-icon" /> Departments
          </h1>
          <p className="page-subtitle">
            Manage academic departments, semesters, and subjects.
          </p>
        </div>
        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="department-grid">
        {departments.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            <Building2 size={48} className="empty-icon" />
            <h3>No Departments Found</h3>
            <p>Click 'Add Department' to create your first academic unit.</p>
          </div>
        ) : (
          departments.map((dept) => (
            <div className="dept-card" key={dept.id}>
              <div className="dept-card-header">
                <div className="dept-icon-wrapper">
                  <BookOpen size={24} className="dept-icon" />
                </div>
                <div className="dept-actions">
                  <button
                    className="icon-btn edit-btn"
                    onClick={() => openEditForm(dept)}
                    title="Edit Department"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    onClick={() => handleDelete(dept.id)}
                    title="Delete Department"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="dept-name">{dept.name}</h3>
              <p className="dept-desc">{dept.description}</p>

              <div className="dept-stats">
                <div className="stat-badge">
                  <Layers size={14} />
                  <span>{dept.totalSemesters} Semesters</span>
                </div>
              </div>

              <div className="dept-card-footer">
                <button
                  className="manage-btn outline"
                  onClick={() => navigate(`/departments/${dept.id}/students`)}
                >
                  <Users size={16} /> Students
                </button>
                <button
                  className="manage-btn"
                  onClick={() => navigate(`/departments/${dept.id}`)}
                >
                  Subjects <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`slide-panel ${showForm ? "open" : ""}`}>
        <div className="panel-header">
          <div className="panel-title-wrapper">
            {isEditing ? (
              <Edit2 className="panel-icon edit-icon" size={24} />
            ) : (
              <Building2 className="panel-icon" size={24} />
            )}
            <h2>{isEditing ? "Edit Department" : "Create Department"}</h2>
          </div>
          <button className="close-btn" onClick={() => setShowForm(false)}>
            <X size={20} />
          </button>
        </div>

        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>
                Department Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <BookOpen size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  className="modern-input"
                />
              </div>
            </div>
            
            <div className="form-group" ref={semRef}>
              <label>
                Total Semesters <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <Layers size={18} className="input-icon" />
                <div
                  className={`custom-dropdown-trigger ${
                    isSemOpen ? "active" : ""
                  }`}
                  onClick={() => setIsSemOpen(!isSemOpen)}
                >
                  <span
                    className={`selected-value-text ${!formData.totalSemesters ? "placeholder" : ""}`}
                  >
                    {formData.totalSemesters
                      ? `${formData.totalSemesters} Semesters`
                      : "Select Total Semesters"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`dropdown-chevron ${isSemOpen ? "open" : ""}`}
                  />
                </div>

                {isSemOpen && (
                  <div className="custom-dropdown-list-box fade-in">
                    {semesterList.map((sem) => (
                      <div
                        key={sem}
                        className={`custom-dropdown-item ${
                          Number(formData.totalSemesters) === sem
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setFormData({ ...formData, totalSemesters: sem });
                          setIsSemOpen(false);
                        }}
                      >
                        {sem} Semesters{" "}
                        {sem === 8
                          ? "(Engineering)"
                          : sem === 6
                            ? "(BSc / BCA)"
                            : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                Description <span className="required">*</span>
              </label>
              <div className="input-wrapper textarea-wrapper">
                <FileText size={18} className="input-icon" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder="Enter department description..."
                  className="modern-textarea"
                ></textarea>
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
                  <CheckCircle2 size={18} /> {isEditing ? "Save" : "Create"}
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

export default DepartmentManagement;
