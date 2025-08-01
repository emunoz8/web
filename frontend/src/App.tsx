import React from "react";
import { BrowserRouter as Router} from "react-router-dom";
import Navbar from "./components/NavBarComp/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="code-theme">
    <Router>
      <Navbar />
      <AppRoutes />
    </Router>
    </div>
  );
}

export default App;
