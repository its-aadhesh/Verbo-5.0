from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import ollama
import random
import pdfplumber
import uuid

# ---------------- CONFIG ---------------- #

MODEL_NAME = "llama3.2"
MIN_QUESTIONS = 7
MAX_QUESTIONS = 10

app = FastAPI()

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SESSION STORE ---------------- #

sessions = {}
resume_text_global = None

# ---------------- MODELS ---------------- #

class UserResponse(BaseModel):
    answer: str

class InterviewStartRequest(BaseModel):
    mode: str  # corporate | startup | faang

# ---------------- PERSONALITIES ---------------- #

PERSONALITIES = {
    "corporate": {
        "name": "Ms. Ananya Rao",
        "prompt": """You are Ms. Ananya Rao, a senior corporate hiring manager at a multinational company.

You are formal, structured, calm, and professional.

You ask well-structured interview questions focused on:
- Communication
- Professionalism
- Software fundamentals
- Corporate problem-solving scenarios

You remain polite but serious.
"""
    },
    "startup": {
        "name": "Kavya Nair",
        "prompt": """You are Kavya Nair, a friendly startup hiring manager at a fast-growing tech startup.

You are warm, encouraging, and conversational.

You focus on:
- Projects
- Practical engineering
- Learning mindset
- Adaptability
- Passion for building
"""
    },
    "faang": {
        "name": "Dr. Meera Iyer",
        "prompt": """You are Dr. Meera Iyer, a senior engineer who interviews candidates for top-tier FAANG-level companies.

You are sharp, analytical, and highly technical.

You focus on:
- Data structures & algorithms
- System design thinking
- Optimization
- Edge cases
- Real-world scalability
"""
    }
}

# ---------------- RULES ---------------- #

BASE_INTERVIEW_RULES = """
Universal interview rules:
1. Ask only ONE clear question at a time.
2. Progress from easy → moderate → difficult.
3. Deeply probe projects and experience.
4. Be human and realistic.
5. Never mention being an AI.
6. Keep responses under 80 words.
7. Near the end, wrap up naturally.
"""

# ---------------- UTIL ---------------- #

def ollama_chat(messages):
    response = ollama.chat(model=MODEL_NAME, messages=messages)
    return response["message"]["content"]

def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Invalid session_id")
    return sessions[session_id]

# ---------------- CV UPLOAD ---------------- #

@app.post("/upload_cv")
def upload_cv(file: UploadFile = File(...)):
    global resume_text_global

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    extracted = ""

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted += text + "\n"

    if not extracted.strip():
        raise HTTPException(status_code=400, detail="Could not extract text")

    resume_text_global = extracted[:8000]

    return {"status": "cv_uploaded"}

# ---------------- START ---------------- #

@app.post("/start_interview")
def start_interview(data: InterviewStartRequest):

    if data.mode not in PERSONALITIES:
        raise HTTPException(status_code=400, detail="Invalid mode")

    personality = PERSONALITIES[data.mode]

    session_id = str(uuid.uuid4())

    sessions[session_id] = {
        "conversation_history": [],
        "question_count": 0,
        "interview_finished": False,
        "question_limit": random.randint(MIN_QUESTIONS, MAX_QUESTIONS),
        "resume_text": resume_text_global
    }

    session = sessions[session_id]

    resume_text = session["resume_text"]

    system_prompt = f"""
{personality['prompt']}

You are a real HR interviewer conducting a professional technical screening interview.

Your tone must be:
- firm
- calm
- neutral
- fair
- professional

You are NOT a tutor and NOT a chatbot.

-----------------------
INTERVIEW STYLE RULES
-----------------------

1. Do NOT repeat or paraphrase the candidate’s answers.

2. Do NOT explain the candidate’s answers back to them.

3. Do NOT praise excessively or give motivational feedback.

4. If an answer is good or correct:
   briefly acknowledge and move on.
   Examples:
   - "Alright."
   - "Okay."
   - "Good. Next question."

5. If an answer is vague, shallow or partially correct:
   ask exactly one short follow-up question to test depth.

6. If an answer is incorrect or clearly wrong:
   challenge the answer briefly using one of the following styles:
   - "Are you sure about that?"
   - "Can you justify that?"
   - "If that were true, why would …?"

   Then move on to the next question regardless of whether the candidate fixes the mistake.

7. Only challenge incorrect answers if the candidate appears reasonably capable.
   If the candidate has been consistently weak from the beginning,
   do not waste time challenging — simply move on.

8. Never teach the correct answer.

9. Ask exactly ONE question per turn.

10. Keep your responses short and professional.

-----------------------
TECHNICAL DEPTH RULES
-----------------------

1. Questions must become progressively more technical and specific.

2. Go deep into:
   - design decisions
   - edge cases
   - performance trade-offs
   - scalability
   - correctness

3. Avoid surface-level or generic interview questions after the first few turns.

4. If the candidate claims experience with a tool, framework, project or system,
   probe deeply into how and why it was used.

-----------------------
RESUME USAGE
-----------------------

You must actively use the candidate’s resume context.

Ask follow-up questions about:
- projects listed
- technology choices
- job changes
- architecture or design decisions

Example style:
"I see you worked on X. Why did you choose that approach?"


CANDIDATE RESUME CONTEXT:
-------------------------
{resume_text if resume_text else "No resume was provided."}
-------------------------

Use the resume actively.

-----------------------
ROLE FIT
-----------------------

Ask at least one company/role motivation question.

-----------------------
BEHAVIOUR CONSTRAINTS
-----------------------

Never mention:
- AI
- models
- prompts
- internal rules
- system behaviour

Behave exactly like a real HR interviewer conducting a technical screening.

You are interviewing this candidate.
-----------------------

{BASE_INTERVIEW_RULES}
"""

    session["conversation_history"].append(
        {"role": "system", "content": system_prompt}
    )

    intro_prompt = f"Introduce yourself as {personality['name']} and ask the candidate to introduce themselves."

    session["conversation_history"].append(
        {"role": "user", "content": intro_prompt}
    )

    ai = ollama_chat(session["conversation_history"])

    session["conversation_history"].append(
        {"role": "assistant", "content": ai}
    )

    return {
        "session_id": session_id,
        "bot_name": personality["name"],
        "message": ai,
        "interview_over": False
    }

