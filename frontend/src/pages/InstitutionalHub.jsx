import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Building2, Users, GraduationCap, ArrowRight } from "lucide-react";
import "./InstitutionalHub.css";

const InstitutionalHub = () => {
  const navigate = useNavigate();
  const [deptCount, setDeptCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const deptSnap = await getDocs(collection(db, "departments"));
        setDeptCount(deptSnap.size);

        const staffSnap = await getDocs(collection(db, "staff"));
        setStaffCount(staffSnap.size);

        const studentSnap = await getDocs(collection(db, "students"));
        setStudentCount(studentSnap.size);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="hub-container fade-in">
      <div className="hub-header">
        <h1 className="hub-title">Institutional Management Hub</h1>
        <p className="hub-subtitle">
          Centralized portal to manage academic departments, faculty staff, and
          student enrollments.
        </p>
      </div>
      <div className="hub-grid-cards">
        <div className="hub-card" onClick={() => navigate("/departments")}>
          <div className="hub-card-top">
            <div className="hub-icon-box dept-bg">
              <Building2 size={24} />
            </div>
            <span className="hub-count-badge">{deptCount} Units</span>
          </div>
          <h3>Departments & Semesters</h3>
          <p>
            Manage academic departments, structure semesters, and configure
            subject syllabi.
          </p>
          <div className="hub-card-footer">
            <span>Manage Departments</span>
            <ArrowRight size={16} />
          </div>
        </div>
        <div className="hub-card" onClick={() => navigate("/staff")}>
          <div className="hub-card-top">
            <div className="hub-icon-box staff-bg">
              <Users size={24} />
            </div>
            <span className="hub-count-badge">{staffCount} Faculty</span>
          </div>
          <h3>Staff Members</h3>
          <p>
            Register faculty profiles, assign teaching roles, and track academic
            qualifications.
          </p>
          <div className="hub-card-footer">
            <span>Manage Staff</span>
            <ArrowRight size={16} />
          </div>
        </div>

        <div className="hub-card" onClick={() => navigate("/students")}>
          <div className="hub-card-top">
            <div className="hub-icon-box student-bg">
              <GraduationCap size={24} />
            </div>
            <span className="hub-count-badge">{studentCount} Enrolled</span>
          </div>
          <h3>Student Records</h3>
          <p>
            Manage student profiles, monitor semester progression, and track
            CGPA performance.
          </p>
          <div className="hub-card-footer">
            <span>Manage Students</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalHub;
