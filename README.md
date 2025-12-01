\# Ashok — PPD Support Agent (Prototype)



Ashok is a safety-first, multi-agent conversational assistant for postpartum support.

It provides empathetic chat, crisis detection, EPDS screening, short-term session memory,

and clinician escalation.



\## Quick Links

\- Architecture diagram: `docs/simple\_architecture.png`

\- Flowchart: `docs/simple\_flowchart\_no\_overlap.png`



\## What’s included

\- `backend/` — FastAPI backend (endpoints: `/message`, `/epds`, `/escalate`, `/session/\*`, `/memory/\*`)

\- `frontend/` — React app (chat UI, EPDS modal, crisis modal, voice support)

\- `docs/` — diagrams and images for submission (recommended)

\- `README.md` — this file



\## Requirements

\- Python 3.8+ (3.10+ recommended)

\- Node.js 16+ / npm or yarn

\- (Optional) OpenAI API key if using LLM features



\## Run locally (quick)

\### Backend

```bash

cd backend

python -m venv .venv

\# Windows

.venv\\Scripts\\activate

\# macOS/Linux

source .venv/bin/activate

pip install -r requirements.txt

uvicorn app:app --reload --port 8000



