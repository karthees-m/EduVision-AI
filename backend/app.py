# backend/app.py

import os
import json
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False
)


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found. Check backend/.env")

genai.configure(api_key=GEMINI_API_KEY)


FORMAT_INSTRUCTIONS = {
    "Comprehensive Notes": (
        "Write detailed, textbook-style explanations for each section — "
        "3-5 full sentences per section covering definitions, how it works, "
        "and a small example where relevant. This is for deep understanding, not skimming."
    ),
    "Quick Revision": (
        "Keep every section SHORT — 1-2 crisp sentences or a tight bullet-style explanation "
        "per section. This is for last-minute revision, not deep reading. No long paragraphs."
    ),
    "Exam Focused": (
        "Frame each section's 'heading' as a likely exam question and make the 'explanation' "
        "a model answer — the kind of answer that scores full marks: structured, precise, "
        "with key terms highlighted conceptually."
    ),
}


DIFFICULTY_INSTRUCTIONS = {
    "Beginner": (
        "Keep questions simple and definitional — testing basic recall and "
        "understanding of core terms. Avoid tricky wording or edge cases."
    ),
    "Medium": (
        "Undergraduate level — questions should test applied understanding, "
        "not just definitions. Include at least one 'why' or 'which of these applies' style question."
    ),
    "Advanced": (
        "GATE/competitive exam level — include tricky distractors, edge cases, "
        "and questions that require combining two concepts. Options should be close enough "
        "that guessing without real understanding is hard."
    ),
}



LANGUAGE_INSTRUCTIONS = {
    "English": (
        "Write the entire quiz (title, questions, options, explanations) in English."
    ),
    "Tamil": (
        "Write the entire quiz in proper Tamil script (தமிழ்). "
        "Do NOT use Tanglish or English transliteration — use real Tamil words and grammar."
    ),
    "Hindi": (
        "Write the entire quiz in proper Hindi using Devanagari script (हिन्दी). "
        "Do NOT use Hinglish or transliteration."
    ),
    "Telugu": (
        "Write the entire quiz in proper Telugu script (తెలుగు). Do NOT use transliteration."
    ),
    "Malayalam": (
        "Write the entire quiz in proper Malayalam script (മലയാളം). Do NOT use transliteration."
    ),
    "Marathi": (
        "Write the entire quiz in proper Marathi using Devanagari script (मराठी). "
        "Do NOT use transliteration."
    ),
}


def generate_content_impl(topic, format_type):

    style_instruction = FORMAT_INSTRUCTIONS.get(
        format_type, FORMAT_INSTRUCTIONS["Comprehensive Notes"]
    )

    diagram_instruction = ""
    if format_type == "Comprehensive Notes":
        diagram_instruction = """
DIAGRAM GENERATION (only for Comprehensive Notes):
If this topic naturally involves a process, cycle, sequence, architecture,
hierarchy, or comparison, generate ONE Mermaid.js diagram that visualizes it.
If the topic is a simple factual/definitional concept with no real flow or structure,
return an empty diagrams array — do NOT force a diagram.

Mermaid syntax rules:
- Use "flowchart TD" for processes/hierarchies, "sequenceDiagram" for interactions,
  or "graph LR" for comparisons.
- Keep node labels SHORT (2-5 words), no special characters that break Mermaid.
- Must be syntactically valid Mermaid code — nothing else.
"""

    prompt = f"""
You are an expert academic tutor. Generate structured study notes.

Raw topic input from student (may contain spelling or grammar mistakes):
"{topic}"

First, silently interpret the CORRECT intended topic even if the input has typos or
grammatical errors. Never let a misspelling appear in your output. Use the corrected,
properly-spelled topic name everywhere in your response, including the title.

Format style: {format_type}
Style instructions: {style_instruction}
{diagram_instruction}

Return ONLY a raw JSON object. Do NOT include markdown, code fences, or commentary.

Use this exact JSON structure:

{{
    "title": "string (corrected topic name, properly spelled)",
    "overview": "string (2-3 sentences)",
    "keySections": [
        {{"heading": "string", "explanation": "string"}}
    ],
    "diagrams": [
        {{"title": "string", "mermaidCode": "string (valid mermaid syntax)"}}
    ],
    "examTips": ["string", "string", "string"]
}}

Requirements:
1. Generate 4-6 keySections.
2. Generate 3-5 examTips.
3. diagrams array: 0 or 1 items only.
4. Follow the selected format style strictly.
5. Return valid JSON only.

Output raw JSON only.
"""
    return prompt


