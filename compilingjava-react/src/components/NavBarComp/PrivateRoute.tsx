// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Check for the presence of a token
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token; // You can also decode and check expiration
};

const PrivateRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
