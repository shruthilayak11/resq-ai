from fastapi import APIRouter, HTTPException

from app.database.db import db

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.get("")
async def list_volunteers():
    return await db.volunteers.find_all()


@router.get("/{volunteer_id}")
async def get_volunteer(volunteer_id: str):
    v = await db.volunteers.find_one({"id": volunteer_id})
    if not v:
        raise HTTPException(404, "Volunteer not found")
    return v
