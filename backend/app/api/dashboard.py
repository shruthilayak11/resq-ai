from datetime import datetime, timezone

from fastapi import APIRouter

from app.ai.ai_service import ai_mode
from app.database.db import STORAGE_MODE, db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def dashboard_stats():
    incidents = await db.incidents.find_all()
    volunteers = await db.volunteers.find_all()

    active = [i for i in incidents if i["status"] != "RESOLVED"]
    critical = [i for i in active if i["priority_level"] == "CRITICAL"]
    resolved = [i for i in incidents if i["status"] == "RESOLVED"]
    available_vols = [v for v in volunteers if v["status"] == "AVAILABLE"]
    deployed_vols = [v for v in volunteers if v["status"] in ("ASSIGNED", "EN_ROUTE")]

    response_times = []
    for i in resolved:
        try:
            created = datetime.fromisoformat(i["created_at"])
            updated = datetime.fromisoformat(i["updated_at"])
            response_times.append((updated - created).total_seconds() / 60)
        except Exception:
            pass
    avg_response = round(sum(response_times) / len(response_times), 1) if response_times else 0

    return {
        "active_incidents": len(active),
        "critical_incidents": len(critical),
        "volunteers_available": len(available_vols),
        "volunteers_deployed": len(deployed_vols),
        "incidents_resolved": len(resolved),
        "avg_response_time_minutes": avg_response,
        "total_incidents": len(incidents),
        "total_volunteers": len(volunteers),
        "system_status": "OPERATIONAL",
        "ai_mode": ai_mode(),
        "storage_mode": STORAGE_MODE,
        "server_time": datetime.now(timezone.utc).isoformat(),
    }
