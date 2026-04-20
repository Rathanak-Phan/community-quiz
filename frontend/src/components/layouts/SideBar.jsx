import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, Grid2X2, Users, BookOpen,
  BarChart2, Heart, User
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/categories", label: "Categories", icon: Grid2X2 },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/quizzes", label: "Quizzes", icon: BookOpen },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{
        width: 220, minHeight: "100vh", borderRight: "1px solid #e5e7eb",
        padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "0 8px" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "#1a6ef5",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Quiz Community</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Academic Excellence</div>
          </div>
        </div>

        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, textDecoration: "none",
            background: isActive ? "#e8f0fe" : "transparent",
            color: isActive ? "#1a6ef5" : "#6b7280",
            fontWeight: isActive ? 500 : 400, fontSize: 13,
          })}>
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? "#1a6ef5" : "#6b7280"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </aside>

      <main>
          <Outlet />
      </main>
    </div>
  );
}