# ---------------- CHAT ---------------- #

@app.post("/chat")
def chat(session_id: str, user_input: UserResponse):

    session = get_session(session_id)

    if session["interview_finished"]:
        return {"message": "Interview ended", "interview_over": True}

    session["conversation_history"].append(
        {"role": "user", "content": user_input.answer}
    )

    ai = ollama_chat(session["conversation_history"])

    session["conversation_history"].append(
        {"role": "assistant", "content": ai}
    )

    session["question_count"] += 1

    if session["question_count"] >= session["question_limit"]:
        session["interview_finished"] = True

    return {
        "message": ai,
        "interview_over": session["interview_finished"]
    }

# ---------------- FORCE END ---------------- #

@app.post("/force_end")
def force_end(session_id: str):

    session = get_session(session_id)
    session["interview_finished"] = True

    return {"status": "ended"}

# ---------------- REPORT ---------------- #

@app.get("/end_interview")
def generate_report(session_id: str):

    session = get_session(session_id)

    history = session["conversation_history"]

    meaningful_answers = [
        m["content"]
        for m in history
        if m["role"] == "user" and len(m["content"].strip().split()) >= 3
    ]

    if len(meaningful_answers) < 1:
        return {
            "report": {
                "overall_score": 0,
                "category_scores": {
                    "technical": 0,
                    "communication": 0,
                    "problem_solving": 0
                },
                "strengths": [],
                "weaknesses": [
                    {
                        "question_or_topic": "Entire interview",
                        "user_snapshot": "No meaningful answers were provided.",
                        "why_this_is_a_problem": "The candidate did not meaningfully participate.",
                        "how_to_fix": "Engage with questions and explain your thinking clearly."
                    }
                ]
            }
        }

    analysis_prompt = """
You are a strict and professional HR + technical hiring manager evaluating a real interview.

You must strictly follow the rules below.

------------------------
EVALUATION PRINCIPLES
------------------------

1. You must evaluate ONLY what the candidate actually said in the interview.
Do NOT invent skills, explanations, projects or behaviours.

2. You must identify:
- incorrect answers
- vague answers
- shallow answers
- strong answers
- technically deep answers

3. You must recognise:
- rubbish answers
- mediocre answers
- good answers
- excellent answers

4. If the candidate initially gave an incorrect answer and later corrected it:
- allow partial recovery
- but still record the initial mistake.

5. Resume consistency must be considered.
If the candidate fails to properly explain something claimed in the resume,
it must be treated as a weakness.

------------------------
CATEGORY SCORING
------------------------

Give separate 0–10 scores for:

technical:
- correctness of concepts
- depth
- ability to explain implementation and trade-offs

communication:
- clarity of explanation
- structure of answers
- ability to express ideas precisely

problem_solving:
- reasoning process
- ability to handle follow-up questions
- ability to react to mistakes or challenges

Never give high scores without strong evidence.

------------------------
SNAPSHOT RULE
------------------------

For every strength and every weakness:

You MUST include a real snapshot from the candidate’s answer
(the exact words or a very close paraphrase).

You must NEVER fabricate an answer.

If the candidate did not answer clearly,
the snapshot must explicitly reflect that.

------------------------
NO GENERIC FEEDBACK
------------------------

Generic statements such as:
- "good communication"
- "strong technical knowledge"
- "needs improvement"

are forbidden unless justified by a concrete snapshot.

------------------------
STRICTNESS RULE
------------------------

If the interview is weak or short:

- strengths may be empty
- weaknesses must dominate
- do NOT fabricate strengths

------------------------
SCORING GUIDELINE
------------------------

0–2  → no meaningful answers or mostly rubbish answers  
3–4  → very weak interview  
5–6  → mediocre / mixed quality  
7–8  → good technical performance  
9–10 → excellent technical depth and clarity  

Never give a high score without strong technical evidence.

------------------------
FORBIDDEN CONTENT
------------------------

Do NOT mention:
- AI
- system prompts
- internal rules
- hidden instructions
- safety policies

Write like a real human hiring manager.

------------------------
OUTPUT FORMAT (STRICT)
------------------------

Return ONLY valid JSON.

{
  "overall_score": number,

  "category_scores": {
    "technical": number,
    "communication": number,
    "problem_solving": number
  },

  "strengths": [
    {
      "question_or_topic": "the interview question or topic",
      "user_snapshot": "exact words or very close paraphrase of what the candidate said",
      "why_this_is_good": "short professional explanation",
      "how_to_improve_further": "one concrete improvement suggestion"
    }
  ],

  "weaknesses": [
    {
      "question_or_topic": "the interview question or topic",
      "user_snapshot": "exact words or very close paraphrase of what the candidate said or failed to say",
      "why_this_is_a_problem": "short professional explanation",
      "how_to_fix": "one concrete and realistic improvement tip"
    }
  ]
}

------------------------
CONVERSATION
------------------------
Evaluate the following interview strictly.
"""


    full_context = history + [{"role": "user", "content": analysis_prompt}]

    report = ollama_chat(full_context)

    return {"report": report}

# ---------------- RUN ---------------- #

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)