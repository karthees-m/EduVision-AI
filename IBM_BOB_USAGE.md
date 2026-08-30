# IBM Bob AI Integration Guide - EduVision AI

This document details how **IBM Bob** (Google Generative AI Engine) is integrated into the core architecture of **EduVision AI** to power academic automation features.

---

## 🧠 Core AI Integration Architecture
The backend application (`backend/app.py`) securely connects to the IBM Bob / Gemini generative model via the official Python SDK, handling parameter extraction, structured prompt construction, and robust error-handled JSON parsing.

---

## ⚙️ Key AI Workflows & Endpoints

### 1. AI Content & Study Notes Synthesis (`/api/generate-content`)
* **Purpose:** Automatically synthesizes comprehensive lecture notes, quick revision points, and exam-focused Q&A guides from any user-defined syllabus topic.
* **Workflow:**
  1. User inputs a topic and selects content depth format (*Comprehensive Notes*, *Quick Revision*, or *Exam Focused*).
  2. The backend constructs a structured academic prompt instructing IBM Bob to return markdown-formatted hierarchical sections and conceptual logic.
  3. The response is parsed and rendered dynamically on the React frontend along with automated **Mermaid.js visual flowcharts**.

### 2. AI Quiz & Assessment Creator (`/api/generate-quiz`)
* **Purpose:** Generates custom-tailored multiple-choice questions with rationales across multiple languages and difficulty tiers.
* **Workflow:**
  1. User specifies the subject topic, difficulty (*Beginner, Medium, Advanced*), question count, and target language (*English, Tamil, Hindi, Telugu, Malayalam, Marathi*).
  2. IBM Bob processes the request and returns a structured JSON payload containing questions, options, correct answer keys, and step-by-step explanations.
  3. The frontend displays an interactive evaluation dashboard with real-time scorecards and performance feedback.

---

## 🛠️ Performance & Stability Optimizations for AI Calls
To ensure seamless, real-time AI generation without server timeouts or memory crashes on cloud infrastructure:
* **Runtime Locking:** Pinned production runtime to stable **Python 3.11** (`runtime.txt`) to ensure full gRPC wheel compatibility.
* **gRPC Memory Tuning:** Configured environment variable `GRPC_POLL_STRATEGY=epoll1` on Render to prevent worker `SIGKILL` memory spikes during heavy AI polling.
* **Zero Cold-Start:** Integrated automated cron health checks on `/api/health` via UptimeRobot to keep the backend active 24/7.
