import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./page/auth/Login";
import Register from "./page/auth/Register";
import SocialLogin from "./page/auth/SocialLogin";
import Home from "./page/Home";
import Dashboard from "./page/dashboard/Dashboard";
import Categories from "./page/category/Categories";
import Communities from "./page/community/Communities";
import Leaderboard from "./page/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CategoryList from "./page/category/CategoryList";
import Quizzes from "./page/quiz/Quizzes";
import MainLayout from "./components/layouts/MainLayout";
import Sidebar from "./components/layouts/SideBar";
import CommunityDetail from "./page/community/CommunityDetail";
import CommunityRequests from "./page/community/CommunityRequests";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>               
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/social-login" element={<SocialLogin />} />
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
            <Route
              path="/communities"
              element={
                <ProtectedRoute>
                  <Communities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/communities/:id"
              element={
                <ProtectedRoute>
                  <CommunityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/communities/:id/requests"
              element={
                <ProtectedRoute>
                  <CommunityRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
