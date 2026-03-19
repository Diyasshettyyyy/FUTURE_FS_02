import axios from "axios";

const api = axios.create({ baseURL: "https://leadflow-crm-xryh.onrender.com" });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("crm_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const getLeads   = (params)  => api.get("/leads", { params });
export const getLead    = (id)      => api.get(`/leads/${id}`);
export const createLead = (data)    => api.post("/leads", data);
export const updateLead = (id, d)   => api.put(`/leads/${id}`, d);
export const deleteLead = (id)      => api.delete(`/leads/${id}`);
export const addNote    = (id, txt) => api.post(`/leads/${id}/notes`, { text: txt });
export const deleteNote = (id, nid) => api.delete(`/leads/${id}/notes/${nid}`);
export const getSummary = ()        => api.get("/analytics/summary");
export const getMonthly = ()        => api.get("/analytics/monthly");

export default api;