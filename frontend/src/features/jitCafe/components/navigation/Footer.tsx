import { getJitCafeAssetPath } from "../../lib/paths";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-stripe" />
      <div className="site-footer-shell">
        <div className="site-footer-brand">
          <img
            src={getJitCafeAssetPath("logo-mark.png")}
            alt="JIT Cafe logo"
            className="site-footer-logo"
            width="936"
            height="945"
          />
          <div>
            <p className="site-footer-title">Just In Time Cafe</p>
            <p className="site-footer-label">
              Restaurant website
            </p>
          </div>
        </div>
        <div className="site-footer-copy-shell">
          <p className="site-footer-copy">
            Site by Edwin Munoz.{" "}
            <a
              href="https://compilingjava.com"
              target="_blank"
              rel="noreferrer"
              className="site-footer-link"
            >
              compilingjava.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
