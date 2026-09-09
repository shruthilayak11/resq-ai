"""
Deterministic Priority Engine.

The LLM never sets the priority score directly. It only supplies the
structured extraction (severity, people_affected, vulnerable_groups,
urgency, required_resources). This module turns that structured data
into a 0-100 score using fixed, auditable weights:

    Severity          30%
    People affected   25%
    Vulnerability      20%
    Urgency/time       15%
    Resource gap       10%

The AI is used again *after* this score exists, only to phrase the
`priority_explanation` in natural language -- it cannot change the
number.
"""
from app.schemas.schemas import AIExtraction, PriorityFactors

SEVERITY_MAP = {"Critical": 100, "High": 75, "Medium": 50, "Low": 20}
URGENCY_MAP = {"Immediate": 100, "Urgent": 60, "Normal": 25}

WEIGHTS = {
    "severity": 0.30,
    "people": 0.25,
    "vulnerability": 0.20,
    "urgency": 0.15,
    "resource_gap": 0.10,
}


def _people_score(n: int) -> float:
    """
    Emergency impact score based on number of people affected.

    0 people  -> 0
    1 person  -> 20
    2 people  -> 35
    3 people  -> 45
    4 people  -> 55
    5 people  -> 60
    10 people -> 80
    20+ people -> 100
    """
    if n <= 0:
        return 0.0
    if n == 1:
        return 20.0
    if n == 2:
        return 35.0
    if n == 3:
        return 45.0
    if n == 4:
        return 55.0
    if n == 5:
        return 60.0
    if n <= 10:
        return 60.0 + ((n - 5) / 5.0) * 20.0
    if n <= 20:
        return 80.0 + ((n - 10) / 10.0) * 20.0
    return 100.0


def _vulnerability_score(groups: list[str]) -> float:
    if not groups:
        return 0.0
    # more distinct vulnerable groups -> higher score, capped at 100
    return min(100.0, len(set(groups)) * 40.0)


def _resource_gap_score(required_resources: list[str], available_resource_count: int) -> float:
    if not required_resources:
        return 10.0
    gap = max(0, len(required_resources) - available_resource_count)
    return min(100.0, (gap / max(1, len(required_resources))) * 100.0)


def calculate_priority(extraction: AIExtraction, available_resource_count: int = 1) -> tuple[float, str, PriorityFactors]:
    severity_score = SEVERITY_MAP.get(extraction.severity.value, 50)
    people_score = _people_score(extraction.people_affected)
    vulnerability_score = _vulnerability_score(extraction.vulnerable_groups)
    urgency_score = URGENCY_MAP.get(extraction.urgency.value, 25)
    resource_gap_score = _resource_gap_score(extraction.required_resources, available_resource_count)

    total = (
        severity_score * WEIGHTS["severity"]
        + people_score * WEIGHTS["people"]
        + vulnerability_score * WEIGHTS["vulnerability"]
        + urgency_score * WEIGHTS["urgency"]
        + resource_gap_score * WEIGHTS["resource_gap"]
    )
    total = round(total, 1)

    if total >= 80:
        level = "CRITICAL"
    elif total >= 60:
        level = "HIGH"
    elif total >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"

    factors = PriorityFactors(
        severity_score=round(severity_score * WEIGHTS["severity"], 1),
        people_affected_score=round(people_score * WEIGHTS["people"], 1),
        vulnerability_score=round(vulnerability_score * WEIGHTS["vulnerability"], 1),
        urgency_score=round(urgency_score * WEIGHTS["urgency"], 1),
        resource_gap_score=round(resource_gap_score * WEIGHTS["resource_gap"], 1),
    )
    return total, level, factors


def rule_based_explanation(extraction: AIExtraction, score: float, level: str) -> str:
    """Fallback explanation used if the AI explanation call is unavailable."""
    parts = [f"{extraction.severity.value.lower()} {extraction.incident_type.value.lower()}"]
    if extraction.people_affected:
        parts.append(f"{extraction.people_affected} people affected")
    if extraction.vulnerable_groups:
        parts.append(f"presence of {', '.join(extraction.vulnerable_groups).lower()}")
    if extraction.urgency.value != "Normal":
        parts.append(f"{extraction.urgency.value.lower()} urgency")
    if extraction.required_resources:
        parts.append(f"required resources: {', '.join(extraction.required_resources)}")
    return f"{level} priority ({score}/100) due to " + ", ".join(parts) + "."
