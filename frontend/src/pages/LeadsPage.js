import React, { useEffect, useState, useCallback, useRef } from "react";
import { getLeads, createLead, updateLead, deleteLead, addNote, deleteNote } from "../utils/api";

const STATUSES = ["new","contacted","qualified","converted","lost"];
const SOURCES  = ["website","referral","linkedin","email","cold-call","other"];
const initials = (f, l) => ((f||"")[0]||"").toUpperCase() + ((l||"")[0]||"").toUpperCase();

function Badge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

function Modal({ lead, onClose, onSaved }) {
  const empty = { firstName:"", lastName:"", email:"", phone:"", company:"", source:"website", status:"new", value:"", tags:"" };
  const [form, setForm] = useState(lead ? { firstName:lead.firstName, lastName:lead.lastName, email:lead.email, phone:lead.phone, company:lead.company, source:lead.source, status:lead.status, value:lead.value||"", tags:(lead.tags||[]).join(", ") } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const handleSave = async () => {
    if (!form.firstName || !form.email) { setError("First name and email are required."); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form, value:Number(form.value)||0, tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean) };
      const res = lead ? await updateLead(lead._id, payload) : await createLead(payload);
      onSaved(res.data);
    } catch(e) { setError(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{lead ? "Edit Lead" : "Add New Lead"}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="login-error" style={{marginBottom:14}}>{error}</div>}
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="Jane" /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Doe" /></div>
          </div>
          <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="jane@company.com" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 98765 00000" /></div>
            <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Acme Inc." /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Source</label><select className="form-control" value={form.source} onChange={e=>set("source",e.target.value)}>{SOURCES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={e=>set("status",e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Deal Value (₹)</label><input className="form-control" type="number" value={form.value} onChange={e=>set("value",e.target.value)} placeholder="50000" /></div>
            <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-control" value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="vip, enterprise" /></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner" /> : (lead ? "Save Changes" : "Add Lead")}</button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ lead, onUpdate, onDelete }) {
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [status, setStatus] = useState(lead.status);

  useEffect(() => setStatus(lead.status), [lead]);

  const handleStatus = async (val) => {
    setStatus(val);
    const res = await updateLead(lead._id, { status:val });
    onUpdate(res.data);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    const res = await addNote(lead._id, noteText.trim());
    onUpdate(res.data); setNoteText("");
    setSavingNote(false);
  };

  const handleDeleteNote = async (nid) => {
    const res = await deleteNote(lead._id, nid);
    onUpdate(res.data);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteLead(lead._id);
    onDelete(lead._id);
  };

  return (
    <div className="detail-panel">
      <div className="detail-top">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div className="detail-avatar-lg">{initials(lead.firstName, lead.lastName)}</div>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700 }}>{lead.firstName} {lead.lastName}</div>
            <div style={{ fontSize:12, color:"var(--text2)" }}>{lead.email}</div>
          </div>
          <Badge status={lead.status} />
        </div>
        <div className="detail-section">
          <div className="detail-section-title">Update Status</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {STATUSES.map(s => (
              <button key={s} className={`btn btn-sm ${status===s?"btn-primary":"btn-ghost"}`} onClick={() => handleStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="detail-body">
        <div className="detail-section">
          <div className="detail-section-title">Contact Info</div>
          {[["Phone", lead.phone||"—"], ["Company", lead.company||"—"], ["Source", lead.source], ["Value", lead.value ? `₹${lead.value.toLocaleString("en-IN")}` : "—"], ["Added", new Date(lead.createdAt).toLocaleDateString("en-IN")]].map(([label, val]) => (
            <div className="detail-row" key={label}>
              <span className="detail-row-label">{label}</span>
              <span className="detail-row-val">{val}</span>
            </div>
          ))}
        </div>
        <div className="detail-section">
          <div className="detail-section-title">Notes ({lead.notes?.length || 0})</div>
          {(lead.notes||[]).length === 0 && <div style={{ fontSize:12, color:"var(--text3)", marginBottom:10 }}>No notes yet</div>}
          {[...(lead.notes||[])].reverse().map(n => (
            <div className="note-item" key={n._id}>
              <div>{n.text}</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span className="note-date">{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                <button style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:11 }} onClick={() => handleDeleteNote(n._id)}>delete</button>
              </div>
            </div>
          ))}
          <textarea className="form-control" style={{ fontSize:12, minHeight:64, marginBottom:8 }} placeholder="Add a follow-up note…" value={noteText} onChange={e => setNoteText(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={savingNote || !noteText.trim()}>{savingNote ? <span className="spinner" /> : "Save Note"}</button>
        </div>
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:14, marginTop:4 }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete lead</button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const debounceRef = useRef(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads({ search, status, source, limit:50 });
      setLeads(res.data.leads); setTotal(res.data.total);
    } catch(e) {} finally { setLoading(false); }
  }, [search, status, source]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLeads(), 300);
  }, [fetchLeads]);

  useEffect(() => {
    if (selected) {
      const fresh = leads.find(l => l._id === selected._id);
      if (fresh) setSelected(fresh);
    }
  }, [leads]); // eslint-disable-line

  const handleSaved = (lead) => {
    setLeads(prev => { const idx = prev.findIndex(l => l._id === lead._id); if (idx >= 0) { const next=[...prev]; next[idx]=lead; return next; } return [lead,...prev]; });
    setSelected(lead); setShowModal(false); setEditLead(null);
    setTotal(t => editLead ? t : t+1);
  };

  const handleUpdate = (updated) => { setLeads(prev => prev.map(l => l._id===updated._id ? updated : l)); setSelected(updated); };
  const handleDelete = (id) => { setLeads(prev => prev.filter(l => l._id!==id)); setTotal(t=>t-1); setSelected(null); };

  return (
    <div className="page-fade">
      <div className="page-header">
        <div><h1 className="page-title">All Leads</h1><p className="page-subtitle">{total} total lead{total!==1?"s":""}</p></div>
        <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>+ Add Lead</button>
      </div>
      <div className="leads-layout">
        <div className="card">
          <div className="search-row">
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l3 3"/></svg>
              <input placeholder="Search name, email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width:"auto" }} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All status</option>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-control" style={{ width:"auto" }} value={source} onChange={e => setSource(e.target.value)}>
              <option value="">All sources</option>{SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="table-wrap">
            {loading ? <div style={{ display:"flex", justifyContent:"center", padding:48 }}><div className="spinner" style={{ width:28, height:28 }} /></div> : (
              <table>
                <thead><tr><th>Lead</th><th>Company</th><th>Source</th><th>Status</th><th>Value</th><th>Date</th></tr></thead>
                <tbody>
                  {leads.length===0 && <tr className="empty-row"><td colSpan={6}>No leads found</td></tr>}
                  {leads.map(l => (
                    <tr key={l._id} onClick={() => setSelected(l)} style={{ background: selected?._id===l._id ? "rgba(181,242,61,0.05)" : undefined, cursor:"pointer" }}>
                      <td><div className="td-name">{l.firstName} {l.lastName}</div><div className="td-email">{l.email}</div></td>
                      <td className="text-muted text-sm">{l.company||"—"}</td>
                      <td><span className="source-pill">{l.source}</span></td>
                      <td><Badge status={l.status} /></td>
                      <td className="text-sm" style={{ color:"var(--accent)", fontWeight:500 }}>{l.value ? `₹${l.value.toLocaleString("en-IN")}` : "—"}</td>
                      <td className="text-muted text-sm">{new Date(l.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div>
          {!selected ? (
            <div className="detail-empty">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{ display:"block", margin:"0 auto 12px", opacity:0.2 }}><circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 28a10 10 0 0120 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Select a lead to view details
            </div>
          ) : (
            <>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditLead(selected); setShowModal(true); }}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft:"auto" }} onClick={() => setSelected(null)}>✕ Close</button>
              </div>
              <DetailPanel lead={selected} onUpdate={handleUpdate} onDelete={handleDelete} />
            </>
          )}
        </div>
      </div>
      {showModal && <Modal lead={editLead} onClose={() => { setShowModal(false); setEditLead(null); }} onSaved={handleSaved} />}
    </div>
  );
}
