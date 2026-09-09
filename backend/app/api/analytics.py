from collections import Counter
from datetime import datetime

from fastapi import APIRouter

from app.database.db import db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("")
async def analytics():
    incidents = await db.incidents.find_all()
    volunteers = await db.volunteers.find_all()

    by_type = Counter(i["incident_type"] for i in incidents)
    by_severity = Counter(i["severity"] for i in incidents)
    by_source = Counter(i["source_type"] for i in incidents)
    by_status = Counter(i["status"] for i in incidents)
    by_vol_status = Counter(v["status"] for v in volunteers)

    timeline = Counter()
    for i in incidents:
        try:
            day = datetime.fromisoformat(i["created_at"]).strftime("%Y-%m-%d")
            timeline[day] += 1
        except Exception:
            pass

    resolved = [i for i in incidents if i["status"] == "RESOLVED"]
    active = [i for i in incidents if i["status"] != "RESOLVED"]

    response_times = []
    for i in resolved:
        try:
            created = datetime.fromisoformat(i["created_at"])
            updated = datetime.fromisoformat(i["updated_at"])
            response_times.append(round((updated - created).total_seconds() / 60, 1))
        except Exception:
            pass

    return {
        "incidents_by_type": [{"name": k, "value": v} for k, v in by_type.items()],
        "incidents_by_severity": [{"name": k, "value": v} for k, v in by_severity.items()],
        "incidents_by_source": [{"name": k, "value": v} for k, v in by_source.items()],
        "incidents_by_status": [{"name": k, "value": v} for k, v in by_status.items()],
        "volunteer_status": [{"name": k, "value": v} for k, v in by_vol_status.items()],
        "timeline": [{"date": k, "count": v} for k, v in sorted(timeline.items())],
        "resolved_vs_active": [
            {"name": "Active", "value": len(active)},
            {"name": "Resolved", "value": len(resolved)},
        ],
        "avg_response_time_minutes": round(sum(response_times) / len(response_times), 1) if response_times else 0,
        "response_times": response_times,
    }
