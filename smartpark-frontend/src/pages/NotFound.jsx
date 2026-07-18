import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <div className="shell empty-state">
        <h3>404 — Wrong turn</h3>
        <p>That route doesn't exist. Head back and try again.</p>
        <div style={{ marginTop: 18 }}>
          <Link to="/" className="btn btn-primary">Back to search</Link>
        </div>
      </div>
    </div>
  );
}
