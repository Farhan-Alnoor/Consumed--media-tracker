import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
export default function Authpage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) await register(form.username, form.email, form.password);
      else await login(form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="card auth-card">
      <h1>{isRegister ? "Create account" : "Log in"}</h1>
      <form onSubmit={onSubmit}>
        {isRegister && (
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={form.username} onChange={onChange} required/>
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={onChange} required />

        </div>
        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
            {submitting? "Please wait..." : isRegister? "Sign up":"Log in"}
        </button>
      </form>
      <p>
        {isRegister?(
            <>Already have an account? <Link to = "/login">Log in </Link></>
        ):(
            <>Don't have an account? <Link to= "/register">Sign up</Link></>
        )}
      </p>
    </div>
  );
}
