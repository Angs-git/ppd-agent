# backend/crisis_rules.py
import re

CRISIS_PATTERNS = [
    r"\bkill myself\b",
    r"\bi want to die\b",
    r"\bi'll end it\b",
    r"\bi want to end it\b",
    r"\bsuicid(e|al)\b",
    r"\bhurt myself\b",
    r"\bnot worth\b",
    r"\bcan't go on\b"
]

def check_message_for_crisis(text: str):
    t = text.lower()
    for p in CRISIS_PATTERNS:
        if re.search(p, t):
            return {"is_crisis": True,
                    "assistant_text": (
                        "I'm really sorry you're feeling this way. I'm concerned for your safety. "
                        "If you are in immediate danger, please call your local emergency number now. "
                        "Would you like me to connect you to a human clinician or show a helpline number?"
                    ),
                    "recommended_action": "show_crisis_ui"}
    return {"is_crisis": False}

def score_epds(answers):
    # EPDS scoring: answers are 0-3 each; total 0-30
    return sum(answers)

def interpret_epds(score):
    if score >= 13:
        return "High: suggests probable depression. Recommend contacting a clinician for assessment."
    elif score >= 10:
        return "Possible depression: recommend follow-up with clinician."
    else:
        return "Low: continue monitoring; if symptoms worsen, consult a clinician."
