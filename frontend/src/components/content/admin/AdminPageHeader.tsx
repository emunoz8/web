import React from "react";
import { Link } from "react-router-dom";

type AdminPageHeaderProps = {
  title: string;
  subtitle: string;
  userViewPath: string;
};

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, userViewPath }) => {
  return (
    <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        <p className="text-sm opacity-80 max-w-2xl">{subtitle}</p>
      </div>
      <Link className="btn" to={userViewPath}>
        Open User View
      </Link>
    </div>
  );
};

export default AdminPageHeader;
