import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SocialLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            // Save token to localStorage
            localStorage.setItem("token", token);
            
            // Redirect to homepage
            navigate("/");
        } else {
            // If no token, redirect to login with error
            navigate("/login?error=social_auth_failed");
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Completing social login...
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Please wait while we redirect you.
                </p>
            </div>
        </div>
    );
};

export default SocialLogin;
