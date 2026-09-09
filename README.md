# RESQ-AI

**Real-Time Emergency Intelligence & Volunteer Coordination**

> Transform fragmented emergency reports into real-time, explainable response decisions — showing coordinators WHERE help is needed, WHY it is urgent, and WHO can respond.

## Problem

During emergencies, reports arrive from citizens, agencies, and sensors with no central place to see them together. Coordinators can't easily tell what's most urgent, what an unstructured report actually means, or who's available to help. RESQ-AI turns that fragmented stream into one live operations picture.

## Solution

```
COLLECT → UNDERSTAND → PRIORITISE → MATCH → COORDINATE → RESPOND
```

1. **Collect** — citizens, agencies, and simulated sensors all submit reports through separate endpoints that normalize into one incident structure.
2. **Understand** — an AI service extracts structured data (type, severity, people affected, vulnerable groups, required skills/resources) from free-form text, validated with Pydantic. If AI is unavailable, a deterministic rule-based fallback takes over — the app never crashes and never blocks on AI.
3. **Prioritise** — a **deterministic, auditable** scoring engine (not the LLM) computes a 0–100 priority score from fixed weights: severity 30%, people affected 25%, vulnerability 20%, urgency 15%, resource gap 10%. AI is used again afterward only to phrase the explanation in plain language — it cannot change the score.
4. **Match** — a scoring engine ranks volunteers by skill overlap, distance (haversine), availability, workload, and experience, with a plain-language reason for each recommendation.
5. **Coordinate** — coordinators assign, dispatch, and resolve incidents from a live command-center dashboard; every status change updates the incident, the volunteer, and the dashboard counters.

## Features

- Landing page, Coordinator command-center dashboard, interactive Leaflet map, citizen report form, volunteer & resource management, simulation console, analytics, system info
- Multi-source ingestion: `POST /incidents/citizen`, `/incidents/agency`, `/incidents/sensor`
- Explainable priority engine with a visible factor breakdown, not a black box
- AI volunteer matching with match %, distance, and a human-readable reason
- Live polling (3–5s) — no WebSockets required for the MVP
- Full assignment lifecycle: `REPORTED → ANALYSED → PRIORITISED → ASSIGNED → DISPATCHED → RESOLVED`
- Simulation console for a repeatable, judge-ready demo
- Realistic seed data across Vellore, Chennai, and Tamil Nadu so the app never opens empty
- Clearly labeled **AI SIMULATION MODE** vs real AI analysis — never pretends mock results are real

## Architecture

```
Citizen Form / Agency Feed / Sensor Feed
              │
              ▼
        Backend API (FastAPI)
              │
              ▼
     Incident Normalization
              │
              ▼
    AI Incident Understanding  (app/ai/ai_service.py)
              │
              ▼
       Structured Incident
        │             │
        ▼             ▼
Priority Engine   Resource Analysis
(app/algorithms/priority_engine.py)
        │
        ▼
   Priority Queue → Database (app/database/db.py)
        │                  │
        ▼                  ▼
  Live Dashboard    Volunteer Matching
                     (app/algorithms/matching_engine.py)
                            │
                            ▼
                 Recommended Volunteers
                            │
                            ▼
                 Coordinator Assignment
                            │
                            ▼
                    Status Tracking
```

## Technology stack

**Frontend:** React, Vite, Tailwind CSS v4, React Router, Axios, Leaflet + React-Leaflet, Recharts, Lucide React

**Backend:** Python, FastAPI, Uvicorn, Pydantic

**Database:** MongoDB-compatible. Ships with a JSON-file collection store (`app/database/db.py`) that implements the same interface a real MongoDB collection would (`find_all`, `find_one`, `insert`, `update`, `count`) — so the whole app works locally with zero external services, and pointing `MONGODB_URI` at a real Atlas cluster is a drop-in swap with no application code changes.

**AI:** `AIService` (`app/ai/ai_service.py`) abstracts the LLM provider behind `analyze_incident()` and `generate_priority_explanation()`. With no `AI_API_KEY` set, it runs a deterministic **mock mode** (clearly labeled "AI SIMULATION MODE" in the UI) so the app is always demoable. Set `AI_API_KEY` to enable real Anthropic-backed analysis — same interface, no frontend changes.

