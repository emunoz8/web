import { BrowserRouter as Router } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { AuthProvider } from "./AuthContext";

const Theme: React.FC = () => {
  return (
    <div className="code-theme">
      <div className="body-main">
        <Router>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </Router>
      </div>
    </div>
  );
};

export default Theme;
