// src/pages/Login.tsx
import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";
import { LoginRouteState } from "../lib/authRouting";

const GOOGLE_GSI_SCRIPT_ID = "google-gsi-script";
const DEFAULT_POST_LOGIN_PATH = "/blog";

type GoogleAuthConfig = {
  enabled: boolean;
  clientId: string | null;
  allowedDomain: string | null;
  requireGmail: boolean;
};

const Login: React.FC = () => {
  const { isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const envGoogleClientId = (process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "").trim();
  const forcePasswordLogin = (process.env.REACT_APP_ENABLE_PASSWORD_LOGIN ?? "false").trim().toLowerCase() === "true";

  const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfig | null>(null);
  const [googleConfigLoading, setGoogleConfigLoading] = useState(true);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId = (googleConfig?.clientId ?? envGoogleClientId).trim();
  const googleSignInEnabled = googleConfig?.enabled ?? !!googleClientId;
  const enablePasswordLogin = forcePasswordLogin || !googleSignInEnabled;
  const googleRestrictionText = googleConfig?.requireGmail
    ? "Only @gmail.com accounts can sign in."
    : googleConfig?.allowedDomain
      ? `Only ${googleConfig.allowedDomain} Google accounts can sign in.`
      : null;

  const locationState = location.state as LoginRouteState | null;
  const isModal = !!locationState?.backgroundLocation;
  const redirectPath = (() => {
    const from = locationState?.from;
    if (!from?.pathname || from.pathname === "/login") {
      return DEFAULT_POST_LOGIN_PATH;
    }

    return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
  })();

  const closeModal = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const completeGoogleLogin = useCallback(
    async (idToken: string) => {
      setGoogleLoading(true);
      setError(null);
      try {
        await loginWithGoogle(idToken);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setGoogleLoading(false);
      }
    },
    [loginWithGoogle, navigate, redirectPath]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGoogleConfig() {
      setGoogleConfigLoading(true);
      try {
        const response = await fetch(apiUrl("/api/auth/google/config"));
        if (!response.ok) {
          throw new Error(`Could not load Google sign-in config (${response.status})`);
        }

        const payload = (await response.json()) as GoogleAuthConfig;
        if (!cancelled) {
          setGoogleConfig(payload);
        }
      } catch (err) {
        if (!cancelled) {
          const fallbackConfig = envGoogleClientId
            ? {
                enabled: true,
                clientId: envGoogleClientId,
                allowedDomain: null,
                requireGmail: false,
              }
            : {
                enabled: false,
                clientId: null,
                allowedDomain: null,
                requireGmail: false,
              };
          setGoogleConfig(fallbackConfig);
          if (!envGoogleClientId) {
            setError((err as Error).message);
          }
        }
      } finally {
        if (!cancelled) {
          setGoogleConfigLoading(false);
        }
      }
    }

    void loadGoogleConfig();

    return () => {
      cancelled = true;
    };
  }, [envGoogleClientId]);

  useEffect(() => {
    const updateWidth = () => {
      const viewportWidth = window.innerWidth;
      const modalInset = viewportWidth < 640 ? 64 : 140;
      const pageInset = viewportWidth < 640 ? 40 : 96;
      const maxWidth = isModal ? 392 : 360;
      const availableWidth = viewportWidth - (isModal ? modalInset : pageInset);
      const nextWidth = Math.max(240, Math.min(maxWidth, availableWidth));
      setGoogleButtonWidth(nextWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isModal]);

  useEffect(() => {
    setGoogleReady(false);

    if (googleConfigLoading || !googleSignInEnabled || !googleClientId) {
      return;
    }

    let cancelled = false;

    const initializeGoogleButton = () => {
      if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        ux_mode: "popup",
        callback: (response) => {
          const credential = response.credential;
          if (!credential) {
            setError("Google sign-in did not return a credential.");
            return;
          }
          void completeGoogleLogin(credential);
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: googleButtonWidth,
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    let script = document.getElementById(GOOGLE_GSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = GOOGLE_GSI_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const onLoad = () => initializeGoogleButton();
    const onError = () => setError("Could not load Google sign-in script.");
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
    };
  }, [completeGoogleLogin, googleButtonWidth, googleClientId, googleConfigLoading, googleSignInEnabled]);

  useEffect(() => {
    if (!isModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeModal, isModal]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const cardTone = isModal
    ? "w-full max-w-xl rounded-xl border border-indigo-300 bg-white text-gray-900 shadow-2xl dark:border-emerald-400 dark:bg-gray-900 dark:text-green-300"
    : "mx-auto w-full max-w-xl";
  const panelTone = "rounded-lg border border-gray-200 p-4 space-y-3 dark:border-gray-700";

  const loginBody = (
    <section className={isModal ? `${cardTone}` : `${cardTone} px-3 py-6 sm:px-4 sm:py-8 md:px-8`}>
      <div className={isModal ? "space-y-5 p-5 sm:p-6" : "space-y-5"}>
        <div className="space-y-2 pr-14">
          <h1 className="text-xl font-bold sm:text-2xl">Login</h1>
          <p className="text-sm leading-6 opacity-80">
            {googleSignInEnabled && !enablePasswordLogin
              ? "Use Google to sign in and unlock publishing tools."
              : "Sign in to continue."}
          </p>
          {googleRestrictionText && <p className="text-sm opacity-80">{googleRestrictionText}</p>}
        </div>

        {googleConfigLoading && !enablePasswordLogin && (
          <div className={panelTone}>
            <p className="text-sm opacity-80">Loading Google sign-in configuration...</p>
          </div>
        )}

        {!googleConfigLoading && googleSignInEnabled && (
          <div className={panelTone}>
            <h2 className="font-semibold">Sign In With Google</h2>
            {googleClientId && (
              <div ref={googleButtonRef} className="flex min-h-[44px] justify-start" />
            )}
            {!googleClientId && (
              <p className="text-sm text-red-500">Google sign-in is enabled, but no web client ID is configured.</p>
            )}
            {!googleReady && googleClientId && <p className="text-sm opacity-80">Loading Google sign-in...</p>}
            {googleLoading && <p className="text-sm opacity-80">Signing in with Google...</p>}
          </div>
        )}

        {enablePasswordLogin && (
          <form className={panelTone} onSubmit={submit}>
            <h2 className="font-semibold">Password Login</h2>
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm">
                Username
              </label>
              <input
                id="username"
                className="form-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 p-3 dark:border-red-700">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </section>
  );

  if (!isModal) {
    return loginBody;
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65 p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 min-h-10 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
          type="button"
          onClick={closeModal}
          aria-label="Close login"
        >
          Close
        </button>
        {loginBody}
      </div>
    </div>
  );
};

export default Login;