## AI usage in this product

AI is not a bolted-on chatbot — it does two specific, load-bearing jobs:

1. Turns messy natural language ("severe flooding near Katpadi, ~30 stranded, elderly residents need help") into validated structured JSON (`AIExtraction`, enforced with Pydantic; invalid AI output falls back to rule-based extraction and is never trusted blindly).
2. Explains the *already-computed* deterministic priority score in one factual sentence for the coordinator's dashboard — it never sets the score itself.

## Database schema

**incidents**: id, source_type, raw_description, incident_type, location, latitude, longitude, severity, people_affected, vulnerable_groups, urgency, required_skills, required_resources, priority_score, priority_level, priority_factors, priority_explanation, ai_mode, recommended_volunteers, assigned_volunteers, status, created_at, updated_at

**volunteers**: id, name, skills, location, latitude, longitude, availability, status, capacity, current_assignments, contact, experience

**resources**: id, name, type, latitude, longitude, availability, capacity

**assignments**: id, incident_id, volunteer_id, assigned_at, status, task

## API documentation

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check + storage mode |
| GET | `/incidents` | List all incidents, ranked by priority |
| GET | `/incidents/{id}` | Incident detail |
| POST | `/incidents/citizen` | Submit a citizen report |
| POST | `/incidents/agency` | Submit an agency report |
| POST | `/incidents/sensor` | Submit a sensor report |
| POST | `/incidents/simulate?scenario=flood&source_type=CITIZEN` | Trigger a demo incident (`flood`, `fire`, `medical`, `accident`, `collapse`) |
| POST | `/incidents/demo-reset` | Reset system and reload the controlled demo scenario |
| PUT | `/incidents/{id}/status` | Update incident status |
| GET | `/incidents/{id}/volunteers` | Recommended volunteers for an incident |
| GET | `/volunteers` | List volunteers |
| GET | `/volunteers/{id}` | Volunteer detail |
| GET | `/resources` | List resources |
| POST | `/assignments` | Assign a volunteer to an incident |
| PUT | `/assignments/{id}` | Update assignment status (`ASSIGNED` → `DISPATCHED` → `COMPLETED`) |
| GET | `/assignments` | List assignments |
| GET | `/analytics` | Aggregated chart data |
| GET | `/dashboard/stats` | Live KPI counters |

## Installation & running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit if you want real AI / real MongoDB
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Seed data loads automatically on first startup.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Environment variables

**backend/.env**
```
MONGODB_URI=            # empty = local JSON-file store; or a real mongodb+srv:// URI
AI_API_KEY=              # empty = AI simulation mode; or a real Anthropic API key
AI_MODEL=claude-sonnet-4-6
AI_PROVIDER=anthropic
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

### Seeding the database manually

Seeding happens automatically on backend startup if the collections are empty. To force a full reset:

```bash
cd backend
python -m scripts.seed_database
```

or call `POST /incidents/demo-reset` while the server is running (also wired to the "Load Demo Scenario" button in the Simulation Console).

## Demo instructions

1. Start both servers as above.
2. Open `http://localhost:5173` → **Enter Command Center**.
3. Go to **Simulation Console** → click **Load Demo Scenario** to reset to a clean, controlled state.
4. Go to **Report Emergency**, submit: *"Severe flooding near Katpadi. 30 people are stranded, including elderly residents. Immediate rescue and medical assistance required."*
5. Show the AI extraction and priority breakdown that appear immediately after submission.
6. Switch to **Command Center** — the incident is now #1 in the queue and on the map.
7. Click the incident, show the ranked volunteer recommendations with match % and reasoning, and **Assign** the top match.
8. Go to **Simulation Console** → **Simulate Agency Feed** to show multi-source ingestion and live re-ranking.
9. Return to the incident, advance its status through **Dispatched → Resolved**.
10. Show **Analytics** for the aggregate picture.

## Future improvements

- Real MongoDB Atlas connection in production (already wired, just needs `MONGODB_URI`)
- WebSocket-based live updates instead of polling
- Real geocoding service instead of the built-in place-name lookup
- Authentication/roles for coordinators vs. citizens
- SMS/WhatsApp ingestion channel for citizen reports
