import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TicketStub from "../components/TicketStub";

const emptySpaceForm = {
  title: "",
  address: "",
  city: "",
  totalSlots: "",
  pricePerHour: "",
  description: "",
};

const emptySlotForm = { date: "", startTime: "", endTime: "" };

export default function OwnerDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState("spaces");

  const [spaces, setSpaces] = useState([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [spaceForm, setSpaceForm] = useState(emptySpaceForm);
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [expandedSpaceId, setExpandedSpaceId] = useState(null);
  const [slotsBySpace, setSlotsBySpace] = useState({});
  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [addingSlot, setAddingSlot] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const loadSpaces = async () => {
    setSpacesLoading(true);
    try {
      const data = await api.getMySpaces(token);
      setSpaces(data.parkingSpaces);
    } catch (err) {
      setError(err.message);
    } finally {
      setSpacesLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await api.getOwnerBookings(token);
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "bookings") loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");
    try {
      await api.createSpace(
        {
          ...spaceForm,
          totalSlots: Number(spaceForm.totalSlots),
          pricePerHour: Number(spaceForm.pricePerHour),
        },
        token
      );
      setMessage("Parking space listed successfully.");
      setSpaceForm(emptySpaceForm);
      setShowSpaceForm(false);
      loadSpaces();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleExpand = async (spaceId) => {
    if (expandedSpaceId === spaceId) {
      setExpandedSpaceId(null);
      return;
    }
    setExpandedSpaceId(spaceId);
    if (!slotsBySpace[spaceId]) {
      try {
        const data = await api.getSpace(spaceId);
        setSlotsBySpace((prev) => ({ ...prev, [spaceId]: data.slots }));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddSlot = async (e, spaceId) => {
    e.preventDefault();
    setAddingSlot(true);
    setError("");
    try {
      await api.addSlot(spaceId, slotForm, token);
      const data = await api.getSpace(spaceId);
      setSlotsBySpace((prev) => ({ ...prev, [spaceId]: data.slots }));
      setSlotForm(emptySlotForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (!confirm("Remove this listing? This cannot be undone.")) return;
    try {
      await api.deleteSpace(spaceId, token);
      loadSpaces();
    } catch (err) {
      setError(err.message);
    }
  };

  const spaceTitleFor = (spaceId) => spaces.find((s) => s.id === spaceId)?.title;

  return (
    <div className="page">
      <div className="shell">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <span className="eyebrow">Owner dashboard</span>
            <h1 style={{ margin: "8px 0" }}>Manage your listings</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className={`btn btn-sm ${tab === "spaces" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("spaces")}>
              Spaces
            </button>
            <button className={`btn btn-sm ${tab === "bookings" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("bookings")}>
              Bookings
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {tab === "spaces" && (
          <>
            <button className="btn btn-outline" style={{ marginBottom: 20 }} onClick={() => setShowSpaceForm((v) => !v)}>
              {showSpaceForm ? "Cancel" : "+ List a new space"}
            </button>

            {showSpaceForm && (
              <form onSubmit={handleCreateSpace} className="form-card" style={{ maxWidth: 560, marginBottom: 32 }}>
                <h3 style={{ marginBottom: 18 }}>New listing</h3>
                <div className="field">
                  <label>Title</label>
                  <input
                    required
                    value={spaceForm.title}
                    onChange={(e) => setSpaceForm({ ...spaceForm, title: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Address</label>
                  <input
                    required
                    value={spaceForm.address}
                    onChange={(e) => setSpaceForm({ ...spaceForm, address: e.target.value })}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>City</label>
                    <input
                      required
                      value={spaceForm.city}
                      onChange={(e) => setSpaceForm({ ...spaceForm, city: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Total slots</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={spaceForm.totalSlots}
                      onChange={(e) => setSpaceForm({ ...spaceForm, totalSlots: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Price per hour (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={spaceForm.pricePerHour}
                    onChange={(e) => setSpaceForm({ ...spaceForm, pricePerHour: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Description (optional)</label>
                  <textarea
                    rows={3}
                    value={spaceForm.description}
                    onChange={(e) => setSpaceForm({ ...spaceForm, description: e.target.value })}
                  />
                </div>
                <button className="btn btn-primary btn-block" disabled={creating}>
                  {creating ? "Publishing…" : "Publish listing"}
                </button>
              </form>
            )}

            {spacesLoading ? (
              <div className="center-loading"><div className="spinner" /></div>
            ) : spaces.length === 0 ? (
              <div className="empty-state">
                <h3>No listings yet</h3>
                <p>Publish your first parking space to start accepting bookings.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {spaces.map((space) => (
                  <div key={space.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h3 style={{ marginBottom: 4 }}>{space.title}</h3>
                        <p style={{ fontSize: "0.85rem" }}>{space.address}, {space.city}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="mono" style={{ color: "var(--signal-amber)", fontWeight: 600 }}>
                          ₹{space.pricePerHour}/hr
                        </span>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleExpand(space.id)}>
                          {expandedSpaceId === space.id ? "Hide slots" : "Manage availability"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSpace(space.id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {expandedSpaceId === space.id && (
                      <div style={{ marginTop: 18 }}>
                        <div className="lane-divider" />
                        <form
                          onSubmit={(e) => handleAddSlot(e, space.id)}
                          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 18 }}
                        >
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label>Date</label>
                            <input
                              type="date"
                              required
                              value={slotForm.date}
                              onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                            />
                          </div>
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label>Start</label>
                            <input
                              type="time"
                              required
                              value={slotForm.startTime}
                              onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                            />
                          </div>
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label>End</label>
                            <input
                              type="time"
                              required
                              value={slotForm.endTime}
                              onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                            />
                          </div>
                          <button className="btn btn-primary btn-sm" disabled={addingSlot} style={{ alignSelf: "end" }}>
                            {addingSlot ? "Adding…" : "Add slot"}
                          </button>
                        </form>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {(slotsBySpace[space.id] || []).map((slot) => (
                            <span key={slot.id} className={`badge ${slot.isAvailable ? "badge-available" : "badge-full"}`}>
                              {slot.date} · {slot.startTime}–{slot.endTime}
                            </span>
                          ))}
                          {(slotsBySpace[space.id] || []).length === 0 && (
                            <p style={{ fontSize: "0.85rem" }}>No slots added yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "bookings" && (
          <>
            {bookingsLoading ? (
              <div className="center-loading"><div className="spinner" /></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <h3>No bookings yet</h3>
                <p>Bookings made on any of your listings will show up here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {bookings.map((booking) => (
                  <TicketStub key={booking.id} booking={booking} spaceTitle={spaceTitleFor(booking.parkingSpaceId)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