def generate_quiz_prompt(topic, difficulty, question_count, language):

    difficulty_instruction = DIFFICULTY_INSTRUCTIONS.get(
        difficulty, DIFFICULTY_INSTRUCTIONS["Medium"]
    )
    language_instruction = LANGUAGE_INSTRUCTIONS.get(
        language, LANGUAGE_INSTRUCTIONS["English"]
    )

    prompt = f"""
You are an expert exam-paper setter. Generate a multiple-choice quiz.

Raw topic input from student (may contain spelling or grammar mistakes):
"{topic}"

First, silently interpret the CORRECT intended topic even if the input has typos.
Use the corrected topic name in the title.

Difficulty level: {difficulty}
Difficulty instructions: {difficulty_instruction}

Language: {language}
Language instructions: {language_instruction}

IMPORTANT: The JSON KEYS below (title, questions, question, options, correctAnswer,
explanation) must stay exactly as shown in English. Only the VALUES — the actual
question text, option text, and explanation text — should be written in {language}.

Number of questions to generate: {question_count}

Return ONLY a raw JSON object. Do NOT include markdown, code fences, or commentary.

Use this exact JSON structure:

{{
    "title": "string",
    "questions": [
        {{
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctAnswer": "string (must exactly match one of the 4 options)",
            "explanation": "string (2-3 sentences)"
        }}
    ]
}}

Requirements:
1. Generate exactly {question_count} questions.
2. Each question must have exactly 4 options.
3. "correctAnswer" must be an EXACT string match to one of the 4 options.
4. Shuffle option order — don't always put the correct answer first.
5. Follow the difficulty level and language strictly.
6. Return valid JSON only.

Output raw JSON only.
"""
    return prompt

_MODEL_CACHE = {"name": None}

PREFERRED_MODELS = [
    "models/gemini-3.6-flash",
    "models/gemini-3.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-pro",
    "models/gemini-1.5-pro-latest",
]


def get_candidate_models():
    try:
        available = [
            m.name for m in genai.list_models()
            if "generateContent" in m.supported_generation_methods
        ]
    except Exception as e:
        print("Could not list models, using preferred list as-is:", e)
        return PREFERRED_MODELS

    ordered = [name for name in PREFERRED_MODELS if name in available]
    ordered += [name for name in available if name not in ordered]
    return ordered or PREFERRED_MODELS


def generate_with_fallback(prompt):
    if _MODEL_CACHE["name"]:
        candidates = [_MODEL_CACHE["name"]] + [
            m for m in get_candidate_models() if m != _MODEL_CACHE["name"]
        ]
    else:
        candidates = get_candidate_models()

    last_error = None
    for model_name in candidates:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            _MODEL_CACHE["name"] = model_name
            print("Used Gemini model:", model_name)
            return response, model_name
        except Exception as e:
            print(f"Model {model_name} failed ({e}) — trying next...")
            last_error = e
            continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

def clean_json_response(text):
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"```\s*$", "", text)
    text = text.strip()

    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start:end + 1]

    return text

@app.route("/api/generate-content", methods=["POST", "OPTIONS"])
def generate_content():

    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json(silent=True) or {}
        topic = (data.get("topic") or "").strip()
        format_type = (data.get("formatType") or "Comprehensive Notes").strip()

        if not topic:
            return jsonify({"success": False, "error": "Topic is required"}), 400

        if format_type not in FORMAT_INSTRUCTIONS:
            format_type = "Comprehensive Notes"

        prompt = generate_content_impl(topic, format_type)

        print("\nGenerating content...")
        print("Topic:", topic, "| Format:", format_type)

        response, model_name = generate_with_fallback(prompt)
        raw_text = response.text
        cleaned = clean_json_response(raw_text)

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as je:
            print("\nJSON parse failed.\nRaw model output:\n", raw_text)
            return jsonify({
                "success": False,
                "error": f"Model returned invalid JSON: {str(je)}"
            }), 502

        return jsonify({"success": True, "data": parsed}), 200

    except Exception as e:
        print("\nGeneration error:", repr(e))
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/generate-quiz", methods=["POST", "OPTIONS"])
def generate_quiz():

    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json(silent=True) or {}

        topic = (data.get("topic") or "").strip()
        difficulty = (data.get("difficulty") or "Medium").strip()
        language = (data.get("language") or "English").strip()
        question_count = data.get("questionCount") or 5

        if not topic:
            return jsonify({"success": False, "error": "Topic is required"}), 400

        if difficulty not in DIFFICULTY_INSTRUCTIONS:
            difficulty = "Medium"

        if language not in LANGUAGE_INSTRUCTIONS:
            language = "English"

        try:
            question_count = int(question_count)
        except (TypeError, ValueError):
            question_count = 5

        # custom count, sane upper bound so one request doesn't time out
        question_count = max(1, min(question_count, 25))

        prompt = generate_quiz_prompt(topic, difficulty, question_count, language)

        print("\nGenerating quiz...")
        print("Topic:", topic, "| Difficulty:", difficulty,
              "| Language:", language, "| Count:", question_count)

        response, model_name = generate_with_fallback(prompt)
        raw_text = response.text
        cleaned = clean_json_response(raw_text)

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as je:
            print("\nJSON parse failed.\nRaw model output:\n", raw_text)
            return jsonify({
                "success": False,
                "error": f"Model returned invalid JSON: {str(je)}"
            }), 502

        for q in parsed.get("questions", []):
            if q.get("correctAnswer") not in q.get("options", []):
                print("Warning: correctAnswer mismatch for:", q.get("question"))

        return jsonify({"success": True, "data": parsed}), 200

    except Exception as e:
        print("\nQuiz generation error:", repr(e))
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "gemini_key_configured": bool(GEMINI_API_KEY),
        "current_model": _MODEL_CACHE["name"]
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)