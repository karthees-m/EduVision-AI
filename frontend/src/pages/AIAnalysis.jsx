import React, { useState, useRef, useEffect } from "react";
import MermaidDiagram from "../components/MermaidDiagram";
import {
  BrainCircuit,
  Sparkles,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Loader2,
  FileText,
  BookmarkCheck,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import "./AIAnalysis.css";

const FORMAT_OPTIONS = [
  { value: "Comprehensive Notes", label: "Comprehensive Detailed Notes" },
  { value: "Quick Revision", label: "Quick Revision Bullet Points" },
  { value: "Exam Focused", label: "Exam Focused (Important Q&A Style)" },
];

const AIAnalysis = () => {
  const [topic, setTopic] = useState("");
  const [formatType, setFormatType] = useState("Comprehensive Notes");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateStudyMaterial = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setStudyData(null);

    try {
      const response = await fetch(
        "https://eduvision-ai-qcw7.onrender.com/api/generate-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            formatType,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to generate study content from backend",
        );
      }

      setStudyData(result.data);
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(
        `Error: ${err.message}. Make sure Flask backend is running on port 5000.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const currentFormatLabel =
    FORMAT_OPTIONS.find((f) => f.value === formatType)?.label ||
    "Comprehensive Detailed Notes";

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="badge-ai">
            <Sparkles size={14} style={{ marginRight: "6px" }} />
            IBM Bob Content Engine
          </div>

          <h1
            className="page-title mt-2"
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
            }}
          >
            <BrainCircuit
              size={28}
              className="title-icon ai-gradient-text"
              style={{ marginRight: "10px" }}
            />
            AI Study Material & Notes Generator
          </h1>

          <p className="page-subtitle">
            Enter any syllabus topic or subject name to instantly generate
            structured academic notes and revision guides.
          </p>
        </div>
      </div>

      <div className="ai-content-layout">
        <div className="ai-controls-card">
          <h3 className="card-title">
            <BookOpen size={18} style={{ marginRight: "8px" }} />
            Content Parameters
          </h3>

          <form onSubmit={generateStudyMaterial} className="ai-form">
            <div className="form-group">
              <label>
                Syllabus Topic / Subject Name{" "}
                <span className="required">*</span>
              </label>

              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows="3"
                required
                placeholder="Ask Your Questions"
                className="ai-input"
              />
            </div>

            <div className="form-group" ref={dropdownRef}>
              <label>Content Depth / Format</label>

              <div
                className={`custom-dropdown-trigger ${isOpen ? "active" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="selected-value-text">
                  {currentFormatLabel}
                </span>
                <ChevronDown
                  size={16}
                  className={`dropdown-chevron ${isOpen ? "open" : ""}`}
                />
              </div>

              {isOpen && (
                <div className="custom-dropdown-list-box fade-in">
                  {FORMAT_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`custom-dropdown-item ${
                        formatType === opt.value ? "selected" : ""
                      }`}
                      onClick={() => {
                        setFormatType(opt.value);
                        setIsOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="ai-generate-btn"
              disabled={loading || !topic.trim()}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                    style={{ marginRight: "8px" }}
                  />
                  Generating Notes...
                </>
              ) : (
                <>
                  <Sparkles size={18} style={{ marginRight: "8px" }} />
                  Generate with IBM Bob
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="error-alert">
              <AlertCircle
                size={18}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="ai-result-card">
          {!loading && !studyData && (
            <div className="empty-ai-state">
              <FileText
                className="empty-ai-icon"
                size={60}
                style={{ marginBottom: "15px" }}
              />
              <h3>IBM Bob is Ready</h3>
              <p>
                Enter any syllabus topic on the left to generate structured
                study materials instantly.
              </p>
            </div>
          )}

          {loading && (
            <div className="loading-ai-state">
              <div className="scanner"></div>
              <h3>IBM Bob is drafting notes...</h3>
              <p>
                Synthesizing core definitions, concepts, diagrams, and exam
                tips.
              </p>
            </div>
          )}

          {studyData && !loading && (
            <div className="study-output fade-in">
              <div className="study-header">
                <h2>{studyData.title}</h2>
                <span className="format-badge">{formatType}</span>
              </div>

              <div className="study-overview-box">
                <h4>
                  <Lightbulb size={16} style={{ marginRight: "6px" }} />
                  Overview & Introduction
                </h4>
                <p>{studyData.overview}</p>
              </div>

              {studyData.keySections && studyData.keySections.length > 0 && (
                <div className="sections-list">
                  <h4 className="sub-heading">
                    <BookmarkCheck size={18} />
                    Core Concepts & Explanations
                  </h4>
                  {studyData.keySections.map((sec, index) => (
                    <div key={index} className="section-box">
                      <h5>
                        <span>{index + 1}.</span> {sec.heading}
                      </h5>
                      <p>{sec.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {studyData.diagrams && studyData.diagrams.length > 0 && (
                <div className="diagrams-list">
                  <h4 className="sub-heading">
                    <FileText size={18} />
                    Visual Summary
                  </h4>
                  {studyData.diagrams.map((diagram, index) => (
                    <MermaidDiagram
                      key={index}
                      code={diagram.mermaidCode}
                      title={diagram.title}
                    />
                  ))}
                </div>
              )}

              {studyData.examTips && studyData.examTips.length > 0 && (
                <div className="exam-tips-box">
                  <h4>
                    <Sparkles size={16} style={{ marginRight: "6px" }} />
                    Important Exam Tips & Highlights
                  </h4>
                  <ul>
                    {studyData.examTips.map((tip, index) => (
                      <li key={index}>
                        <CheckCircle2 size={15} className="tip-check" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
