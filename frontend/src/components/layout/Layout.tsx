import React from "react";
import Navbar from "./Navbar";
import AppRoutes from "../../routes/AppRoutes";

const Layout: React.FC = () => {
  return (
    <div>
      <Navbar />
      <AppRoutes />
    </div>
  );
};

export default Layout;
