import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      if (user && user.email) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ email: user.email.trim().toLowerCase() }),
        );
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ email: user.email.trim().toLowerCase() }),
        );
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent successfully! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-hero-side">
        <div className="hero-content">
          <div className="hero-logo-box">
            <BrainCircuit size={36} />
          </div>
          <h1>EduVision AI</h1>
          <p>
            Next-Generation Academic Management & Intelligent Student Analytics
            Platform powered by Advanced AI.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <ShieldCheck size={20} />
              <span>Secure Role-Based Admin Access</span>
            </div>
            <div className="feature-item">
              <BrainCircuit size={20} />
              <span>IBM Bob AI Exam & Performance Engine</span>
            </div>
          </div>
        </div>
        <div className="hero-footer-text">
          &copy; 2026 EduVision AI Systems. All rights reserved.
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          {!isForgotPassword ? (
            <>
              <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Please enter your administrator credentials to sign in.</p>
              </div>

              {error && <div className="error-alert">{error}</div>}
              {message && <div className="success-alert">{message}</div>}

              <form onSubmit={handleEmailLogin} className="login-form">
                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-field-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      placeholder="admin@eduvision.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="input-field-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="forgot-link-below"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setMessage("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
            </>
          ) : (
            <div className="forgot-password-card">
              <div className="form-header">
                <h2>Reset Password</h2>
                <p>
                  Enter your registered email address and we'll send you a
                  password reset link.
                </p>
              </div>

              {error && <div className="error-alert">{error}</div>}
              {message && <div className="success-alert">{message}</div>}

              <form onSubmit={handlePasswordReset} className="login-form">
                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-field-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      placeholder="admin@eduvision.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Sending Link..." : "Send Reset Link"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <button
                type="button"
                className="back-to-login-btn"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setMessage("");
                }}
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
