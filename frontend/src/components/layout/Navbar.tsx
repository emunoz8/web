import { useEffect, useMemo, useState } from "react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import NavItem from "../../data/NavItem";
import { publicRoutes } from "../../routes/publicRoutes";
import ThemeToggle from "../common/ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { buildLoginRouteState } from "../../lib/authRouting";

function Navbar() {
  const { isAuthenticated, isAdmin, username, canChangeUsername, updateUsername, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const navRoutes = useMemo(
    () =>
      publicRoutes
        .filter((route) => route.showInNav !== false)
        .filter((route) => !route.requiresAdmin || isAdmin),
    [isAdmin]
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEditingUsername(false);
      setUsernameDraft("");
      setUsernameError(null);
      return;
    }
    setUsernameDraft(username ?? "");
  }, [isAuthenticated, username]);

  const submitUsernameUpdate = async () => {
    try {
      setUsernameSaving(true);
      setUsernameError(null);
      await updateUsername(usernameDraft.trim());
      setEditingUsername(false);
    } catch (err) {
      setUsernameError((err as Error).message);
    } finally {
      setUsernameSaving(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between lg:hidden">
        <span className="text-sm font-semibold tracking-wide opacity-90">Compiling Java</span>
        <button
          className="border rounded-md min-h-11 min-w-11 px-3 py-2"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-panel"
        >
          {mobileMenuOpen ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
        </button>
      </div>

      <nav className="navbar hidden lg:flex">
        {navRoutes.map(({ to, label }) => (
          <NavItem key={to} to={to} label={label} />
        ))}
      </nav>

      {mobileMenuOpen && (
        <nav
          id="mobile-nav-panel"
          className="mobile-nav-panel lg:hidden border rounded-lg p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur"
        >
          <ul className="flex flex-col gap-3">
            {navRoutes.map(({ to, label }) => (
              <li key={to}>
                <NavItem to={to} label={label} onClick={() => setMobileMenuOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="flex flex-col gap-2">
        <ThemeToggle />
        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm opacity-80">
                {username ?? "user"} {isAdmin ? "(ADMIN)" : ""}
              </span>
              {!editingUsername && canChangeUsername ? (
                <button
                  className="border rounded-md min-h-11 px-3 py-2 text-sm"
                  onClick={() => {
                    setEditingUsername(true);
                    setUsernameDraft(username ?? "");
                    setUsernameError(null);
                  }}
                  type="button"
                >
                  Edit Username
                </button>
              ) : editingUsername ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="form-input w-56"
                    value={usernameDraft}
                    onChange={(event) => setUsernameDraft(event.target.value)}
                    placeholder="New username"
                  />
                  <button
                    className="btn"
                    type="button"
                    onClick={() => void submitUsernameUpdate()}
                    disabled={usernameSaving}
                  >
                    {usernameSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="border rounded-md min-h-11 px-3 py-2 text-sm"
                    type="button"
                    onClick={() => {
                      setEditingUsername(false);
                      setUsernameDraft(username ?? "");
                      setUsernameError(null);
                    }}
                    disabled={usernameSaving}
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              state={buildLoginRouteState(location)}
              className="btn"
            >
              Login
            </Link>
          )}
        </div>
        {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
      </div>
    </div>
  );
}

export default Navbar;
