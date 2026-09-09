"""
Volunteer matching engine.

match_score is a weighted blend of:
    skill overlap    45%
    distance         30% (closer is better, capped at 20km)
    availability     15% (must be available, else disqualified)
    workload headroom 10%
"""
import math

EXPERIENCE_WEIGHT = {"Expert": 1.0, "Experienced": 0.85, "Intermediate": 0.7, "Beginner": 0.5}


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def score_volunteer(volunteer: dict, incident: dict) -> dict:
    required = set(incident.get("required_skills", []))
    has = set(volunteer.get("skills", []))
    skill_overlap = len(required & has) / len(required) if required else 0.5

    dist_km = haversine_km(
        incident["latitude"], incident["longitude"],
        volunteer["latitude"], volunteer["longitude"],
    )
    distance_score = max(0.0, 1 - min(dist_km, 20) / 20)

    available = volunteer.get("status") == "AVAILABLE" and volunteer.get("availability", True)
    availability_score = 1.0 if available else 0.0

    capacity = max(1, volunteer.get("capacity", 1))
    headroom = max(0, capacity - volunteer.get("current_assignments", 0)) / capacity

    experience_multiplier = EXPERIENCE_WEIGHT.get(volunteer.get("experience", "Intermediate"), 0.7)

    raw = (
        skill_overlap * 0.45
        + distance_score * 0.30
        + availability_score * 0.15
        + headroom * 0.10
    ) * experience_multiplier

    match_pct = round(min(1.0, raw) * 100)
    if not available:
        match_pct = min(match_pct, 30)  # unavailable volunteers rank low regardless

    matched_skills = sorted(required & has)
    reason_bits = []
    if matched_skills:
        reason_bits.append(f"has {' + '.join(matched_skills)}")
    elif has:
        reason_bits.append(f"brings general support skills ({', '.join(sorted(has)[:2])})")
    reason_bits.append("is available" if available else f"is currently {volunteer.get('status', 'unavailable').lower()}")
    reason_bits.append(f"{dist_km:.1f} km from the incident")

    reason = f"{volunteer['name']} is recommended because they " + ", ".join(reason_bits) + "."

    return {
        "volunteer_id": volunteer["id"],
        "name": volunteer["name"],
        "match_score": match_pct,
        "distance_km": round(dist_km, 1),
        "skills": volunteer.get("skills", []),
        "matched_skills": matched_skills,
        "status": volunteer.get("status"),
        "reason": reason,
    }


def recommend_volunteers(incident: dict, volunteers: list[dict], top_n: int = 5) -> list[dict]:
    scored = [score_volunteer(v, incident) for v in volunteers]
    scored.sort(key=lambda s: s["match_score"], reverse=True)
    return scored[:top_n]
