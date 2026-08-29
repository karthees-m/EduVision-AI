import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  ShieldCheck,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-navbar">
        <div className="nav-brand">
          <div className="brand-icon-box">
            <BrainCircuit size={24} />
          </div>
          <span>EduVision AI</span>
        </div>
        <button className="nav-login-btn" onClick={() => navigate("/login")}>
          Sign In / Login <ArrowRight size={16} />
        </button>
      </header>

      <section className="home-hero">
        <div className="hero-badge">🚀 Next-Gen Academic Intelligence</div>
        <h1>
          Empowering Institutions with{" "}
          <span className="highlight">AI-Driven Analytics</span>
        </h1>
        <p>
          EduVision AI streamlines student management, department tracking, and
          automated exam creation using advanced intelligence engines like IBM
          Bob.
        </p>
        <div className="hero-cta-group">
          <button className="primary-cta" onClick={() => navigate("/login")}>
            Get Started & Sign In <ArrowRight size={18} />
          </button>
        </div>
        <div className="features-preview-grid">
          <div className="feature-preview-card">
            <div className="preview-icon blue">
              <ShieldCheck size={24} />
            </div>
            <h3>Role-Based Security</h3>
            <p>
              Secure administrative access with robust Firebase authentication
              and session management.
            </p>
          </div>
          <div className="feature-preview-card">
            <div className="preview-icon purple">
              <BrainCircuit size={24} />
            </div>
            <h3>IBM Bob AI Exams</h3>
            <p>
              Generate smart questions, quizzes, and automated exam evaluations
              seamlessly.
            </p>
          </div>
          <div className="feature-preview-card">
            <div className="preview-icon green">
              <BarChart3 size={24} />
            </div>
            <h3>Advanced Dashboards</h3>
            <p>
              Real-time insights on student performance, staff mapping, and
              semester progress.
            </p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2026 EduVision AI Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
