const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Thin wrapper around fetch that:
 * - Prefixes the backend API URL
 * - Attaches the JWT (if present) as a Bearer token
 * - Parses JSON and throws a normalized Error with the backend's
 *   message so callers can just do try/catch and show err.message
 */
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. empty 204)
  }

  if (!res.ok) {
    const message =
      data?.message ||
      data?.errors?.[0]?.msg ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  // Parking spaces
  searchSpaces: (query) => request(`/parking-spaces/search?${query}`),
  getSpace: (id) => request(`/parking-spaces/${id}`),
  getMySpaces: (token) => request("/parking-spaces/owner/me", { token }),
  createSpace: (payload, token) =>
    request("/parking-spaces", { method: "POST", body: payload, token }),
  updateSpace: (id, payload, token) =>
    request(`/parking-spaces/${id}`, { method: "PUT", body: payload, token }),
  deleteSpace: (id, token) =>
    request(`/parking-spaces/${id}`, { method: "DELETE", token }),
  addSlot: (id, payload, token) =>
    request(`/parking-spaces/${id}/slots`, { method: "POST", body: payload, token }),

  // Bookings
  createBooking: (payload, token) =>
    request("/bookings", { method: "POST", body: payload, token }),
  getMyBookings: (token) => request("/bookings/me", { token }),
  getOwnerBookings: (token) => request("/bookings/owner/me", { token }),
  cancelBooking: (id, token) =>
    request(`/bookings/${id}/cancel`, { method: "PUT", token }),

  // Payments
  pay: (payload, token) => request("/payments", { method: "POST", body: payload, token }),
};
