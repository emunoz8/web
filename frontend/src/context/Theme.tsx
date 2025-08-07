import { BrowserRouter as Router } from "react-router-dom";
import Layout from "../components/layout/Layout";

const Theme: React.FC = () => {
  return (
      <div className="layout-root">
        <div className="content-wrapper">
          <Router>
            <Layout/>
          </Router>
        </div>
      </div>
  );
};

export default Theme;
