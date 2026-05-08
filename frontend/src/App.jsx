import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./page/auth/Login";
import Register from "./page/auth/Register";
import SocialLogin from "./page/auth/SocialLogin";
import Home from "./page/Home";
import Dashboard from "./page/dashboard/Dashboard";
import CategoryList from "./page/category/CategoryList";
import Communities from "./page/community/Communities";
import Leaderboard from "./page/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ManualReviewList from "./page/dashboard/ManualReviewList";
import ManualReviewDetail from "./page/dashboard/ManualReviewDetail";
import Quizzes from "./page/quiz/Quizzes";
import QuizDetail from "./page/quiz/QuizDetail";
import QuizAttempt from "./page/quiz/QuizAttempt";
import QuizReview from "./page/quiz/QuizReview";
import QuestionList from "./page/quiz/QuestionList";
import MyQuizzes from "./page/quiz/MyQuizzes";
import MyActivity from "./page/quiz/MyActivity";
import MainLayout from "./components/layouts/MainLayout";
import Sidebar from "./components/layouts/SideBar";
import CommunityDetail from "./page/community/CommunityDetail";
import CommunityRequests from "./page/community/CommunityRequests";
import UserManagement from "./page/admin/UserManagement";
import AdminQuizzesPage from "./page/admin/AdminQuizzesPage";
import AdminCommunitiesPage from "./page/admin/AdminCommunitiesPage";
import MakerRequestsPage from "./page/admin/MakerRequestsPage";
import FavoritesPage from "./page/FavoritesPage";
import ProfilePage from "./page/ProfilePage";
import MyCommunities from "./page/community/MyCommunities";

import { AuthProvider } from "./context/AuthContext";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/social-login" element={<SocialLogin />} />

          {/* GLOBAL PAGES - Always uses MainLayout (Header/Footer) */}
          <Route element={<MainLayout />}>               
            <Route path="/" element={<Home />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quizzes/:quizId" element={<QuizDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>

          {/* PROTECTED DASHBOARD - Always uses Sidebar */}
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
              path="/admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/moderation/quizzes"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminQuizzesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/moderation/communities"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminCommunitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/maker-requests"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <MakerRequestsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories"
              element={
                <ProtectedRoute roles={["admin", "quiz_maker"]}>
                  <CategoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
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
              path="/communities/my"
              element={
                <ProtectedRoute roles={["quiz_maker", "admin", "user"]}>
                  <MyCommunities />
                </ProtectedRoute>
              }
            />

            {/* Manual Reviews */}
            <Route
              path="/reviews/pending"
              element={
                <ProtectedRoute roles={["quiz_maker", "admin"]}>
                  <ManualReviewList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews/:attemptId"
              element={
                <ProtectedRoute roles={["quiz_maker", "admin"]}>
                  <ManualReviewDetail />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/quizzes/my"
              element={
                <ProtectedRoute roles={["quiz_maker"]}>
                  <MyQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/my-activity"
              element={
                <ProtectedRoute roles={["user"]}>
                  <MyActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/:quizId/questions"
              element={
                <ProtectedRoute>
                  <QuestionList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/attempts/:attemptId"
              element={
                <ProtectedRoute>
                  <QuizAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attempts/:attemptId/review"
              element={
                <ProtectedRoute>
                  <QuizReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Legacy Admin Dashboard Redirect */}
          <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
