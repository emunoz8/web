// src/pages/Login.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login
    localStorage.setItem("token", "fake-jwt-token");
    navigate("/projects");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <p className="text-gray-600 mb-6 text-center max-w-sm">
        Please log in to access your projects and contact page.
      </p>
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Simulate Login
      </button>
    </div>
  );
};

export default Login;
