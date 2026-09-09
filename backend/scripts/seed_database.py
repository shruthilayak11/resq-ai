"""
Seed the database with realistic demo data:
 - 18 volunteers
 - 12 resources
 - ~20 incidents run through the real pipeline (AI extraction + priority engine + matching)
   at varying severities, sources, and statuses.

Run directly:  python -m scripts.seed_database
Or imported and awaited by the /incidents/demo-reset API endpoint.
"""
import asyncio
import random
from datetime import datetime, timedelta, timezone

from app.database.db import db, new_id
from app.services.incident_pipeline import process_incident

VOLUNTEERS = [
    dict(name="Anita Raman", skills=["Water Rescue", "Medical"], location="Katpadi", latitude=12.9710, longitude=79.1540, experience="Expert", contact="anita.raman@resq.demo"),
    dict(name="Priya Kumar", skills=["Medical", "First Aid"], location="Vellore Town", latitude=12.9180, longitude=79.1340, experience="Experienced", contact="priya.kumar@resq.demo"),
    dict(name="Divya S", skills=["Crowd Management", "Communication"], location="Gandhi Nagar", latitude=12.9640, longitude=79.1600, experience="Intermediate", contact="divya.s@resq.demo"),
    dict(name="Karthik Bala", skills=["Fire Safety", "Search & Rescue"], location="Katpadi", latitude=12.9680, longitude=79.1500, experience="Expert", contact="karthik.bala@resq.demo"),
    dict(name="Meena Iyer", skills=["Medical", "Logistics"], location="Chennai - Sholinganallur", latitude=12.9020, longitude=80.2290, experience="Experienced", contact="meena.iyer@resq.demo"),
    dict(name="Suresh Nathan", skills=["Search & Rescue", "Driving"], location="Ranipet", latitude=12.9220, longitude=79.3300, experience="Experienced", contact="suresh.nathan@resq.demo"),
    dict(name="Lakshmi Venkat", skills=["First Aid", "Food Distribution"], location="Arcot", latitude=12.9060, longitude=79.3190, experience="Intermediate", contact="lakshmi.venkat@resq.demo"),
    dict(name="Ravi Shankar", skills=["Water Rescue", "Driving"], location="Katpadi", latitude=12.9730, longitude=79.1560, experience="Beginner", contact="ravi.shankar@resq.demo"),
    dict(name="Fathima Noor", skills=["Medical", "Communication"], location="Vellore Town", latitude=12.9150, longitude=79.1300, experience="Expert", contact="fathima.noor@resq.demo"),
    dict(name="Arjun Dev", skills=["Fire Safety", "Logistics"], location="Gudiyatham", latitude=12.9460, longitude=78.8710, experience="Intermediate", contact="arjun.dev@resq.demo"),
    dict(name="Sowmya R", skills=["Search & Rescue", "Medical"], location="Chennai - Tambaram", latitude=12.9260, longitude=80.1010, experience="Experienced", contact="sowmya.r@resq.demo"),
    dict(name="Vignesh Kumar", skills=["Crowd Management", "Driving"], location="Ambur", latitude=12.7920, longitude=78.7170, experience="Beginner", contact="vignesh.kumar@resq.demo"),
    dict(name="Deepa Krishnan", skills=["Food Distribution", "Logistics"], location="Chennai", latitude=13.0840, longitude=80.2720, experience="Experienced", contact="deepa.krishnan@resq.demo"),
    dict(name="Manoj Prabhu", skills=["Water Rescue", "First Aid"], location="Katpadi", latitude=12.9690, longitude=79.1510, experience="Expert", contact="manoj.prabhu@resq.demo"),
    dict(name="Nandhini T", skills=["Medical", "First Aid"], location="Vellore Town", latitude=12.9200, longitude=79.1360, experience="Intermediate", contact="nandhini.t@resq.demo"),
    dict(name="Harish Chandran", skills=["Search & Rescue", "Fire Safety"], location="Ranipet", latitude=12.9230, longitude=79.3320, experience="Experienced", contact="harish.chandran@resq.demo"),
    dict(name="Swathi Ganesh", skills=["Communication", "Crowd Management"], location="Chennai - Sholinganallur", latitude=12.9000, longitude=80.2260, experience="Intermediate", contact="swathi.ganesh@resq.demo"),
    dict(name="Bala Murugan", skills=["Driving", "Logistics"], location="Gandhi Nagar", latitude=12.9620, longitude=79.1590, experience="Beginner", contact="bala.murugan@resq.demo"),
]

