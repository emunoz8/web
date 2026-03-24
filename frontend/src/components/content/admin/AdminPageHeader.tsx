import React from "react";
import { Link } from "react-router-dom";

export type AdminPageHeaderProps = {
  title: string;
  subtitle: string;
  userViewPath: string;
};

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, userViewPath }) => {
  return (
    <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 border-b border-brand-line pb-5">
      <div className="space-y-2">
        <h1 className="portfolio-display-subtitle">{title}</h1>
        <p className="portfolio-copy max-w-2xl">{subtitle}</p>
      </div>
      <Link className="portfolio-button-secondary" to={userViewPath}>
        Open User View
      </Link>
    </div>
  );
};

export default AdminPageHeader;
