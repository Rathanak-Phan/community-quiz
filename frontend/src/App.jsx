import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./page/auth/Login";
import Home from "./page/Home";
import Dashboard from "./page/dashboard/Dashboard";
import Categories from "./page/category/Categories";
import Communities from "./page/community/Communities";
import Leaderboard from "./page/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CategoryList from "./page/category/CategoryList";
import MainLayout from "./components/layouts/MainLayout";
import Sidebar from "./components/layouts/SideBar";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>               
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<Sidebar />}>
          <Route
            path="/dashboard"
            element={
                <Dashboard />
            }
          />
          <Route
            path="/categories"
            element={
                <Categories />
            }
          />
          <Route
            path="/communities"
            element={
                <Communities />
            }
          />
          <Route
            path="/leaderboard"
            element={
                <Leaderboard />
            }
          />
        </Route>

        <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <CategoryList />
              </AdminRoute>
            }
          />
      </Routes>
    </Router>
  );
}

export default App;
