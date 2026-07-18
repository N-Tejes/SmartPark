import { useState } from "react";
import { api } from "../api/client";
import ParkingSpaceCard from "../components/ParkingSpaceCard";

export default function Home() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (date) params.set("date", date);
      const data = await api.searchSpaces(params.toString());
      setResults(data.parkingSpaces);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div style={{ maxWidth: 640, marginBottom: 40 }}>
          <span className="eyebrow">Real-time availability</span>
          <h1 style={{ margin: "10px 0 14px" }}>Pull in. Reserve the spot before you get there.</h1>
          <p>
            Search parking spaces listed by owners near you, lock in a time window,
            and pay ahead — so the spot's yours the moment you arrive.
          </p>
        </div>

        <form onSubmit={handleSearch} className="card" style={{ marginBottom: 36 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr auto", gap: 14, alignItems: "end" }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="center-loading">
            <div className="spinner" />
          </div>
        )}

        {!loading && searched && results?.length === 0 && (
          <div className="empty-state">
            <h3>No spaces match that search</h3>
            <p>Try a different city, or clear the date to see everything currently listed.</p>
          </div>
        )}

        {!loading && results?.length > 0 && (
          <>
            <h2 style={{ marginBottom: 18 }}>{results.length} space{results.length !== 1 ? "s" : ""} found</h2>
            <div className="grid">
              {results.map((space) => (
                <ParkingSpaceCard key={space.id} space={space} />
              ))}
            </div>
          </>
        )}

        {!loading && !searched && (
          <div className="empty-state">
            <h3>Search to see live listings</h3>
            <p>Enter a city above — try leaving the date blank to browse everything available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
