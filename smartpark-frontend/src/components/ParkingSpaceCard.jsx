import { Link } from "react-router-dom";

export default function ParkingSpaceCard({ space }) {
  return (
    <Link to={`/space/${space.id}`} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>{space.title}</h3>
          <p style={{ fontSize: "0.85rem" }}>{space.address}, {space.city}</p>
        </div>
        <span className={`badge ${space.status === "active" ? "badge-available" : "badge-full"}`}>
          {space.status === "active" ? "Listed" : "Inactive"}
        </span>
      </div>

      <div className="lane-divider" style={{ margin: "4px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono" style={{ color: "var(--concrete-400)", fontSize: "0.8rem" }}>
          {space.totalSlots} total slots
        </span>
        <span className="mono" style={{ color: "var(--signal-amber)", fontWeight: 600, fontSize: "1.05rem" }}>
          ₹{space.pricePerHour}<span style={{ color: "var(--concrete-400)", fontSize: "0.75rem" }}>/hr</span>
        </span>
      </div>
    </Link>
  );
}
