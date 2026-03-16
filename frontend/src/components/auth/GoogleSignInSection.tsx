import type { RefObject } from "react";

type GoogleSignInSectionProps = {
  googleConfigLoading: boolean;
  enablePasswordLogin: boolean;
  googleClientId: string;
  googleReady: boolean;
  googleLoading: boolean;
  googleButtonContainerRef: RefObject<HTMLDivElement | null>;
  googleButtonRef: RefObject<HTMLDivElement | null>;
};

function GoogleSignInSection({
  googleConfigLoading,
  enablePasswordLogin,
  googleClientId,
  googleReady,
  googleLoading,
  googleButtonContainerRef,
  googleButtonRef,
}: GoogleSignInSectionProps) {
  if (googleConfigLoading && !enablePasswordLogin) {
    return (
      <div className="login-section-panel">
        <p className="login-status-message">Loading Google sign-in configuration...</p>
      </div>
    );
  }

  if (googleConfigLoading) {
    return null;
  }

  return (
    <div className="login-section-panel">
      <h2 className="login-section-heading">Sign In With Google</h2>
      {googleClientId ? (
        <div ref={googleButtonContainerRef} className="login-google-button-container">
          <div ref={googleButtonRef} className="login-google-button-slot" />
        </div>
      ) : (
        <p className="login-inline-error-text">Google sign-in is enabled, but no web client ID is configured.</p>
      )}
      {!googleReady && googleClientId && <p className="login-status-message">Loading Google sign-in...</p>}
      {googleLoading && <p className="login-status-message">Signing in with Google...</p>}
    </div>
  );
}

export default GoogleSignInSection;
