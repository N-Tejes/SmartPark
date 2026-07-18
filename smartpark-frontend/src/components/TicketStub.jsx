const STATUS_LABEL = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLOR = {
  pending: "var(--signal-amber)",
  confirmed: "var(--lane-green)",
  completed: "var(--concrete-300)",
  cancelled: "var(--brake-red)",
};

/**
 * Signature element: renders a booking as a perforated parking-ticket
 * stub - a main panel with the reservation details, torn away from a
 * stub panel carrying the price and status. `children` renders any
 * action buttons (Pay / Cancel) inside the stub panel.
 */
export default function TicketStub({ booking, spaceTitle, children }) {
  const shortId = booking.id.slice(0, 8).toUpperCase();

  return (
    <div className="ticket">
      <div className="ticket-main">
        <span className="ticket-number">Ticket #{shortId}</span>
        <span className="ticket-title">{spaceTitle || "Parking reservation"}</span>
        <div className="ticket-meta">
          <span>
            Date
            <b>{booking.date}</b>
          </span>
          <span>
            Window
            <b>{booking.startTime} – {booking.endTime}</b>
          </span>
        </div>
      </div>

      <div className="ticket-stub">
        <span className="ticket-amount">₹{booking.totalAmount}</span>
        <span className="ticket-status" style={{ color: STATUS_COLOR[booking.status] }}>
          {STATUS_LABEL[booking.status] || booking.status}
        </span>
        {children}
      </div>
    </div>
  );
}
