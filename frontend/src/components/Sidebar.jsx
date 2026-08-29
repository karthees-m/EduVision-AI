import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  FileText,
  BrainCircuit,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./Sidebar.css";

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { path: "/staff", name: "Staff Management", icon: <Users size={20} /> },
    {
      path: "/departments",
      name: "Departments",
      icon: <Building2 size={20} />,
    },
    { path: "/students", name: "Students", icon: <GraduationCap size={20} /> },
    { path: "/exams", name: "Exams & Marks", icon: <FileText size={20} /> },
    {
      path: "/ai-analysis",
      name: "AI Analysis",
      icon: <BrainCircuit size={20} />,
    },
  ];

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
    >
      <div className="sidebar-header">
        <div className="logo-wrapper">
          <div className="logo-icon-box">
            <BrainCircuit size={22} />
          </div>
          <span className="logo-text">EduVision AI</span>
        </div>

        <button
          className="toggle-btn desktop-only"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {auth.currentUser?.displayName?.charAt(0) || "A"}
          </div>
          <div className="user-info">
            <span className="user-name">
              {auth.currentUser?.displayName || "Administrator"}
            </span>
            <span className="user-role">System Admin</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
