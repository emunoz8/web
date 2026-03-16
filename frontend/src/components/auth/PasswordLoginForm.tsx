import type { FormEventHandler } from "react";

type PasswordLoginFormProps = {
  username: string;
  password: string;
  loading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

function PasswordLoginForm({
  username,
  password,
  loading,
  onSubmit,
  onUsernameChange,
  onPasswordChange,
}: PasswordLoginFormProps) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h2 className="login-section-heading">Password Login</h2>
      <div className="login-form-field">
        <label htmlFor="username" className="login-form-label">
          Username
        </label>
        <input
          id="username"
          className="login-form-input"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          autoComplete="username"
        />
      </div>

      <div className="login-form-field">
        <label htmlFor="password" className="login-form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="login-form-input"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete="current-password"
        />
      </div>

      <button className="login-submit-button" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default PasswordLoginForm;
