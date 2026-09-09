import random

from fastapi import APIRouter, HTTPException

from app.services.incident_pipeline import process_incident
from scripts.seed_database import seed as seed_database

router = APIRouter(prefix="/incidents", tags=["simulation"])

SCENARIOS = {
    "flood": dict(
        incident_type="Flood",
        location_hint="Katpadi",
        descriptions=[
            "Severe flooding near Katpadi. Around 30 people are stranded and several elderly residents need immediate medical assistance. We need boats and medical assistance.",
            "Water levels rising fast near the riverside colony. Families with children are trapped on rooftops.",
        ],
    ),
    "fire": dict(
        incident_type="Fire",
        location_hint="Gandhi Nagar",
        descriptions=[
            "Fire has broken out in a residential building in Gandhi Nagar, thick smoke visible, residents trapped on upper floors, urgent fire safety and rescue support needed.",
        ],
    ),
    "medical": dict(
        incident_type="Medical Emergency",
        location_hint="Vellore",
        descriptions=[
            "Elderly man collapsed and is unconscious near the Vellore bus stand, bystanders report no pulse, immediate medical help required.",
        ],
    ),
    "accident": dict(
        incident_type="Road Accident",
        location_hint="Arcot",
        descriptions=[
            "Multi-vehicle collision on the Arcot highway, several injured including a child, ambulance and first aid urgently needed.",
        ],
    ),
    "collapse": dict(
        incident_type="Building Collapse",
        location_hint="Ranipet",
        descriptions=[
            "Partial building collapse reported in Ranipet, workers trapped under rubble, search and rescue with heavy equipment required immediately.",
        ],
    ),
}


@router.post("/simulate")
async def simulate(scenario: str = "flood", source_type: str = "CITIZEN"):
    scenario = scenario.lower()
    if scenario not in SCENARIOS:
        raise HTTPException(400, f"Unknown scenario '{scenario}'. Options: {list(SCENARIOS)}")
    s = SCENARIOS[scenario]
    description = random.choice(s["descriptions"])

    if source_type.upper() == "AGENCY":
        description = "[Tamil Nadu Disaster Response Agency] " + description
    elif source_type.upper() == "SENSOR":
        description = "[SENSOR-FLOOD-04] " + description

    incident = await process_incident(
        source_type=source_type.upper(),
        description=description,
        location_hint=s["location_hint"],
        hint_type=s["incident_type"],
    )
    return incident


@router.post("/demo-reset")
async def demo_reset():
    """Reset the system and reload the controlled demo scenario (section 31/32 of the brief)."""
    count = await seed_database(reset=True)
    return {"message": "Demo scenario loaded", **count}
