import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StaffManagement from "./pages/StaffManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import SemesterManagement from "./pages/SemesterManagement";
import DepartmentStudents from "./pages/DepartmentStudents";
import StudentManagement from "./pages/StudentManagement";
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
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/departments/:deptId" element={<SemesterManagement />} />
          <Route
            path="/departments/:deptId/students"
            element={<DepartmentStudents />}
          />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/exams" element={<AIExamCreator />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
