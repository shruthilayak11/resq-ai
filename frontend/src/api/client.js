import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// ---- Dashboard / analytics ----
export const getDashboardStats = () => api.get("/dashboard/stats").then((r) => r.data);
export const getAnalytics = () => api.get("/analytics").then((r) => r.data);

// ---- Incidents ----
export const getIncidents = () => api.get("/incidents").then((r) => r.data);
export const getIncident = (id) => api.get(`/incidents/${id}`).then((r) => r.data);
export const reportCitizenIncident = (payload) => api.post("/incidents/citizen", payload).then((r) => r.data);
export const reportAgencyIncident = (payload) => api.post("/incidents/agency", payload).then((r) => r.data);
export const reportSensorIncident = (payload) => api.post("/incidents/sensor", payload).then((r) => r.data);
export const updateIncidentStatus = (id, status) => api.put(`/incidents/${id}/status`, { status }).then((r) => r.data);
export const getIncidentVolunteers = (id) => api.get(`/incidents/${id}/volunteers`).then((r) => r.data);
export const simulateIncident = (scenario, sourceType = "CITIZEN") =>
  api.post(`/incidents/simulate?scenario=${scenario}&source_type=${sourceType}`).then((r) => r.data);
export const demoReset = () => api.post("/incidents/demo-reset").then((r) => r.data);

// ---- Volunteers ----
export const getVolunteers = () => api.get("/volunteers").then((r) => r.data);

// ---- Resources ----
export const getResources = () => api.get("/resources").then((r) => r.data);

// ---- Assignments ----
export const createAssignment = (incidentId, volunteerId, task = "Emergency response") =>
  api.post("/assignments", { incident_id: incidentId, volunteer_id: volunteerId, task }).then((r) => r.data);
export const updateAssignmentStatus = (assignmentId, status) =>
  api.put(`/assignments/${assignmentId}`, { status }).then((r) => r.data);
export const getAssignments = () => api.get("/assignments").then((r) => r.data);
