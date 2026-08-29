import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  PlusCircle,
  BrainCircuit,
  LayoutDashboard,
  Activity,
  CheckCircle2,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    departments: 0,
    staff: 0,
    students: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const deptSnap = await getDocs(collection(db, "departments"));
        const staffSnap = await getDocs(collection(db, "staff"));
        const studentSnap = await getDocs(collection(db, "students"));

        setStats({
          departments: deptSnap.size,
          staff: staffSnap.size,
          students: studentSnap.size,
        });

        const studentsList = studentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentStudents(studentsList.slice(0, 4));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-container fade-in">
      <div className="dashboard-banner">
        <div className="banner-content">
          <div className="banner-badge">
            <ShieldCheck size={14} />  Admin Portal • EduVision Core
          </div>
          <h1 className="banner-title">Welcome back, Administrator </h1>
          <p className="banner-subtitle">
            Comprehensive academic management ecosystem active. Real-time
            monitoring of departments, staff allocation, student records, and
            IBM Bob AI integration.
          </p>
        </div>
        <div className="banner-action">
          <button className="banner-ai-btn" onClick={() => navigate("/exams")}>
            <BrainCircuit size={18} /> Launch IBM Bob AI
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div
          className="stat-card"
          onClick={() => navigate("/departments")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper dept-bg">
            <Building2 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Departments</span>
            <h2 className="stat-number">
              {loading ? "..." : stats.departments}
            </h2>
          </div>
          <ArrowRight size={16} className="stat-arrow" />
        </div>

        <div
          className="stat-card"
          onClick={() => navigate("/staff")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper staff-bg">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Faculty Members</span>
            <h2 className="stat-number">{loading ? "..." : stats.staff}</h2>
          </div>
          <ArrowRight size={16} className="stat-arrow" />
        </div>

        <div
          className="stat-card"
          onClick={() => navigate("/students")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper student-bg">
            <GraduationCap size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Enrolled Students</span>
            <h2 className="stat-number">{loading ? "..." : stats.students}</h2>
          </div>
          <ArrowRight size={16} className="stat-arrow" />
        </div>
      </div>

      <div className="dashboard-grid-split">
        <div className="section-container">
          <div className="section-header-row">
            <h3 className="section-heading">
              <Activity size={18} /> Recent Student Enrollments
            </h3>
            <button className="text-btn" onClick={() => navigate("/students")}>
              View All
            </button>
          </div>

          {recentStudents.length === 0 ? (
            <div className="empty-mini-state">
              <p>No recent student registrations found.</p>
              <button
                className="secondary-btn-sm"
                onClick={() => navigate("/students")}
              >
                Enroll Student
              </button>
            </div>
          ) : (
            <div className="recent-list">
              {recentStudents.map((student) => (
                <div className="recent-item" key={student.id}>
                  <div className="recent-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="recent-info">
                    <h4>{student.name}</h4>
                    <p>
                      {student.departmentName || "Assigned Stream"} • Sem{" "}
                      {student.currentSemester}
                    </p>
                  </div>
                  <span className="recent-roll">{student.rollNo}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-container ai-hub-card">
          <div className="ai-hub-header">
            <div className="ai-hub-badge">
              <Sparkles size={14} /> IBM Bob Teaching Assistant
            </div>
            <h3>Smart Assessment Engine</h3>
          </div>
          <p className="ai-hub-desc">
            Empower your curriculum with automated multi-format question
            generation, adaptive difficulty scaling, and comprehensive answer
            explanations.
          </p>

          <div className="ai-features-list">
            <div className="ai-feature-item">
              <CheckCircle2 size={15} className="check-icon" />
              <span>Syllabus-aligned multiple choice question creation</span>
            </div>
            <div className="ai-feature-item">
              <CheckCircle2 size={15} className="check-icon" />
              <span>Instant structured output for seamless rendering</span>
            </div>
            <div className="ai-feature-item">
              <CheckCircle2 size={15} className="check-icon" />
              <span>Detailed pedagogical explanations for every answer</span>
            </div>
          </div>

          <button className="ai-explore-btn" onClick={() => navigate("/exams")}>
            Start Quiz Generation <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="section-container" style={{ marginTop: "24px" }}>
        <h3 className="section-heading">
          <LayoutDashboard size={18} /> Quick Management Shortcuts
        </h3>

        <div className="shortcuts-grid">
          <div
            className="shortcut-card"
            onClick={() => navigate("/departments")}
          >
            <div className="shortcut-icon">
              <PlusCircle size={22} />
            </div>
            <div className="shortcut-info">
              <h4>Add Department</h4>
              <p>Configure new academic streams & semesters</p>
            </div>
            <ArrowRight size={16} className="shortcut-chevron" />
          </div>

          <div className="shortcut-card" onClick={() => navigate("/students")}>
            <div className="shortcut-icon">
              <UserPlus size={22} />
            </div>
            <div className="shortcut-info">
              <h4>Enroll Student</h4>
              <p>Register student profiles & department mapping</p>
            </div>
            <ArrowRight size={16} className="shortcut-chevron" />
          </div>

          <div className="shortcut-card" onClick={() => navigate("/exams")}>
            <div className="shortcut-icon ai-shortcut">
              <Sparkles size={22} />
            </div>
            <div className="shortcut-info">
              <h4>AI Quiz Generator</h4>
              <p>Instant assessment paper creation via IBM Bob</p>
            </div>
            <ArrowRight size={16} className="shortcut-chevron" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
