import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("https://projectcoursebuilder-1.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        return;
      }
      
      // Save user to localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      
      // Optionally fetch profile info or other user-specific data
      const profileRes = await fetch("https://projectcoursebuilder-1.onrender.com/api/profile", {
        headers: { "x-user-email": data.user.email },
      });
      const profileData = await profileRes.json();
      console.log("Profile info:", profileData.user);
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Log In (for demo reasons: Try a@a.com and a)
          Backend Server may take up to 50 seconds to start
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
