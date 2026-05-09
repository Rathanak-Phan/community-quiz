import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import googleLogo from "../../assets/images/google_logo.png";
import githubLogo from "../../assets/images/github_logo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/login`,
        { email, password },
      );

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        {/* Logo Badge */}
        <div className="flex justify-center mb-5">
          <div className="bg-blue-100 p-3 rounded-xl">
            <span className="text-xl text-blue-600">🎓</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-gray-900">
          Quiz Community
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Manage and share knowledge with your community
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <span className="text-sm text-blue-600 cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember */}
          <div className="flex items-center mb-5">
            <input type="checkbox" className="accent-purple-600 mr-2" />
            <span className="text-sm text-gray-600">
              Remember me for 30 days
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="px-3 text-xs text-gray-400 uppercase">
            Or continue with
          </span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
            <img src={googleLogo} alt="Google" className="w-4 h-4" />
            Google
          </button>

          <button className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
            <img src={githubLogo} alt="GitHub" className="w-4 h-4" />
            GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Register now
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
