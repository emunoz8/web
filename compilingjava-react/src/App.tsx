import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  return (
<Router>
  <div className="navbar-container">
    <Navbar />
  </div>
</Router>

  );
};

export default App;
