import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: "56px",
        borderBottom: "1px solid #e5e7eb", background: "#fff"
      }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>Quiz Community</span>

        <div style={{ display: "flex", gap: 32 }}>
          <Link to="/" style={{ fontSize: 14, color: "#111", textDecoration: "none" }}>Home</Link>
          <Link to="/leaderboard" style={{ fontSize: 14, color: "#6b7280", textDecoration: "none" }}>Leaderboard</Link>
          <Link to="/communities" style={{ fontSize: 14, color: "#6b7280", textDecoration: "none" }}>Communities</Link>
          <Link to="/dashboard" style={{ fontSize: 14, color: "#6b7280", textDecoration: "none" }}>Dashboard</Link>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/login">
            <button style={{
              padding: "6px 16px", fontSize: 14, borderRadius: 8,
              border: "1px solid #d1d5db", background: "transparent", cursor: "pointer"
            }}>Login</button>
          </Link>
          <Link to="/register">
            <button style={{
              padding: "6px 16px", fontSize: 14, borderRadius: 8,
              border: "none", background: "#1a6ef5", color: "#fff", cursor: "pointer"
            }}>Register</button>
          </Link>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}