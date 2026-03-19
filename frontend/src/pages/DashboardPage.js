import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSummary } from "../utils/api";

const STATUS_COLORS = {
  new: "var(--blue)", contacted: "var(--amber)",
  qualified: "var(--purple)", converted: "var(--green)", lost: "var(--red)",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSummary().then(r => setSummary(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sc = summary?.statusCounts || {};
  const total = summary?.total || 0;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
      <div className="spinner" style={{ width:36, height:36 }} />
    </div>
  );

  return (
    <div className="page-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/leads")}>+ Add Lead</button>
      </div>

      <div className="stats-grid">
        {[
          { label:"Total Leads",  value: total,               sub:"All time",         color:"var(--accent)" },
          { label:"New",          value: sc.new || 0,         sub:"Awaiting contact", color:"var(--blue)"   },
          { label:"Contacted",    value: sc.contacted || 0,   sub:"In progress",      color:"var(--amber)"  },
          { label:"Converted",    value: sc.converted || 0,   sub:`${summary?.conversionRate || 0}% rate`, color:"var(--green)" },
        ].map(s => (
          <div className="card stat-card" key={s.label} style={{ borderTop:`2px solid ${s.color}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.5px", color:"var(--text2)", marginBottom:14 }}>Pipeline Overview</div>
        <div style={{ display:"flex", gap:3, height:10, borderRadius:8, overflow:"hidden", marginBottom:14 }}>
          {["new","contacted","qualified","converted","lost"].map(s => {
            const count = sc[s] || 0;
            const pct = total ? (count / total * 100) : 0;
            return pct > 0 ? <div key={s} style={{ flex:pct, background:STATUS_COLORS[s], minWidth:4 }} title={`${s}: ${count}`} /> : null;
          })}
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {["new","contacted","qualified","converted","lost"].map(s => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLORS[s] }} />
              <span style={{ color:"var(--text2)" }}>{s}</span>
              <span style={{ fontWeight:500 }}>{sc[s] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
          <span style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.5px", color:"var(--text2)" }}>Recent Leads</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/leads")}>View all →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Lead</th><th>Source</th><th>Status</th><th>Added</th></tr></thead>
            <tbody>
              {(summary?.recentLeads || []).length === 0 && (
                <tr className="empty-row"><td colSpan={4}>No leads yet — add your first one!</td></tr>
              )}
              {(summary?.recentLeads || []).map(l => (
                <tr key={l._id} onClick={() => navigate("/leads")} style={{ cursor:"pointer" }}>
                  <td><div className="td-name">{l.firstName} {l.lastName}</div><div className="td-email">{l.email}</div></td>
                  <td><span className="source-pill">{l.source}</span></td>
                  <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                  <td className="text-muted text-sm">{new Date(l.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
