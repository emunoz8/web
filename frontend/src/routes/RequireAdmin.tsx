import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RequireAdminProps = {
  children: React.ReactNode;
};

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { authLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
