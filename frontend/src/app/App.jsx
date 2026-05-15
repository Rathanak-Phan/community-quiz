import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";
import SocialLogin from "../features/auth/SocialLogin";
import Home from "../features/home/Home";
import Dashboard from "../features/dashboard/Dashboard";
import CategoryList from "../features/categories/CategoryList";
import Communities from "../features/communities/Communities";
import Leaderboard from "../features/leaderboard/Leaderboard";
import ProtectedRoute from "../components/common/ProtectedRoute";
import ManualReviewList from "../features/dashboard/ManualReviewList";
import ManualReviewDetail from "../features/dashboard/ManualReviewDetail";
import Quizzes from "../features/quizzes/Quizzes";
import QuizDetail from "../features/quizzes/QuizDetail";
import QuizAttempt from "../features/quizzes/QuizAttempt";
import QuizReview from "../features/quizzes/QuizReview";
import QuestionList from "../features/quizzes/QuestionList";
import QuizCreate from "../features/quizzes/QuizCreate";
import MyQuizzes from "../features/quizzes/MyQuizzes";
import MyActivity from "../features/quizzes/MyActivity";
import QuizAttempts from "../features/quizzes/QuizAttempts";
import SharedResult from "../features/quizzes/SharedResult";
import MainLayout from "../components/layouts/MainLayout";
import Sidebar from "../components/layouts/SideBar";
import CommunityDetail from "../features/communities/CommunityDetail";
import CommunityRequests from "../features/communities/CommunityRequests";
import JoinByLink from "../features/communities/JoinByLink";
import UserManagement from "../features/admin/UserManagement";
import AdminQuizzesPage from "../features/admin/AdminQuizzesPage";
import AdminCommunitiesPage from "../features/admin/AdminCommunitiesPage";
import MakerRequestsPage from "../features/admin/MakerRequestsPage";
import FavoritesPage from "../features/favorites/FavoritesPage";
import BecomeCreatorPage from "../features/profile/BecomeCreatorPage";
import ProfilePage from "../features/profile/ProfilePage";
import MyCommunities from "../features/communities/MyCommunities";
import SettingsPage from "../page/admin/SettingsPage";
import HelpCenter from "../page/HelpCenter";
import PublicProfile from "../features/profile/PublicProfile";

import { AuthProvider } from "../providers/AuthContext";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/social-login" element={<SocialLogin />} />

          {/* GLOBAL PAGES - Always uses MainLayout (Header/Footer) */}
          <Route element={<MainLayout />}>               
            <Route path="/" element={<Home />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/join" element={<JoinByLink />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quizzes/:quizId" element={<QuizDetail />} />
            <Route path="/quiz/:quizId" element={<QuizDetail />} /> {/* Alias for share links */}
            <Route path="/result/:submissionId" element={<SharedResult />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
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
              path="/admin/settings"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <SettingsPage />
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
              path="/quizzes/create"
              element={
                <ProtectedRoute roles={["quiz_maker", "admin"]}>
                  <QuizCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/my"
              element={
                <ProtectedRoute roles={["quiz_maker", "admin"]}>
                  <MyQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/my-activity"
              element={
                <ProtectedRoute roles={["user", "quiz_maker", "admin"]}>
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
              path="/quizzes/:quizId/attempts"
              element={
                <ProtectedRoute roles={["quiz_maker", "admin"]}>
                  <QuizAttempts />
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
              path="/become-creator"
              element={
                <ProtectedRoute roles={["user"]}>
                  <BecomeCreatorPage />
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
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpCenter />
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
