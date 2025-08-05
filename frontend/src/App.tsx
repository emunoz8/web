import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/NavBarComp/Navbar";
import AppRoutes from "./routes/AppRoutes";
import './styles/index.css';

function App() {
  return (
    <div className="code-theme" >
      <div className="body-main">
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
       </div>
    </div>
  );
}

export default App;
