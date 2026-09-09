import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analytics, assignments, dashboard, incidents, resources, simulate, volunteers
from app.database.db import STORAGE_MODE

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="RESQ-AI",
    description="Real-Time Emergency Intelligence & Volunteer Coordination",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(simulate.router)  # shares /incidents prefix, adds /simulate + /demo-reset
app.include_router(volunteers.router)
app.include_router(resources.router)
app.include_router(assignments.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health():
    return {"status": "ok", "storage": STORAGE_MODE}


@app.on_event("startup")
async def on_startup():
    # Auto-seed on first boot so the app never opens empty.
    from scripts.seed_database import seed
    await seed(reset=False)
