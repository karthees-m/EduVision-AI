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
import { db, auth } from "../firebase";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  UserCheck,
  Hash,
  ChevronDown,
} from "lucide-react";
import "./StaffManagement.css";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    department: "",
    designation: "Assistant Professor",
    qualification: "",
    experience: "",
  });

  const getLoggedInEmail = () => {
    if (auth.currentUser && auth.currentUser.email) {
      return auth.currentUser.email.trim().toLowerCase();
    }
    try {
      const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (stored.email) return stored.email.trim().toLowerCase();
    } catch (e) {}
    return "guest@jpcollege.edu";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStaff = async () => {
    try {
      const userEmail = getLoggedInEmail();
      const q = query(
        collection(db, "staff"),
        where("userEmail", "==", userEmail),
      );
      const staffSnap = await getDocs(q);
      setStaffList(
        staffSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const userEmail = getLoggedInEmail();
      const q = query(
        collection(db, "departments"),
        where("userEmail", "==", userEmail),
      );
      const deptSnap = await getDocs(q);
      setDepartments(
        deptSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      email: "",
      department: "",
      designation: "Assistant Professor",
      qualification: "",
      experience: "",
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (staff, e) => {
    e.stopPropagation();
    setFormData({
      name: staff.name,
      employeeId: staff.employeeId,
      email: staff.email,
      department: staff.department,
      designation: staff.designation,
      qualification: staff.qualification,
      experience: staff.experience,
    });
    setIsEditing(true);
    setEditId(staff.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department) {
      alert("Please select a department");
      return;
    }
    setLoading(true);
    const userEmail = getLoggedInEmail();
    try {
      const staffPayload = { ...formData, userEmail };
      if (isEditing) {
        await updateDoc(doc(db, "staff", editId), staffPayload);
      } else {
        await addDoc(collection(db, "staff"), staffPayload);
      }
      setShowForm(false);
      fetchStaff();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      await deleteDoc(doc(db, "staff", id));
      fetchStaff();
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users className="title-icon" /> Staff Management
          </h1>
          <p className="page-subtitle">
            Manage faculty members, departmental roles, and academic
            qualifications.
          </p>
        </div>
        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="table-container">
        {staffList.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3>No Staff Members Found</h3>
            <p>Click 'Add Staff Member' to register faculty profiles.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Experience</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr
                  key={staff.id}
                  className="clickable-row"
                  onClick={() => setSelectedStaff(staff)}
                >
                  <td>
                    <div className="user-cell">
                      <div className="avatar-small staff-avatar">
                        {staff.name ? staff.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <span className="font-medium text-link">
                          {staff.name}
                        </span>
                        <div className="text-xs text-gray">{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-outline">
                      #{staff.employeeId || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="badge-purple">
                      {staff.department || "N/A"}
                    </span>
                  </td>
                  <td>{staff.designation || "Assistant Professor"}</td>
                  <td>
                    {staff.experience ? `${staff.experience} Years` : "N/A"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      className="action-buttons"
                      style={{ justifyContent: "flex-end" }}
                    >
                      <button
                        className="icon-btn edit-btn"
                        onClick={(e) => openEditForm(staff, e)}
                        title="Edit Staff"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={(e) => handleDelete(staff.id, e)}
                        title="Delete Staff"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedStaff && (
        <div className="modal-overlay" onClick={() => setSelectedStaff(null)}>
          <div
            className="modal-content-pro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-modal-header">
              <button
                className="close-btn-pro"
                onClick={() => setSelectedStaff(null)}
              >
                <X size={20} />
              </button>
              <div className="pro-header-left">
                <div className="pro-avatar-lg glowing-avatar">
                  {selectedStaff.name
                    ? selectedStaff.name.charAt(0).toUpperCase()
                    : "S"}
                </div>
                <div className="pro-header-text-box">
                  <div className="pro-badges-row">
                    <span className="pro-badge-dept">
                      {selectedStaff.department || "IT"}
                    </span>
                    <span className="pro-badge-sem">
                      {selectedStaff.designation || "Faculty"}
                    </span>
                  </div>
                  <h2>{selectedStaff.name}</h2>
                  <p>
                    #{selectedStaff.employeeId} • {selectedStaff.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="pro-modal-body">
              <div className="profile-grid-info">
                <div className="info-card">
                  <span className="info-label">
                    <Hash size={14} /> Employee ID
                  </span>
                  <span className="info-value">
                    {selectedStaff.employeeId || "N/A"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">
                    <Building2 size={14} /> Department
                  </span>
                  <span className="info-value">
                    {selectedStaff.department || "N/A"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">
                    <UserCheck size={14} /> Designation
                  </span>
                  <span className="info-value">
                    {selectedStaff.designation || "N/A"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">
                    <GraduationCap size={14} /> Qualification
                  </span>
                  <span className="info-value">
                    {selectedStaff.qualification || "N/A"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">
                    <Award size={14} /> Teaching Experience
                  </span>
                  <span className="info-value">
                    {selectedStaff.experience
                      ? `${selectedStaff.experience} Years`
                      : "N/A"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">
                    <Mail size={14} /> Email Address
                  </span>
                  <span className="info-value">
                    {selectedStaff.email || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`slide-panel ${showForm ? "open" : ""}`}>
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <Users className="panel-icon" size={24} />
            <h2>{isEditing ? "Edit Staff Member" : "Add Staff Member"}</h2>
          </div>
          <button className="close-btn" onClick={() => setShowForm(false)}>
            <X size={20} />
          </button>
        </div>

        <form className="panel-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-wrapper">
                <Users size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Dr. Chockalingam"
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Employee ID *</label>
                <div className="input-wrapper">
                  <Hash size={18} className="input-icon" />
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. dhh2"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-group" ref={deptRef}>
                <label>Department *</label>
                <div className="input-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <div
                    className={`custom-dropdown-trigger ${isDeptOpen ? "active" : ""}`}
                    onClick={() => setIsDeptOpen(!isDeptOpen)}
                  >
                    <span
                      className={`selected-value-text ${!formData.department ? "placeholder" : ""}`}
                    >
                      {formData.department || "Select Department"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`dropdown-chevron ${isDeptOpen ? "open" : ""}`}
                    />
                  </div>

                  {isDeptOpen && (
                    <div className="custom-dropdown-list-box fade-in">
                      {departments.length === 0 ? (
                        <div
                          className="custom-dropdown-item"
                          style={{ color: "#94a3b8" }}
                        >
                          No departments found
                        </div>
                      ) : (
                        departments.map((dept) => (
                          <div
                            key={dept.id}
                            className={`custom-dropdown-item ${formData.department === dept.name ? "selected" : ""}`}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                department: dept.name,
                              });
                              setIsDeptOpen(false);
                            }}
                          >
                            {dept.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Designation *</label>
                <div className="input-wrapper">
                  <UserCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Assistant Professor"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Qualification *</label>
                <div className="input-wrapper">
                  <GraduationCap size={18} className="input-icon" />
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. M.Sc CS, Ph.D"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Experience (Years) *</label>
                <div className="input-wrapper">
                  <Award size={18} className="input-icon" />
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 4"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="staff@jpcas.edu.in"
                    className="modern-input"
                  />
                </div>
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
                  {isEditing ? "Save Changes" : "Register Staff"}
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

export default StaffManagement;
