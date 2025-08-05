import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";
import './styles/index.css';
import { ThemeProvider } from "./context/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <div className="code-theme">
        <div className="body-main">
          <Router>
            <Navbar />
            <AppRoutes />
          </Router>
        </div>
      </div>
    </ThemeProvider>
  
  );
}

export default App;
