import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const SocialLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeSocialLogin, token, loading } = useAuth();

    useEffect(() => {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const newToken = params.get("token");

        if (newToken) {
            completeSocialLogin(newToken);
            // Crucial: Clear the token from the URL to prevent infinite loop
            navigate(location.pathname, { replace: true });
        } else if (!token && !params.get("token")) {
            // Only redirect to login if we really have no token and no attempt in progress
            const timeout = setTimeout(() => {
                if (!token) navigate("/login?error=social_auth_failed");
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [location.search, navigate, completeSocialLogin, token]);

    // Secondary effect to handle redirection once token is set and profile is fully synchronized
    useEffect(() => {
        if (token && !loading) {
            const userDataStr = localStorage.getItem("user");
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const isAdmin = userData.role?.name === "admin" || Number(userData.role_id) === 1;
                const isMaker = userData.role?.name === "quiz_maker" || Number(userData.role_id) === 2;
                
                if (isAdmin) {
                    navigate("/admin/dashboard");
                } else if (isMaker) {
                    navigate("/dashboard");
                } else {
                    navigate("/"); // Regular user goes home
                }
            } else {
                // Fallback if user data isn't there yet (shouldn't happen with loading check)
                navigate("/dashboard");
            }
        }
    }, [token, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="text-center bg-white p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    Authenticating...
                </h2>
                <p className="text-slate-400 font-medium mt-3 text-sm">
                    Please wait while we sync your secure session.
                </p>
            </div>
        </div>
    );
};

export default SocialLogin;
