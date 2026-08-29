import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Menu, BrainCircuit } from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f1f5f9",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h3 style={{ color: "#64748b" }}>Loading EduVision AI...</h3>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      <header className="mobile-top-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="Toggle Menu"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <BrainCircuit size={18} />
          </div>
          <span>EduVision AI</span>
        </div>
      </header>

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
