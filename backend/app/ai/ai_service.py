"""
AIService: the single place the rest of the app talks to an LLM.

analyze_incident(text)             -> AIExtraction (validated Pydantic)

generate_priority_explanation(...) -> str

recommend_volunteers(...)          -> list[dict] (delegates scoring to matching_service,
                                      AI only adds the natural-language "why")

If AI_API_KEY is not set, everything falls back to deterministic,
clearly-labeled MOCK logic so the app is always demoable. AI failures
(bad JSON, network error, timeout) never crash the request -- they fall
back to rule-based extraction/explanation instead.
"""

import json
import os
import re

from app.schemas.schemas import AIExtraction


AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "claude-sonnet-4-6")
AI_PROVIDER = os.getenv("AI_PROVIDER", "anthropic")  # anthropic | gemini | openai | mock"


SYSTEM_PROMPT = """You are an emergency incident analysis assistant.

Analyse the provided emergency report.

Extract only information supported by the report.

Return valid JSON only, no prose, no markdown fences.

Do not invent facts. If information is unknown, return null or an empty array.

Return exactly this JSON shape:

{
  "incident_type": one of ["Flood","Fire","Medical Emergency","Road Accident","Building Collapse","Missing Person","Natural Disaster","Other"],
  "location": string or null,
  "severity": one of ["Critical","High","Medium","Low"],
  "people_affected": integer,
  "vulnerable_groups": array of strings (e.g. "Elderly", "Children", "Disabled", "Pregnant"),
  "urgency": one of ["Immediate","Urgent","Normal"],
  "required_skills": array of strings (choose from Medical, First Aid, Water Rescue, Fire Safety, Search & Rescue, Driving, Logistics, Food Distribution, Crowd Management, Communication),
  "required_resources": array of strings (e.g. "Boat", "Ambulance", "Medical Kit", "Rescue Equipment")
}"""


def ai_mode() -> str:
    return "REAL" if (AI_API_KEY and AI_PROVIDER != "mock") else "MOCK"


# ---------- Rule-based fallback (also used to build deterministic mock) ----------

_TYPE_KEYWORDS = {
    "Flood": ["flood", "flooding", "stranded", "water level", "submerged"],
    "Fire": ["fire", "burning", "smoke", "blaze"],
    "Medical Emergency": [
        "medical",
        "injured",
        "unconscious",
        "collapsed",
        "heart attack",
        "bleeding",
    ],
    "Road Accident": ["accident", "crash", "collision", "vehicle"],
    "Building Collapse": [
        "collapse",
        "collapsed",
        "building fell",
        "rubble",
        "trapped under",
    ],
    "Missing Person": ["missing", "lost person", "cannot find"],
    "Natural Disaster": ["earthquake", "cyclone", "landslide", "storm"],
}


_VULNERABLE_KEYWORDS = {
    "Elderly": ["elderly", "old age", "senior citizen"],
    "Children": ["children", "child", "kids", "infant"],
    "Disabled": ["disabled", "wheelchair", "differently abled"],
    "Pregnant": ["pregnant"],
}


_SKILL_KEYWORDS = {
    "Water Rescue": ["flood", "stranded", "boat", "water"],
    "Medical": [
        "medical",
        "injured",
        "elderly",
        "unconscious",
        "bleeding",
        "health",
    ],
    "First Aid": ["injured", "wound", "bleeding"],
    "Fire Safety": ["fire", "smoke", "burning"],
    "Search & Rescue": ["trapped", "collapse", "missing", "rubble"],
    "Driving": ["evacuate", "transport"],
    "Logistics": ["supplies", "food", "distribution"],
    "Crowd Management": ["crowd", "panic", "evacuation"],
}


_RESOURCE_KEYWORDS = {
    "Boat": ["flood", "stranded", "water"],
    "Ambulance": ["injured", "medical", "unconscious", "bleeding"],
    "Medical Kit": ["injured", "medical", "wound", "bleeding"],
    "Rescue Equipment": ["trapped", "collapse", "rubble"],
}


