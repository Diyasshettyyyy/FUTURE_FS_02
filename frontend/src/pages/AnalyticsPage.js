import React, { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getSummary, getMonthly } from "../utils/api";

const STATUS_COLOR = { new:"#818cf8", contacted:"#fbbf24", qualified:"#c084fc", converted:"#34d399", lost:"#f87171" };
const SOURCE_COLORS = ["#b5f23d","#818cf8","#34d399","#fbbf24","#c084fc","#f87171"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#18181f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      {label && <div style={{ color:"#8888a0", marginBottom:6 }}>{label}</div>}
      {payload.map((p, i) => <div key={i} style={{ color:p.color||"#eeeef5", marginBottom:2 }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getMonthly()])
      .then(([s, m]) => { setSummary(s.data); setMonthly(m.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  const sc = summary?.statusCounts || {};
  const src = summary?.sourceCounts || {};
  const rate = summary?.conversionRate || 0;

  const statusData = Object.entries(sc).map(([name, value]) => ({ name, value, fill:STATUS_COLOR[name]||"#888" }));
  const sourceData = Object.entries(src).sort((a,b)=>b[1]-a[1]).map(([name, value], i) => ({ name, value, fill:SOURCE_COLORS[i%SOURCE_COLORS.length] }));
  const monthlyData = monthly.map(d => ({
    month: new Date(d._id.year, d._id.month-1, 1).toLocaleDateString("en-IN", { month:"short" }),
    leads: d.count, converted: d.converted, value: d.value,
  }));

  return (
    <div className="page-fade">
      <div className="page-header">
        <div><h1 className="page-title">Analytics</h1><p className="page-subtitle">Performance overview and conversion insights</p></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Leads",     value: summary?.total||0,                                             color:"var(--accent)" },
          { label:"Converted",       value: sc.converted||0,                                              color:"var(--green)"  },
          { label:"Conversion Rate", value: `${rate}%`,                                                   color:"var(--blue)"   },
          { label:"Pipeline Value",  value: `₹${(summary?.totalValue||0).toLocaleString("en-IN")}`,       color:"var(--amber)"  },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"14px 16px", borderLeft:`3px solid ${s.color}` }}>
            <div style={{ fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:700, color:s.color, letterSpacing:"-1px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ marginBottom:16 }}>
        <div className="card chart-card chart-full">
          <div className="chart-title">Monthly Lead Volume & Conversions</div>
          {monthlyData.length === 0 ? <div style={{ color:"var(--text3)", textAlign:"center", padding:32 }}>No data yet — add some leads first!</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                <defs>
                  <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#b5f23d" stopOpacity={0.25}/><stop offset="95%" stopColor="#b5f23d" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill:"#8888a0", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#8888a0", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:12 }} formatter={v => <span style={{ color:"var(--text2)" }}>{v}</span>} />
                <Area type="monotone" dataKey="leads" name="Total Leads" stroke="#b5f23d" strokeWidth={2} fill="url(#gL)" dot={{ fill:"#b5f23d", r:3 }} />
                <Area type="monotone" dataKey="converted" name="Converted" stroke="#34d399" strokeWidth={2} fill="url(#gC)" dot={{ fill:"#34d399", r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <div className="chart-title">Lead Status Breakdown</div>
          {statusData.length === 0 ? <div style={{ color:"var(--text3)", textAlign:"center", padding:32 }}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={{ stroke:"rgba(255,255,255,0.15)" }}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <div className="chart-title">Lead Sources</div>
          {sourceData.length === 0 ? <div style={{ color:"var(--text3)", textAlign:"center", padding:32 }}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sourceData} layout="vertical" margin={{ top:0, right:20, left:10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill:"#8888a0", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill:"#8888a0", fontSize:11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Leads" radius={[0,4,4,0]} maxBarSize={18}>
                  {sourceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card chart-card chart-full">
        <div className="chart-title">Monthly Pipeline Value (₹)</div>
        {monthlyData.length === 0 ? <div style={{ color:"var(--text3)", textAlign:"center", padding:32 }}>No data yet</div> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top:10, right:10, left:-5, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill:"#8888a0", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#8888a0", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => v > 999 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Pipeline Value" fill="#b5f23d" radius={[4,4,0,0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
