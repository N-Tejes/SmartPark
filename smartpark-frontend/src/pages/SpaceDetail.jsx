import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SpaceDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getSpace(id);
      setSpace(data.parkingSpace);
      setSlots(data.slots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async (slotId) => {
    if (!user) {
      navigate("/login", { state: { from: `/space/${id}` } });
      return;
    }
    if (user.role !== "customer") {
      setError("Only driver accounts can reserve a slot. Log in as a driver to book.");
      return;
    }

    setBookingSlotId(slotId);
    setError("");
    setMessage("");
    try {
      const data = await api.createBooking({ slotId }, token);
      setMessage(`Slot reserved! Head to "My Bookings" to pay and confirm ticket #${data.booking.id.slice(0, 8).toUpperCase()}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingSlotId(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="shell center-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error && !space) {
    return (
      <div className="page">
        <div className="shell">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="shell">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
          <div>
            <span className="eyebrow">{space.city}</span>
            <h1 style={{ margin: "8px 0" }}>{space.title}</h1>
            <p>{space.address}</p>
          </div>
          <div className="card" style={{ textAlign: "center", minWidth: 140 }}>
            <span className="mono" style={{ fontSize: "1.6rem", color: "var(--signal-amber)", fontWeight: 600 }}>
              ₹{space.pricePerHour}
            </span>
            <p style={{ fontSize: "0.75rem" }}>per hour</p>
          </div>
        </div>

        {space.description && <p style={{ maxWidth: 640, marginBottom: 24 }}>{space.description}</p>}

        <div className="lane-divider" />

        <h2 style={{ marginBottom: 16 }}>Available time slots</h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {slots.length === 0 ? (
          <div className="empty-state">
            <h3>No time slots yet</h3>
            <p>This owner hasn't published availability. Check back later.</p>
          </div>
        ) : (
          <div className="grid">
            {slots.map((slot) => (
              <div key={slot.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: "0.9rem" }}>{slot.date}</span>
                  <span className={`badge ${slot.isAvailable ? "badge-available" : "badge-full"}`}>
                    {slot.isAvailable ? "Open" : "Booked"}
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", letterSpacing: "0.02em" }}>
                  {slot.startTime} – {slot.endTime}
                </span>
                <button
                  className="btn btn-primary btn-block"
                  disabled={!slot.isAvailable || bookingSlotId === slot.id}
                  onClick={() => handleBook(slot.id)}
                >
                  {bookingSlotId === slot.id ? "Reserving…" : slot.isAvailable ? "Reserve this slot" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
