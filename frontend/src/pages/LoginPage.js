import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("All fields are required"); return; }
    setError(""); setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg viewBox="0 0 20 20" fill="#0a0a0c"><path d="M10 2L2 7v6l8 5 8-5V7L10 2zm0 2.4l5.6 3.5L10 11.4 4.4 7.9 10 4.4zM3.5 9.3l6 3.7v4.1l-6-3.7V9.3zm8.5 7.8v-4.1l6-3.7v4.1l-6 3.7z"/></svg>
          </div>
          <span className="login-brand-name">LeadFlow</span>
        </div>
        <h1 className="login-title">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="login-sub">{mode === "login" ? "Sign in to your CRM dashboard" : "Register your admin account"}</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:"100%", justifyContent:"center", marginTop:8 }}>
            {loading ? <span className="spinner" /> : (mode === "login" ? "Sign in" : "Register")}
          </button>
        </form>
        <p className="login-hint">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <span style={{ color:"var(--accent)", cursor:"pointer" }} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Register" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