RESOURCES = [
    dict(name="CMC Vellore Hospital", type="Hospital", latitude=12.9256, longitude=79.1348, capacity=400),
    dict(name="Government General Hospital, Vellore", type="Hospital", latitude=12.9200, longitude=79.1370, capacity=250),
    dict(name="Apollo Hospitals, Chennai", type="Hospital", latitude=13.0604, longitude=80.2496, capacity=500),
    dict(name="Katpadi Community Shelter", type="Shelter", latitude=12.9715, longitude=79.1545, capacity=150),
    dict(name="Ranipet Relief Shelter", type="Shelter", latitude=12.9225, longitude=79.3310, capacity=100),
    dict(name="Vellore Emergency Response Center", type="Emergency Response Center", latitude=12.9170, longitude=79.1330, capacity=60),
    dict(name="Chennai Disaster Response HQ", type="Emergency Response Center", latitude=13.0827, longitude=80.2707, capacity=80),
    dict(name="Rescue Boat Unit - Katpadi", type="Boat", latitude=12.9700, longitude=79.1550, capacity=6),
    dict(name="Rescue Boat Unit - Arcot", type="Boat", latitude=12.9055, longitude=79.3200, capacity=4),
    dict(name="Ambulance Fleet - Vellore", type="Ambulance", latitude=12.9180, longitude=79.1340, capacity=10),
    dict(name="Ambulance Fleet - Chennai South", type="Ambulance", latitude=12.9100, longitude=80.2200, capacity=15),
    dict(name="Rescue Equipment Depot - Ranipet", type="Rescue Equipment", latitude=12.9230, longitude=79.3300, capacity=20),
]

# (incident_type_hint, source_type, description, minutes_ago, target_status)
SEED_INCIDENTS = [
    ("Flood", "CITIZEN", "Severe flooding near Katpadi. Around 30 people are stranded and several elderly residents need immediate medical assistance. We need boats and medical assistance.", 8, "PRIORITISED"),
    ("Fire", "CITIZEN", "Fire has broken out in an apartment building in Gandhi Nagar, thick smoke everywhere, residents including children trapped on the third floor.", 15, "ASSIGNED"),
    ("Medical Emergency", "CITIZEN", "An elderly woman collapsed and is unconscious near Vellore Town bus stand, bystanders say she is not responding, urgent medical help needed.", 22, "PRIORITISED"),
    ("Road Accident", "AGENCY", "Two-vehicle collision reported on the Vellore-Chennai highway near Arcot, multiple injuries including a child, ambulance requested urgently.", 40, "DISPATCHED"),
    ("Building Collapse", "CITIZEN", "Partial collapse of an under-construction building in Ranipet, at least two workers believed trapped under rubble, search and rescue urgently required.", 12, "PRIORITISED"),
    ("Flood", "SENSOR", "Water level sensor near Katpadi river bank reports rapid rise, low-lying colony at risk of flash flooding within the hour.", 55, "REPORTED"),
    ("Fire", "AGENCY", "Tamil Nadu Fire Department reports a warehouse fire near Ambur industrial area, hazardous smoke, evacuation of nearby residents in progress.", 90, "DISPATCHED"),
    ("Medical Emergency", "CITIZEN", "Pregnant woman experiencing severe complications at home in Gudiyatham, family requesting urgent ambulance and medical support.", 5, "PRIORITISED"),
    ("Missing Person", "CITIZEN", "An elderly man with memory issues has gone missing near Vellore Town market since this morning, family very worried.", 130, "ASSIGNED"),
    ("Natural Disaster", "AGENCY", "District Disaster Management Authority reports heavy landslide risk in hilly areas near Gudiyatham after continuous rainfall, advisory issued for nearby villages.", 200, "REPORTED"),
    ("Road Accident", "CITIZEN", "Two-wheeler accident near Katpadi junction, rider injured and bleeding, needs urgent first aid and ambulance.", 18, "RESOLVED"),
    ("Flood", "CITIZEN", "Moderate waterlogging reported near Ranipet residential colony after heavy rain, a few families requesting evacuation assistance.", 260, "RESOLVED"),
    ("Medical Emergency", "SENSOR", "Wearable health sensor alert for an elderly resident in Chennai Tambaram indicating irregular heart rate, requesting medical check.", 300, "RESOLVED"),
    ("Fire", "CITIZEN", "Small kitchen fire reported in a residential home in Vellore Town, contained but smoke inhalation risk to family members.", 400, "RESOLVED"),
    ("Building Collapse", "AGENCY", "Structural engineers report a wall collapse risk at an old government building in Arcot after recent rains, area cordoned off.", 60, "PRIORITISED"),
    ("Road Accident", "AGENCY", "Highway patrol reports a multi-vehicle pileup near Chennai Sholinganallur during heavy rain, several injuries, emergency responders en route.", 3, "PRIORITISED"),
    ("Flood", "AGENCY", "Water Resources Department reports overflow risk at a check dam near Katpadi, downstream villages advised to prepare for evacuation.", 500, "RESOLVED"),
    ("Missing Person", "CITIZEN", "A teenager has not returned home since yesterday evening near Gandhi Nagar, family has filed a report and is requesting search assistance.", 700, "ASSIGNED"),
    ("Medical Emergency", "CITIZEN", "Construction worker fell from scaffolding near Ranipet industrial estate, conscious but severe leg injury, needs urgent medical evacuation.", 27, "PRIORITISED"),
    ("Natural Disaster", "SENSOR", "Seismic sensor network detected a minor tremor near Ambur, no visible damage reported yet, area under precautionary watch.", 850, "RESOLVED"),
]


