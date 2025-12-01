# backend/llm_agent.py
import os
from dotenv import load_dotenv
from openai import OpenAI
from session_service import SESSION_STORE

load_dotenv()
client = OpenAI()

SYSTEM_PROMPT = """
You are Ashok, a gentle and gender-neutral emotional support companion.
You provide comforting, non-medical, supportive conversation for postpartum individuals.
You never diagnose, and you encourage seeking professional help when needed.
If user indicates suicidal intent, do not answer — the crisis handler will respond.
"""

def generate_reply(user_text, user_id=None, extra_history=None):
    # Build messages with system prompt + compacted user history
    history_msgs = []
    if user_id:
        recent = SESSION_STORE.get_recent(user_id, n=8)
        for t in recent:
            history_msgs.append({"role": t["role"], "content": t["content"]})
    if extra_history:
        history_msgs.extend(extra_history[-4:])

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history_msgs)
    messages.append({"role": "user", "content": user_text})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.8,
            max_tokens=200
        )
        assistant_text = response.choices[0].message.content
        # append turns to session store for continuity
        if user_id:
            SESSION_STORE.append_turn(user_id, "user", user_text)
            SESSION_STORE.append_turn(user_id, "assistant", assistant_text)
        return assistant_text
    except Exception as e:
        print("LLM error:", e)
        return ("I'm sorry — I'm having trouble responding right now. "
                "Would you like to try a short grounding exercise or take the EPDS screener?")