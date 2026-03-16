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
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <span className="brand-chip">Live Content API</span>
          <span className="brand-chip">Backend Source</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        <p className="text-sm opacity-80 max-w-2xl">{subtitle}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-muted">
          Loaded from the backend content API and opened from database-backed entries.
        </p>
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
