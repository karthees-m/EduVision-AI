import React, { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Languages,
  Trophy,
  RotateCcw,
  Flag,
  ChevronDown,
} from "lucide-react";
import "./AIExamCreator.css";

const LANGUAGES = [
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
  "Malayalam",
  "Marathi",
];

const DIFFICULTY_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Medium", label: "Medium (Undergraduate)" },
  { value: "Advanced", label: "Advanced (Gate / Competitive)" },
];

const shuffleArray = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const normalizeText = (str) =>
  (str || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/["'`.,;:!?]+$/g, "");

const prepareQuiz = (data) => {
  const questions = (data.questions || []).map((q) => {
    const shuffledOptions = shuffleArray(q.options || []);
    const normalizedCorrect = normalizeText(q.correctAnswer);

    let matchedCorrect = shuffledOptions.find(
      (opt) => normalizeText(opt) === normalizedCorrect,
    );

    if (!matchedCorrect) {
      matchedCorrect = shuffledOptions.find(
        (opt) =>
          normalizeText(opt).includes(normalizedCorrect) ||
          normalizedCorrect.includes(normalizeText(opt)),
      );
    }

    if (!matchedCorrect) {
      matchedCorrect = shuffledOptions[0];
    }

    return { ...q, options: shuffledOptions, correctAnswer: matchedCorrect };
  });

  return { ...data, questions };
};

const getCheerMessage = (percentage) => {
  if (percentage >= 90) {
    return {
      emoji: "🏆",
      title: "Outstanding!",
      message: "You've mastered this topic. Excellent work — keep this up!",
    };
  } else if (percentage >= 70) {
    return {
      emoji: "🎉",
      title: "Great job!",
      message:
        "Solid understanding. Review the ones you missed and you're golden.",
    };
  } else if (percentage >= 50) {
    return {
      emoji: "💪",
      title: "Good effort!",
      message:
        "You're getting there. Go through the explanations above and try again.",
    };
  }
  return {
    emoji: "📚",
    title: "Keep going!",
    message:
      "Every expert started exactly here. Revisit the topic and give it another shot — you've got this.",
  };
};

const AIExamCreator = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [language, setLanguage] = useState("English");

  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const diffRef = useRef(null);
  const langRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState("");

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (diffRef.current && !diffRef.current.contains(event.target)) {
        setIsDiffOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetQuizProgress = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setShowResult(false);
  };

  const generateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setQuizData(null);
    resetQuizProgress();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, questionCount, language }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate quiz from backend");
      }

      setQuizData(prepareQuiz(result.data));
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(
        `Error: ${err.message}. Make sure Flask backend is running on port 5000.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIndex, option) => {
    if (submittedAnswers[qIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitAnswer = (qIndex) => {
    if (!selectedAnswers[qIndex]) return;
    setSubmittedAnswers((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleFinishQuiz = () => {
    setShowResult(true);
  };

  const totalQuestions = quizData?.questions?.length || 0;
  const answeredCount = Object.keys(submittedAnswers).length;

  const correctCount = quizData
    ? quizData.questions.reduce((acc, q, i) => {
        if (submittedAnswers[i] && selectedAnswers[i] === q.correctAnswer) {
          return acc + 1;
        }
        return acc;
      }, 0)
    : 0;

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const cheer = getCheerMessage(percentage);

  const handleRetake = () => {
    resetQuizProgress();
  };

  const currentDiffLabel =
    DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label ||
    "Medium (Undergraduate)";

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="badge-ai">
            <Sparkles size={14} style={{ marginRight: "6px" }} /> IBM Bob AI
            Feature
          </div>
          <h1
            className="page-title mt-2"
            style={{ display: "flex",margin: "20px 0", alignItems: "center" }}
          >
            <BrainCircuit
              size={28}
              className="title-icon ai-gradient-text"
              style={{ marginRight: "10px" }}
            />
            AI Quiz & Assessment Creator
          </h1>
          <p className="page-subtitle">
            Instantly generate structured multiple-choice questions with
            explanations.
          </p>
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-controls-card">
          <h3 className="card-title">
            <BookOpen size={18} style={{ marginRight: "8px" }} /> Assessment
            Parameters
          </h3>
          <form onSubmit={generateQuiz} className="ai-form">
            <div className="form-group">
              <label>
                Topic / Syllabus Name <span className="required">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows="3"
                required
                placeholder="Ask Your Questions"
                className="ai-input"
              ></textarea>
            </div>

            <div className="form-grid">
              <div className="form-group" ref={diffRef}>
                <label>Difficulty</label>
                <div
                  className={`custom-dropdown-trigger ${
                    isDiffOpen ? "active" : ""
                  }`}
                  onClick={() => setIsDiffOpen(!isDiffOpen)}
                >
                  <span className="selected-value-text">
                    {currentDiffLabel}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`dropdown-chevron ${isDiffOpen ? "open" : ""}`}
                  />
                </div>

                {isDiffOpen && (
                  <div className="custom-dropdown-list-box fade-in">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className={`custom-dropdown-item ${
                          difficulty === opt.value ? "selected" : ""
                        }`}
                        onClick={() => {
                          setDifficulty(opt.value);
                          setIsDiffOpen(false);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>No. of Qns</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={questionCount}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? "" : Number(e.target.value);
                    setQuestionCount(val);
                  }}
                  className="ai-input"
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div className="form-group" ref={langRef}>
              <label>
                <Languages
                  size={14}
                  style={{ marginRight: "4px", verticalAlign: "-2px" }}
                />
                Language
              </label>
              <div
                className={`custom-dropdown-trigger ${
                  isLangOpen ? "active" : ""
                }`}
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <span className="selected-value-text">{language}</span>
                <ChevronDown
                  size={16}
                  className={`dropdown-chevron ${isLangOpen ? "open" : ""}`}
                />
              </div>

              {isLangOpen && (
                <div className="custom-dropdown-list-box fade-in">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang}
                      className={`custom-dropdown-item ${
                        language === lang ? "selected" : ""
                      }`}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangOpen(false);
                      }}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="ai-generate-btn"
              disabled={loading || !topic.trim() || !questionCount}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                    style={{ marginRight: "8px" }}
                  />
                  Generating assessment...
                </>
              ) : (
                <>
                  <Sparkles size={18} style={{ marginRight: "8px" }} /> Generate
                  with IBM Bob
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
          {!loading && !quizData && (
            <div className="empty-ai-state">
              <BrainCircuit
                size={60}
                className="empty-ai-icon"
                style={{ marginBottom: "15px" }}
              />
              <h3>IBM Bob is ready</h3>
              <p>
                Enter a topic on the left to generate an instant assessment
                paper.
              </p>
            </div>
          )}

          {loading && (
            <div className="loading-ai-state">
              <div className="scanner"></div>
              <h3>AI is analyzing syllabus...</h3>
              <p>Creating questions and formulating explanations.</p>
            </div>
          )}

          {quizData && !loading && (
            <div className="quiz-output fade-in">
              <div className="quiz-header">
                <h2>{quizData.title}</h2>
                <div className="quiz-meta">
                  <span className="meta-badge">{difficulty} level</span>
                  <span className="meta-badge">{totalQuestions} questions</span>
                  <span className="meta-badge">{language}</span>
                </div>

                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${
                        totalQuestions
                          ? (answeredCount / totalQuestions) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="progress-label">
                  {answeredCount} of {totalQuestions} answered
                </p>
              </div>

              <div className="questions-list">
                {quizData.questions.map((q, index) => {
                  const selected = selectedAnswers[index];
                  const isSubmitted = submittedAnswers[index];
                  const isCorrect = isSubmitted && selected === q.correctAnswer;

                  return (
                    <div key={index} className="question-box">
                      <h4 className="q-text">
                        <span>Q{index + 1}.</span> {q.question}
                      </h4>

                      <div className="options-grid">
                        {q.options.map((opt, i) => {
                          let optClass = "option-item";
                          if (!isSubmitted && selected === opt) {
                            optClass += " selected-option";
                          }
                          if (isSubmitted) {
                            if (opt === q.correctAnswer) {
                              optClass += " correct-option";
                            } else if (opt === selected) {
                              optClass += " wrong-option";
                            }
                          }

                          return (
                            <div
                              key={i}
                              className={optClass}
                              onClick={() => handleSelectOption(index, opt)}
                              role="button"
                              tabIndex={0}
                            >
                              <span className="opt-letter">
                                {String.fromCharCode(65 + i)}
                              </span>{" "}
                              <span className="opt-text">{opt}</span>
                              {isSubmitted && opt === q.correctAnswer && (
                                <CheckCircle2
                                  size={16}
                                  className="correct-icon"
                                />
                              )}
                              {isSubmitted &&
                                opt === selected &&
                                opt !== q.correctAnswer && (
                                  <XCircle size={16} className="wrong-icon" />
                                )}
                            </div>
                          );
                        })}
                      </div>

                      {!isSubmitted ? (
                        <button
                          type="button"
                          className="submit-answer-btn"
                          disabled={!selected}
                          onClick={() => handleSubmitAnswer(index)}
                        >
                          Submit answer
                        </button>
                      ) : (
                        <>
                          <div
                            className={`feedback-text ${
                              isCorrect ? "feedback-correct" : "feedback-wrong"
                            }`}
                          >
                            {isCorrect
                              ? "Correct!"
                              : `Not quite — correct answer: ${q.correctAnswer}`}
                          </div>
                          <div className="explanation-box">
                            <strong>
                              <Sparkles
                                size={14}
                                style={{ marginRight: "4px" }}
                              />{" "}
                              IBM Bob explanation:
                            </strong>{" "}
                            {q.explanation}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {!showResult && (
                <button
                  type="button"
                  className="finish-quiz-btn"
                  onClick={handleFinishQuiz}
                >
                  <Flag size={16} style={{ marginRight: "8px" }} />
                  Finish quiz & see result
                </button>
              )}

              {showResult && (
                <div className="result-card fade-in">
                  <Trophy size={48} className="result-trophy" />
                  <h2 className="result-score">
                    {correctCount} / {totalQuestions}
                  </h2>
                  <p className="result-percentage">{percentage}% correct</p>

                  <div className="result-cheer">
                    <span className="cheer-emoji">{cheer.emoji}</span>
                    <h3>{cheer.title}</h3>
                    <p>{cheer.message}</p>
                  </div>

                  <button
                    type="button"
                    className="retake-btn"
                    onClick={handleRetake}
                  >
                    <RotateCcw size={16} style={{ marginRight: "6px" }} />
                    Retake quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIExamCreator;
