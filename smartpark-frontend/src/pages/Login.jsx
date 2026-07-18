import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from || (user.role === "owner" ? "/owner" : "/");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: "flex", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} className="form-card">
        <span className="eyebrow">Welcome back</span>
        <h2 style={{ margin: "8px 0 24px" }}>Log in</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p style={{ marginTop: 18, fontSize: "0.85rem", textAlign: "center" }}>
          New here? <Link to="/register" style={{ color: "var(--signal-amber)" }}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}
