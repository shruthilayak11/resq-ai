from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database.db import db
from app.schemas.schemas import AssignmentIn, AssignmentStatusUpdate

router = APIRouter(prefix="/assignments", tags=["assignments"])

# status flows: ASSIGNED -> DISPATCHED -> COMPLETED
INCIDENT_STATUS_FOR = {"ASSIGNED": "ASSIGNED", "DISPATCHED": "DISPATCHED", "COMPLETED": "RESOLVED"}
VOLUNTEER_STATUS_FOR = {"ASSIGNED": "ASSIGNED", "DISPATCHED": "EN_ROUTE", "COMPLETED": "AVAILABLE"}


@router.get("")
async def list_assignments():
    return await db.assignments.find_all()


@router.post("")
async def create_assignment(payload: AssignmentIn):
    incident = await db.incidents.find_one({"id": payload.incident_id})
    volunteer = await db.volunteers.find_one({"id": payload.volunteer_id})
    if not incident:
        raise HTTPException(404, "Incident not found")
    if not volunteer:
        raise HTTPException(404, "Volunteer not found")

    now = datetime.now(timezone.utc).isoformat()
    assignment = await db.assignments.insert({
        "incident_id": payload.incident_id,
        "volunteer_id": payload.volunteer_id,
        "assigned_at": now,
        "status": "ASSIGNED",
        "task": payload.task,
    })

    await db.volunteers.update(volunteer["id"], {
        "status": "ASSIGNED",
        "current_assignments": volunteer.get("current_assignments", 0) + 1,
    })

    assigned_ids = set(incident.get("assigned_volunteers", []))
    assigned_ids.add(volunteer["id"])
    await db.incidents.update(incident["id"], {
        "assigned_volunteers": list(assigned_ids),
        "status": "ASSIGNED",
        "updated_at": now,
    })

    return assignment


@router.put("/{assignment_id}")
async def update_assignment_status(assignment_id: str, payload: AssignmentStatusUpdate):
    assignment = await db.assignments.find_one({"id": assignment_id})
    if not assignment:
        raise HTTPException(404, "Assignment not found")

    new_status = payload.status.value
    now = datetime.now(timezone.utc).isoformat()
    updated = await db.assignments.update(assignment_id, {"status": new_status})

    incident = await db.incidents.find_one({"id": assignment["incident_id"]})
    volunteer = await db.volunteers.find_one({"id": assignment["volunteer_id"]})

    if incident:
        await db.incidents.update(incident["id"], {
            "status": INCIDENT_STATUS_FOR.get(new_status, incident["status"]),
            "updated_at": now,
        })
    if volunteer:
        new_vol_status = VOLUNTEER_STATUS_FOR.get(new_status, volunteer["status"])
        patch = {"status": new_vol_status}
        if new_status == "COMPLETED":
            patch["current_assignments"] = max(0, volunteer.get("current_assignments", 1) - 1)
        await db.volunteers.update(volunteer["id"], patch)

    return updated
