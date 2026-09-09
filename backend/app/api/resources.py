from fastapi import APIRouter

from app.database.db import db

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("")
async def list_resources():
    return await db.resources.find_all()
