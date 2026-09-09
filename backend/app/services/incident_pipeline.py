from datetime import datetime, timezone

from app.ai.ai_service import ai_service, ai_mode
from app.algorithms.matching_engine import recommend_volunteers
from app.algorithms.priority_engine import calculate_priority
from app.database.db import db, new_id

# Rough geocoding for known local place names so incidents land at sane
# coordinates on the map even without a real geocoder. Falls back to a
# small random jitter around Vellore for anything unrecognised.
KNOWN_PLACES = {
    "katpadi": (12.9698, 79.1531),
    "vellore": (12.9165, 79.1325),
    "gandhi nagar": (12.9634, 79.1607),
    "chennai": (13.0827, 80.2707),
    "sholinganallur": (12.9010, 80.2279),
    "tambaram": (12.9249, 80.1000),
    "ambur": (12.7910, 78.7161),
    "ranipet": (12.9214, 79.3308),
    "arcot": (12.9052, 79.3196),
    "gudiyatham": (12.9450, 78.8700),
}


def _geocode(location: str | None, fallback_lat: float | None, fallback_lng: float | None) -> tuple[float, float]:
    if fallback_lat is not None and fallback_lng is not None:
        return fallback_lat, fallback_lng
    if location:
        key = location.strip().lower()
        for name, coords in KNOWN_PLACES.items():
            if name in key:
                return coords
    import random
    base_lat, base_lng = KNOWN_PLACES["vellore"]
    return base_lat + random.uniform(-0.05, 0.05), base_lng + random.uniform(-0.05, 0.05)


async def process_incident(
    *,
    source_type: str,
    description: str,
    location_hint: str,
    hint_type: str | None = None,
    hint_urgency: str | None = None,
    people_affected_hint: int | None = None,
    vulnerable_hint: bool = False,
    latitude: float | None = None,
    longitude: float | None = None,
) -> dict:
    """The full COLLECT -> UNDERSTAND -> PRIORITISE -> MATCH pipeline."""

    # 1. UNDERSTAND -- AI extraction (validated, falls back to rules)
    extraction = ai_service.analyze_incident(description, hint_type=hint_type, hint_urgency=hint_urgency)

    if location_hint and not extraction.location:
        extraction.location = location_hint
    if people_affected_hint is not None and people_affected_hint > extraction.people_affected:
        extraction.people_affected = people_affected_hint
    if vulnerable_hint and "Elderly" not in extraction.vulnerable_groups and not extraction.vulnerable_groups:
        extraction.vulnerable_groups = ["Vulnerable individuals"]

    lat, lng = _geocode(extraction.location or location_hint, latitude, longitude)

    # 2. PRIORITISE -- deterministic scoring engine (AI has no vote here)
    resources = await db.resources.find_all()
    available_matching_resources = sum(
        1 for r in resources
        if r.get("availability") and any(
            req.lower() in r.get("type", "").lower() for req in extraction.required_resources
        )
    )
    score, level, factors = calculate_priority(extraction, available_resource_count=max(1, available_matching_resources))

    # 3. AI explains the *already-computed* score in plain language
    explanation = ai_service.generate_priority_explanation(extraction, score, level)

    now = datetime.now(timezone.utc).isoformat()
    incident = {
        "id": new_id("INC-"),
        "source_type": source_type,
        "raw_description": description,
        "incident_type": extraction.incident_type.value,
        "location": extraction.location or location_hint or "Unknown",
        "latitude": lat,
        "longitude": lng,
        "severity": extraction.severity.value,
        "people_affected": extraction.people_affected,
        "vulnerable_groups": extraction.vulnerable_groups,
        "urgency": extraction.urgency.value,
        "required_skills": extraction.required_skills,
        "required_resources": extraction.required_resources,
        "priority_score": score,
        "priority_level": level,
        "priority_factors": factors.model_dump(),
        "priority_explanation": explanation,
        "ai_mode": ai_mode(),
        "recommended_volunteers": [],
        "assigned_volunteers": [],
        "status": "PRIORITISED",
        "created_at": now,
        "updated_at": now,
    }

    # 4. MATCH -- volunteer recommendations
    volunteers = await db.volunteers.find_all()
    recs = recommend_volunteers(incident, volunteers)
    incident["recommended_volunteers"] = recs

    await db.incidents.insert(incident)
    return incident
