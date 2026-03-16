import { useSiteUiMode } from "../../context/SiteUiModeContext";

type UiModeToggleProps = {
  appearance?: "terminal" | "standard";
};

function UiModeToggle({ appearance = "standard" }: UiModeToggleProps) {
  const { mode, terminalAvailable, toggleMode } = useSiteUiMode();

  if (!terminalAvailable) {
    return null;
  }

  const nextMode = mode === "terminal" ? "standard" : "terminal";
  const label = nextMode === "standard" ? "Standard UI" : "Terminal UI";

  const className =
    appearance === "terminal"
      ? "terminal-shell-toggle"
      : "inline-flex shrink-0 items-center rounded-full border border-brand-line/24 bg-brand-surface/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted transition hover:border-brand-frame/34 hover:bg-brand-panel/56 hover:text-brand-contrast";

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={className}
      aria-label={`Switch to ${label}`}
      title={`Switch to ${label}`}
    >
      {label}
    </button>
  );
}

export default UiModeToggle;
