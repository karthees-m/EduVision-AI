import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InstitutionalHub from "./pages/InstitutionalHub";
import DepartmentManagement from "./pages/DepartmentManagement";
import StaffManagement from "./pages/StaffManagement";
import StudentManagement from "./pages/StudentManagement";
import SemesterManagement from "./pages/SemesterManagement";
import DepartmentStudents from "./pages/DepartmentStudents";
import AIExamCreator from "./pages/AIExamCreator";
import AIAnalysis from "./pages/AIAnalysis";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/institution" element={<InstitutionalHub />} />

          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/students" element={<StudentManagement />} />

          <Route path="/departments/:deptId" element={<SemesterManagement />} />
          <Route
            path="/departments/:deptId/students"
            element={<DepartmentStudents />}
          />

          <Route path="/exams" element={<AIExamCreator />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
