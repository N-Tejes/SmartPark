import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TicketStub from "../components/TicketStub";

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [spaceTitles, setSpaceTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [payMethod, setPayMethod] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMyBookings(token);
      setBookings(data.bookings);

      const uniqueSpaceIds = [...new Set(data.bookings.map((b) => b.parkingSpaceId))];
      const missing = uniqueSpaceIds.filter((id) => !(id in spaceTitles));
      if (missing.length) {
        const entries = await Promise.all(
          missing.map(async (id) => {
            try {
              const spaceData = await api.getSpace(id);
              return [id, spaceData.parkingSpace.title];
            } catch {
              return [id, null];
            }
          })
        );
        setSpaceTitles((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async (bookingId) => {
    setBusyId(bookingId);
    setError("");
    setMessage("");
    try {
      await api.pay({ bookingId, paymentMethod: payMethod[bookingId] || "upi" }, token);
      setMessage("Payment successful — booking confirmed.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    setBusyId(bookingId);
    setError("");
    setMessage("");
    try {
      await api.cancelBooking(bookingId, token);
      setMessage("Booking cancelled and slot released.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
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

  return (
    <div className="page">
      <div className="shell">
        <span className="eyebrow">Your reservations</span>
        <h1 style={{ margin: "8px 0 24px" }}>My bookings</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Search for parking and reserve a slot to see your ticket here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bookings.map((booking) => (
              <TicketStub key={booking.id} booking={booking} spaceTitle={spaceTitles[booking.parkingSpaceId]}>
                {booking.status === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                    <select
                      value={payMethod[booking.id] || "upi"}
                      onChange={(e) => setPayMethod({ ...payMethod, [booking.id]: e.target.value })}
                      style={{
                        background: "var(--asphalt-800)",
                        border: "1px solid var(--asphalt-600)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--chalk-50)",
                        padding: "6px 8px",
                        fontSize: "0.78rem",
                      }}
                    >
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="netbanking">Netbanking</option>
                      <option value="wallet">Wallet</option>
                    </select>
                    <button className="btn btn-primary btn-sm" disabled={busyId === booking.id} onClick={() => handlePay(booking.id)}>
                      {busyId === booking.id ? "Paying…" : "Pay now"}
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === booking.id} onClick={() => handleCancel(booking.id)}>
                      Cancel
                    </button>
                  </div>
                )}
                {booking.status === "confirmed" && (
                  <button className="btn btn-danger btn-sm" disabled={busyId === booking.id} onClick={() => handleCancel(booking.id)}>
                    Cancel
                  </button>
                )}
              </TicketStub>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
