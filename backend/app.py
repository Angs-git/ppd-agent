# backend/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crisis_rules import check_message_for_crisis, score_epds, interpret_epds
import json
from pathlib import Path
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from llm_agent import generate_reply
from session_service import SESSION_STORE, MEMORY_BANK

load_dotenv()

EVENTS_FILE = Path("events.json")
if not EVENTS_FILE.exists():
    EVENTS_FILE.write_text("[]")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SESSION_STORE and MEMORY_BANK are provided by `session_service` singletons

@app.get("/")
def root():
    return {"status": "ok", "message": "PPD Agent backend running."}


class MessageIn(BaseModel):
    user_id: str
    text: str

class EPDSIn(BaseModel):
    user_id: str
    answers: list

def log_event(e: dict):
    """
    Robust logger for prototype: ensures events.json contains a list.
    If the file is missing or corrupted, it resets to an empty list.
    """
    try:
        raw = EVENTS_FILE.read_text()
    except Exception:
        raw = None

    try:
        arr = json.loads(raw) if raw else []
    except Exception:
        # corrupted content — back it up and reset
        try:
            BACKUP = EVENTS_FILE.with_name("events.json.corrupt_backup")
            BACKUP.write_text(raw or "")
        except Exception:
            pass
        arr = []

    # Ensure arr is a list
    if not isinstance(arr, list):
        arr = []

    arr.append(e)
    try:
        EVENTS_FILE.write_text(json.dumps(arr, indent=2))
    except Exception as write_exc:
        # last-resort: print to console for debugging
        print("Failed to write events.json:", write_exc)



@app.post("/message")
def message(msg: MessageIn):
    crisis = check_message_for_crisis(msg.text)
    log_event({"type": "message", "time": str(datetime.utcnow()), "user_id": msg.user_id, "text": msg.text, "crisis": crisis})
    if crisis.get("is_crisis"):
        return {"assistant": crisis.get("assistant_text"), "crisis": True}

    # call LLM with session context and user_id
    reply_text = generate_reply(msg.text, user_id=msg.user_id)
    log_event({"type": "message", "time": str(datetime.utcnow()), "user_id": msg.user_id, "text": msg.text, "assistant": reply_text})
    return {"assistant": reply_text, "crisis": False}



@app.post("/epds")
def epds(data: EPDSIn):
    if len(data.answers) != 10:
        return {"error":"EPDS requires 10 answers"}
    score = score_epds(data.answers)
    interp = interpret_epds(score)
    q10 = data.answers[9]
    crisis = {"is_crisis": q10 > 0}
    log_event({"type":"epds","time":str(datetime.utcnow()),"user_id":data.user_id,"score":score,"answers":data.answers,"crisis":crisis})
    return {"score": score, "interpretation": interp, "crisis": crisis}

@app.get("/session/{user_id}")
def get_session(user_id: str):
    return {"user_id": user_id, "recent": SESSION_STORE.get_recent(user_id), "all": SESSION_STORE.get_all(user_id)}

@app.post("/session/{user_id}/append")
def append_session_turn(user_id: str, payload: dict):
    # payload: {"role":"user"/"assistant","content":"..."}
    role = payload.get("role")
    content = payload.get("content")
    if role not in ("user","assistant") or content is None:
        raise HTTPException(status_code=400, detail="role and content required")
    SESSION_STORE.append_turn(user_id, role, content)
    return {"status":"ok"}

@app.post("/memory/{user_id}/add")
def add_memory(user_id: str, payload: dict):
    summary = payload.get("summary")
    tags = payload.get("tags", [])
    if not summary:
        raise HTTPException(status_code=400, detail="summary required")
    MEMORY_BANK.add_memory(user_id, summary, tags)
    return {"status":"ok"}

@app.get("/memory/{user_id}")
def get_memory(user_id: str):
    return {"user_id": user_id, "memories": MEMORY_BANK.get_memories(user_id)}

# -- add below your existing session & memory endpoints --

@app.delete("/session/{user_id}")
def delete_session(user_id: str):
    """
    Remove all short-term session history for the given user_id.
    """
    SESSION_STORE.clear(user_id)
    return {"status": "deleted", "user_id": user_id}

@app.delete("/memory/{user_id}")
def delete_memory(user_id: str):
    """
    Remove long-term memories for user_id from the MemoryBank.
    """
    MEMORY_BANK.forget(user_id)
    return {"status": "deleted", "user_id": user_id}
