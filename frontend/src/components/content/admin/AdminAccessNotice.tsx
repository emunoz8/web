import React from "react";
import { Link, useLocation } from "react-router-dom";
import { buildLoginRouteState } from "../../../lib/authRouting";

type AdminAccessNoticeProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AdminAccessNotice: React.FC<AdminAccessNoticeProps> = ({ isAuthenticated, isAdmin }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <p className="portfolio-copy">
        <Link className="portfolio-inline-link" to="/login" state={buildLoginRouteState(location)}>
          Login
        </Link>{" "}
        to access admin publishing tools.
      </p>
    );
  }

  if (!isAdmin) {
    return <p className="portfolio-copy">You are logged in, but your account does not have admin publish access.</p>;
  }

  return null;
};

export default AdminAccessNotice;
