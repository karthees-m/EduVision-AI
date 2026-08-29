import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Mail,
  Phone,
  Hash,
  Layers,
} from "lucide-react";
import "./DepartmentStudents.css";

const DepartmentStudents = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeYear, setActiveYear] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!deptId) return;
    try {

      const deptRef = doc(db, "departments", deptId);
      const deptSnap = await getDoc(deptRef);
      if (deptSnap.exists()) {
        setDepartment({ id: deptSnap.id, ...deptSnap.data() });
      }

      const q = query(
        collection(db, "students"),
        where("departmentId", "==", deptId),
      );
      const querySnapshot = await getDocs(q);
      setStudents(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !department) {
    return <div className="loading-state">Loading Student Data...</div>;
  }

  const maxYear = Math.ceil((Number(department.totalSemesters) || 8) / 2);
  const yearsArray = Array.from({ length: maxYear }, (_, i) => i + 1);

  const activeYearStudents = students.filter(
    (s) => Math.ceil(Number(s.currentSemester) / 2) === activeYear,
  );

  const getYearSuffix = (year) => {
    if (year === 1) return "1st Year";
    if (year === 2) return "2nd Year";
    if (year === 3) return "3rd Year";
    return `${year}th Year`;
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate("/departments")}>
            <ArrowLeft size={16} /> Back to Departments
          </button>
          <h1 className="page-title mt-2">
            <Users className="title-icon" /> {department.name} Students
          </h1>
          <p className="page-subtitle">
            View enrolled students categorized by their current academic year.
          </p>
        </div>
        <div className="total-badge">
          <GraduationCap size={20} /> Total Students: {students.length}
        </div>
      </div>

      <div className="semester-layout">
        <div className="semester-tabs">
          <h3 className="tabs-title">
            <Layers size={18} /> Academic Years
          </h3>
          <div className="tabs-list">
            {yearsArray.map((year) => (
              <button
                key={year}
                className={`sem-tab ${activeYear === year ? "active" : ""}`}
                onClick={() => setActiveYear(year)}
              >
                {getYearSuffix(year)}
                <span className="tab-hint">
                  (Sem {year * 2 - 1} & {year * 2})
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="subjects-container">
          <div className="subjects-header">
            <h3>{getYearSuffix(activeYear)} Students</h3>
            <span className="badge-blue">
              {activeYearStudents.length} Students Enrolled
            </span>
          </div>

          {activeYearStudents.length === 0 ? (
            <div className="empty-state box-empty">
              <Users size={40} className="empty-icon" />
              <h4>No Students in {getYearSuffix(activeYear)}</h4>
              <p>
                Enroll students from the Student Management module to see them
                here.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Profile</th>
                  <th>Roll Number</th>
                  <th>Current Semester</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {activeYearStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-small student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium">{student.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-outline">
                        <Hash size={12} style={{ marginRight: "4px" }} />
                        {student.rollNo}
                      </span>
                    </td>
                    <td>
                      <span className="badge-gray">
                        Sem {student.currentSemester}
                      </span>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span>
                          <Mail size={12} /> {student.email}
                        </span>
                        <span>
                          <Phone size={12} /> {student.contact}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentStudents;
