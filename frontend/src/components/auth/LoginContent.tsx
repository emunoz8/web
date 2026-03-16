import type { FormEventHandler, RefObject } from "react";
import GoogleSignInSection from "./GoogleSignInSection";
import PasswordLoginForm from "./PasswordLoginForm";

type LoginContentProps = {
  isModal: boolean;
  googleSignInEnabled: boolean;
  enablePasswordLogin: boolean;
  googleRestrictionText: string | null;
  googleConfigLoading: boolean;
  googleClientId: string;
  googleReady: boolean;
  googleLoading: boolean;
  googleButtonContainerRef: RefObject<HTMLDivElement | null>;
  googleButtonRef: RefObject<HTMLDivElement | null>;
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

function LoginContent({
  isModal,
  googleSignInEnabled,
  enablePasswordLogin,
  googleRestrictionText,
  googleConfigLoading,
  googleClientId,
  googleReady,
  googleLoading,
  googleButtonContainerRef,
  googleButtonRef,
  username,
  password,
  loading,
  error,
  onSubmit,
  onUsernameChange,
  onPasswordChange,
}: LoginContentProps) {
  const cardClassName = isModal
    ? "login-content-card login-content-card-modal"
    : "login-content-card login-content-card-page";
  const contentClassName = isModal ? "login-content-inner login-content-inner-modal" : "login-content-inner";

  return (
    <section className={cardClassName}>
      <div className={contentClassName}>
        <div className="login-content-intro">
          <h1 className="login-content-title">Login</h1>
          <p className="login-content-copy">
            {googleSignInEnabled && !enablePasswordLogin
              ? "Use Google to sign in and unlock publishing tools."
              : "Sign in to continue."}
          </p>
          {googleRestrictionText && <p className="login-content-note">{googleRestrictionText}</p>}
        </div>

        {googleSignInEnabled && (
          <GoogleSignInSection
            googleConfigLoading={googleConfigLoading}
            enablePasswordLogin={enablePasswordLogin}
            googleClientId={googleClientId}
            googleReady={googleReady}
            googleLoading={googleLoading}
            googleButtonContainerRef={googleButtonContainerRef}
            googleButtonRef={googleButtonRef}
          />
        )}

        {enablePasswordLogin && (
          <PasswordLoginForm
            username={username}
            password={password}
            loading={loading}
            onSubmit={onSubmit}
            onUsernameChange={onUsernameChange}
            onPasswordChange={onPasswordChange}
          />
        )}

        {error && (
          <div className="login-error-panel">
            <p className="login-error-text">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LoginContent;
