// src/pages/Login.tsx
import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginContent from "../components/auth/LoginContent";
import LoginFrame from "../components/auth/LoginFrame";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";
import { LoginRouteState } from "../lib/authRouting";
import { googleClientIdEnv } from "../lib/env";

const GOOGLE_GSI_SCRIPT_ID = "google-gsi-script";
const DEFAULT_POST_LOGIN_PATH = "/";

type GoogleAuthConfig = {
  enabled: boolean;
  clientId: string | null;
  allowedDomain: string | null;
  requireGmail: boolean;
};

const Login: React.FC = () => {
  const { authLoading, isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const envGoogleClientId = googleClientIdEnv;

  const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfig | null>(null);
  const [googleConfigLoading, setGoogleConfigLoading] = useState(true);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId = (googleConfig?.clientId ?? envGoogleClientId).trim();
  const googleSignInEnabled = googleConfig?.enabled ?? !!googleClientId;
  const enablePasswordLogin = true;
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
    const container = googleButtonContainerRef.current;
    if (!container) {
      setGoogleButtonWidth(0);
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(container.getBoundingClientRect().width);
      if (nextWidth <= 0) {
        return;
      }

      setGoogleButtonWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        updateWidth();
      });
      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [googleClientId, googleConfigLoading, googleSignInEnabled, isModal]);

  useEffect(() => {
    setGoogleReady(false);

    if (googleConfigLoading || !googleSignInEnabled || !googleClientId || googleButtonWidth <= 0) {
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

  if (authLoading) {
    return (
      <LoginFrame isModal={isModal} onClose={closeModal}>
        <div className="p-6 text-sm opacity-80">Loading session...</div>
      </LoginFrame>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <LoginFrame isModal={isModal} onClose={closeModal}>
      <LoginContent
        isModal={isModal}
        googleSignInEnabled={googleSignInEnabled}
        enablePasswordLogin={enablePasswordLogin}
        googleRestrictionText={googleRestrictionText}
        googleConfigLoading={googleConfigLoading}
        googleClientId={googleClientId}
        googleReady={googleReady}
        googleLoading={googleLoading}
        googleButtonContainerRef={googleButtonContainerRef}
        googleButtonRef={googleButtonRef}
        username={username}
        password={password}
        loading={loading}
        error={error}
        onSubmit={submit}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
      />
    </LoginFrame>
  );
};

export default Login;