def _rule_based_extract(
    text: str,
    hint_type: str | None = None,
    hint_urgency: str | None = None,
) -> AIExtraction:

    lower = text.lower()

    incident_type = hint_type or "Other"

    if not hint_type:
        for t, kws in _TYPE_KEYWORDS.items():
            if any(k in lower for k in kws):
                incident_type = t
                break

    people_match = re.search(
        r"(\d+)\s*(people|persons|residents|families|villagers)",
        lower,
    )

    people_affected = (
        int(people_match.group(1))
        if people_match
        else (5 if "several" in lower else 0)
    )

    vulnerable_groups = [
        g
        for g, kws in _VULNERABLE_KEYWORDS.items()
        if any(k in lower for k in kws)
    ]

    if hint_urgency:
        urgency = hint_urgency
    elif any(
        w in lower
        for w in ["immediate", "urgent help", "right now", "critical"]
    ):
        urgency = "Immediate"
    elif any(w in lower for w in ["soon", "urgent"]):
        urgency = "Urgent"
    else:
        urgency = "Normal"

    severe_signals = sum(
        [
            "severe" in lower,
            "critical" in lower,
            people_affected >= 20,
            bool(vulnerable_groups),
            urgency == "Immediate",
        ]
    )

    if severe_signals >= 3:
        severity = "Critical"
    elif severe_signals == 2:
        severity = "High"
    elif severe_signals == 1:
        severity = "Medium"
    else:
        severity = "Low"

    required_skills = [
        s
        for s, kws in _SKILL_KEYWORDS.items()
        if any(k in lower for k in kws)
    ] or ["Search & Rescue"]

    required_resources = [
        r
        for r, kws in _RESOURCE_KEYWORDS.items()
        if any(k in lower for k in kws)
    ]

    location_match = re.search(
        r"(?:near|at|in)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)",
        text,
    )

    location = location_match.group(1) if location_match else None

    return AIExtraction(
        incident_type=incident_type,
        location=location,
        severity=severity,
        people_affected=people_affected,
        vulnerable_groups=vulnerable_groups,
        urgency=urgency,
        required_skills=required_skills,
        required_resources=required_resources,
    )


# ---------- Real LLM call (Gemini), guarded, never raises ----------

def _call_gemini(user_text: str) -> dict | None:
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=AI_API_KEY)

        response = client.models.generate_content(
            model=AI_MODEL,
            contents=f"{SYSTEM_PROMPT}\n\nEmergency report:\n{user_text}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        raw = response.text.strip()

        if raw.startswith("```json"):
            raw = raw[7:]

        elif raw.startswith("```"):
            raw = raw[3:]

        if raw.endswith("```"):
            raw = raw[:-3]

        return json.loads(raw.strip())

    except Exception:
        return None


# ---------- Real LLM call (Anthropic), guarded, never raises ----------

def _call_anthropic(user_text: str) -> dict | None:
    try:
        import anthropic  # local import: optional dependency

        client = anthropic.Anthropic(api_key=AI_API_KEY)

        resp = client.messages.create(
            model=AI_MODEL,
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": user_text,
                }
            ],
        )

        raw = "".join(
            b.text
            for b in resp.content
            if getattr(b, "type", None) == "text"
        )

        raw = (
            raw.strip()
            .removeprefix("```json")
            .removeprefix("```")
            .removesuffix("```")
            .strip()
        )

        return json.loads(raw)

    except Exception:
        return None


class AIService:

    def analyze_incident(
        self,
        text: str,
        hint_type: str | None = None,
        hint_urgency: str | None = None,
    ) -> AIExtraction:

        if ai_mode() == "REAL":

            if AI_PROVIDER == "gemini":
                raw = _call_gemini(text)

            elif AI_PROVIDER == "anthropic":
                raw = _call_anthropic(text)

            else:
                raw = None

            if raw:
                try:
                    # Preserve explicit form selections while still
                    # validating everything through Pydantic.
                    if hint_type:
                        raw["incident_type"] = hint_type

                    if hint_urgency:
                        raw["urgency"] = hint_urgency

                    return AIExtraction(**raw)

                except Exception:
                    pass  # validation failed -> fall through to rule-based

        return _rule_based_extract(
            text,
            hint_type,
            hint_urgency,
        )


    def generate_priority_explanation(
        self,
        extraction: AIExtraction,
        score: float,
        level: str,
    ) -> str:

        from app.algorithms.priority_engine import rule_based_explanation

        if ai_mode() == "REAL":

            try:
                prompt = (
                    f"Incident: {extraction.incident_type.value} in "
                    f"{extraction.location or 'an unspecified area'}. "
                    f"AI-assessed severity: {extraction.severity.value}. "
                    f"{extraction.people_affected} people affected, "
                    f"vulnerable groups: {extraction.vulnerable_groups}, "
                    f"urgency: {extraction.urgency.value}. "
                    f"The deterministic priority engine calculated "
                    f"{score}/100 with priority level {level}. "
                    f"Do not change or reinterpret the score or priority level. "
                    f"Write one concise factual sentence explaining the main "
                    f"factors behind the final priority."
                )

                # ---------- Gemini ----------

                if AI_PROVIDER == "gemini":

                    from google import genai

                    client = genai.Client(api_key=AI_API_KEY)

                    response = client.models.generate_content(
                        model=AI_MODEL,
                        contents=prompt,
                    )

                    text = response.text.strip()

                    if text:
                        return text

                # ---------- Anthropic ----------

                elif AI_PROVIDER == "anthropic":

                    import anthropic

                    client = anthropic.Anthropic(
                        api_key=AI_API_KEY
                    )

                    resp = client.messages.create(
                        model=AI_MODEL,
                        max_tokens=150,
                        messages=[
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                    )

                    text = "".join(
                        b.text
                        for b in resp.content
                        if getattr(b, "type", None) == "text"
                    ).strip()

                    if text:
                        return text

            except Exception:
                pass

        # Deterministic fallback
        return rule_based_explanation(
            extraction,
            score,
            level,
        )


ai_service = AIService()