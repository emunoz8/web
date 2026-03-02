import React from "react";
import { Link } from "react-router-dom";

type ContentBrowserHeaderProps = {
  title: string;
  subtitle: string;
  isAdmin: boolean;
  adminPath?: string;
};

const ContentBrowserHeader: React.FC<ContentBrowserHeaderProps> = ({ title, subtitle, isAdmin, adminPath }) => {
  return (
    <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        <p className="text-sm opacity-80 max-w-2xl">{subtitle}</p>
      </div>
      {isAdmin && adminPath && (
        <Link className="btn" to={adminPath}>
          Open Admin View
        </Link>
      )}
    </div>
  );
};

export default ContentBrowserHeader;