async def seed(reset: bool = False) -> dict:
    if reset:
        await db.incidents.replace_all([])
        await db.volunteers.replace_all([])
        await db.resources.replace_all([])
        await db.assignments.replace_all([])

    existing_vols = await db.volunteers.count()
    if existing_vols == 0:
        for v in VOLUNTEERS:
            await db.volunteers.insert({
                "id": new_id("VOL-"),
                "name": v["name"],
                "skills": v["skills"],
                "location": v["location"],
                "latitude": v["latitude"],
                "longitude": v["longitude"],
                "availability": True,
                "status": "AVAILABLE",
                "capacity": random.choice([1, 1, 2]),
                "current_assignments": 0,
                "contact": v["contact"],
                "experience": v["experience"],
            })

    existing_res = await db.resources.count()
    if existing_res == 0:
        for r in RESOURCES:
            await db.resources.insert({
                "id": new_id("RES-"),
                "name": r["name"],
                "type": r["type"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "availability": True,
                "capacity": r["capacity"],
            })

    existing_inc = await db.incidents.count()
    if existing_inc == 0:
        for incident_type, source, desc, minutes_ago, target_status in SEED_INCIDENTS:
            incident = await process_incident(
                source_type=source,
                description=desc,
                location_hint="",
                hint_type=incident_type,
            )
            created = datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)
            patch = {"created_at": created.isoformat()}
            if target_status == "RESOLVED":
                resolved_at = created + timedelta(minutes=random.randint(20, 90))
                patch["updated_at"] = resolved_at.isoformat()
                patch["status"] = "RESOLVED"
            elif target_status in ("ASSIGNED", "DISPATCHED"):
                patch["status"] = target_status
                patch["updated_at"] = (created + timedelta(minutes=5)).isoformat()
                # also wire up a real assignment + volunteer status so the UI is consistent
                volunteers = await db.volunteers.find_all({"status": "AVAILABLE"})
                if volunteers:
                    vol = random.choice(volunteers)
                    await db.assignments.insert({
                        "id": new_id("ASG-"),
                        "incident_id": incident["id"],
                        "volunteer_id": vol["id"],
                        "assigned_at": created.isoformat(),
                        "status": "DISPATCHED" if target_status == "DISPATCHED" else "ASSIGNED",
                        "task": "Emergency response",
                    })
                    await db.volunteers.update(vol["id"], {
                        "status": "EN_ROUTE" if target_status == "DISPATCHED" else "ASSIGNED",
                        "current_assignments": vol.get("current_assignments", 0) + 1,
                    })
                    patch["assigned_volunteers"] = [vol["id"]]
            else:
                patch["status"] = target_status
            await db.incidents.update(incident["id"], patch)

    return {
        "volunteers": await db.volunteers.count(),
        "resources": await db.resources.count(),
        "incidents": await db.incidents.count(),
    }


if __name__ == "__main__":
    result = asyncio.run(seed(reset=True))
    print(f"Seeded: {result}")
