import type { ReactNode } from "react";

type LoginFrameProps = {
  isModal: boolean;
  onClose: () => void;
  children: ReactNode;
};

function LoginFrame({ isModal, onClose, children }: LoginFrameProps) {
  if (!isModal) {
    return <>{children}</>;
  }

  return (
    <div
      className="login-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="login-modal-shell" onClick={(event) => event.stopPropagation()}>
        <button
          className="login-modal-close-button"
          type="button"
          onClick={onClose}
          aria-label="Close login"
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}

export default LoginFrame;
