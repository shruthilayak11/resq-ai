from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------- Enums ----------

class IncidentType(str, Enum):
    FLOOD = "Flood"
    FIRE = "Fire"
    MEDICAL = "Medical Emergency"
    ACCIDENT = "Road Accident"
    COLLAPSE = "Building Collapse"
    MISSING_PERSON = "Missing Person"
    NATURAL_DISASTER = "Natural Disaster"
    OTHER = "Other"


class Urgency(str, Enum):
    IMMEDIATE = "Immediate"
    URGENT = "Urgent"
    NORMAL = "Normal"


class Severity(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class PriorityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class SourceType(str, Enum):
    CITIZEN = "CITIZEN"
    AGENCY = "AGENCY"
    SENSOR = "SENSOR"


class IncidentStatus(str, Enum):
    REPORTED = "REPORTED"
    ANALYSED = "ANALYSED"
    PRIORITISED = "PRIORITISED"
    ASSIGNED = "ASSIGNED"
    DISPATCHED = "DISPATCHED"
    RESOLVED = "RESOLVED"


class VolunteerStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    BUSY = "BUSY"


# ---------- AI output contract (validated, never trusted raw) ----------

class AIExtraction(BaseModel):
    incident_type: IncidentType = IncidentType.OTHER
    location: Optional[str] = None
    severity: Severity = Severity.MEDIUM
    people_affected: int = Field(default=0, ge=0)
    vulnerable_groups: list[str] = Field(default_factory=list)
    urgency: Urgency = Urgency.NORMAL
    required_skills: list[str] = Field(default_factory=list)
    required_resources: list[str] = Field(default_factory=list)


# ---------- Incident ----------

class CitizenIncidentIn(BaseModel):
    incident_type: IncidentType
    location: str
    description: str
    people_affected: int = Field(ge=0, default=0)
    vulnerable_people: bool = False
    urgency: Urgency = Urgency.NORMAL
    contact: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AgencyIncidentIn(BaseModel):
    incident_type: IncidentType
    location: str
    description: str
    agency_name: str = "State Disaster Response Agency"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SensorIncidentIn(BaseModel):
    incident_type: IncidentType
    location: str
    description: str
    sensor_id: str = "SENSOR-AUTO"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PriorityFactors(BaseModel):
    severity_score: float
    people_affected_score: float
    vulnerability_score: float
    urgency_score: float
    resource_gap_score: float


class Incident(BaseModel):
    id: str
    source_type: SourceType
    raw_description: str
    incident_type: IncidentType
    location: str
    latitude: float
    longitude: float
    severity: Severity
    people_affected: int
    vulnerable_groups: list[str] = Field(default_factory=list)
    urgency: Urgency
    required_skills: list[str] = Field(default_factory=list)
    required_resources: list[str] = Field(default_factory=list)
    priority_score: float
    priority_level: PriorityLevel
    priority_factors: PriorityFactors
    priority_explanation: str
    ai_mode: str = "MOCK"
    recommended_volunteers: list[dict] = Field(default_factory=list)
    assigned_volunteers: list[str] = Field(default_factory=list)
    status: IncidentStatus = IncidentStatus.REPORTED
    created_at: str
    updated_at: str


class StatusUpdate(BaseModel):
    status: IncidentStatus


# ---------- Volunteer ----------

class Volunteer(BaseModel):
    id: str
    name: str
    skills: list[str]
    location: str
    latitude: float
    longitude: float
    availability: bool = True
    status: VolunteerStatus = VolunteerStatus.AVAILABLE
    capacity: int = 1
    current_assignments: int = 0
    contact: str
    experience: str  # e.g. "3 years", "Beginner"


# ---------- Resource ----------

class ResourceType(str, Enum):
    HOSPITAL = "Hospital"
    SHELTER = "Shelter"
    RESPONSE_CENTER = "Emergency Response Center"
    BOAT = "Boat"
    AMBULANCE = "Ambulance"
    MEDICAL_KIT = "Medical Kit"
    RESCUE_EQUIPMENT = "Rescue Equipment"


class Resource(BaseModel):
    id: str
    name: str
    type: ResourceType
    latitude: float
    longitude: float
    availability: bool = True
    capacity: int


# ---------- Assignment ----------

class AssignmentStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"


class AssignmentIn(BaseModel):
    incident_id: str
    volunteer_id: str
    task: str = "Emergency response"


class Assignment(BaseModel):
    id: str
    incident_id: str
    volunteer_id: str
    assigned_at: str
    status: AssignmentStatus = AssignmentStatus.ASSIGNED
    task: str


class AssignmentStatusUpdate(BaseModel):
    status: AssignmentStatus
