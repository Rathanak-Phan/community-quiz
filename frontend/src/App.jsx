import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./page/auth/Login";
import Home from "./page/Home";
import Dashboard from "./page/dashboard/Dashboard";
import Categories from "./page/dashboard/Categories";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CategoryList from "./page/admin/categories/CategoryList";
import MainLayout from "./layouts/MainLayout";
import Sidebar from "./layouts/SideBar";

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
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
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
