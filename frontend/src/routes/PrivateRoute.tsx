// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Check for the presence of a token
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token; // You can also decode and check expiration
};

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoute;
