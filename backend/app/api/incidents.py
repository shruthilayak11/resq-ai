from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.algorithms.matching_engine import recommend_volunteers
from app.database.db import db
from app.schemas.schemas import AgencyIncidentIn, CitizenIncidentIn, SensorIncidentIn, StatusUpdate
from app.services.incident_pipeline import process_incident

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("")
async def list_incidents():
    incidents = await db.incidents.find_all()
    return sorted(incidents, key=lambda i: i["priority_score"], reverse=True)


@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    incident = await db.incidents.find_one({"id": incident_id})
    if not incident:
        raise HTTPException(404, "Incident not found")
    return incident


@router.post("/citizen")
async def report_citizen_incident(payload: CitizenIncidentIn):
    incident = await process_incident(
        source_type="CITIZEN",
        description=payload.description,
        location_hint=payload.location,
        hint_type=payload.incident_type.value,
        hint_urgency=payload.urgency.value,
        people_affected_hint=payload.people_affected,
        vulnerable_hint=payload.vulnerable_people,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    return incident


@router.post("/agency")
async def report_agency_incident(payload: AgencyIncidentIn):
    incident = await process_incident(
        source_type="AGENCY",
        description=f"[{payload.agency_name}] {payload.description}",
        location_hint=payload.location,
        hint_type=payload.incident_type.value,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    return incident


@router.post("/sensor")
async def report_sensor_incident(payload: SensorIncidentIn):
    incident = await process_incident(
        source_type="SENSOR",
        description=f"[{payload.sensor_id}] {payload.description}",
        location_hint=payload.location,
        hint_type=payload.incident_type.value,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    return incident


@router.put("/{incident_id}/status")
async def update_incident_status(incident_id: str, payload: StatusUpdate):
    incident = await db.incidents.find_one({"id": incident_id})
    if not incident:
        raise HTTPException(404, "Incident not found")
    updated = await db.incidents.update(incident_id, {
        "status": payload.status.value,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return updated


@router.get("/{incident_id}/volunteers")
async def get_incident_volunteers(incident_id: str):
    incident = await db.incidents.find_one({"id": incident_id})
    if not incident:
        raise HTTPException(404, "Incident not found")
    volunteers = await db.volunteers.find_all()
    return recommend_volunteers(incident, volunteers)
