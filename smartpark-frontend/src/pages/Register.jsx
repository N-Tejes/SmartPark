import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "owner" ? "/owner" : "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: "flex", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} className="form-card">
        <span className="eyebrow">Get started</span>
        <h2 style={{ margin: "8px 0 24px" }}>Create an account</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label>I am a</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["customer", "owner"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`btn btn-sm ${form.role === role ? "btn-primary" : "btn-outline"}`}
                style={{ flex: 1 }}
              >
                {role === "customer" ? "Driver" : "Space owner"}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </button>

        <p style={{ marginTop: 18, fontSize: "0.85rem", textAlign: "center" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--signal-amber)" }}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
