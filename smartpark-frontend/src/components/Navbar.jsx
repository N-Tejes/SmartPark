import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--asphalt-700)",
        background: "rgba(16,19,26,0.85)",
        backdropFilter: "blur(6px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="shell"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "var(--signal-amber)",
              color: "#1A1300",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            P
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            SmartPark
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Link to="/" className="eyebrow" style={{ color: "var(--concrete-300)" }}>
            Find Parking
          </Link>

          {user?.role === "owner" && (
            <Link to="/owner" className="eyebrow" style={{ color: "var(--concrete-300)" }}>
              Owner Dashboard
            </Link>
          )}

          {user?.role === "customer" && (
            <Link to="/my-bookings" className="eyebrow" style={{ color: "var(--concrete-300)" }}>
              My Bookings
            </Link>
          )}

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--concrete-400)" }}>
                {user.name}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
