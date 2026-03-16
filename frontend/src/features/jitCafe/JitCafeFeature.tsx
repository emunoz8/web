import { Navigate, Route, Routes } from "react-router-dom";
import { JIT_CAFE_BASE_PATH } from "./lib/paths";
import { JitCafeLayout } from "./JitCafeLayout";
import { ContactUsPage } from "./pages/ContactUsPage";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";
import "./styles.css";

function JitCafeFeature() {
  return (
    <div className="jit-cafe-feature-shell">
      <div className="jit-cafe-feature">
        <Routes>
          <Route element={<JitCafeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="contact-us" element={<ContactUsPage />} />
            <Route path="*" element={<Navigate to={JIT_CAFE_BASE_PATH} replace />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default JitCafeFeature;
