import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { portfolioProfile } from "../../features/portfolio/data/profile";
import {
  getTerminalPrompt,
  resolveTerminalCommand,
  terminalFeaturedCommands,
  terminalRouteCommands,
  terminalShellLabel,
  type TerminalTone,
} from "../../features/portfolio/data/terminalShell";

type TerminalFeedback = {
  tone: TerminalTone;
  lines: string[];
};

function getActiveCommand(pathname: string): string {
  const activeRoute = terminalRouteCommands.find((command) =>
    command.to === "/"
      ? pathname === "/"
      : pathname === command.to || pathname.startsWith(`${command.to}/`)
  );

  return activeRoute?.command ?? pathname;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const [commandInput, setCommandInput] = useState("");
  const [feedback, setFeedback] = useState<TerminalFeedback | null>(null);
  const prompt = getTerminalPrompt(location.pathname);

  useEffect(() => {
    setFeedback(null);
  }, [location.pathname]);

  const executeCommand = (rawCommand: string) => {
    const resolution = resolveTerminalCommand(rawCommand, location.pathname);

    if (resolution.kind === "clear") {
      setFeedback(null);
      return;
    }

    setFeedback({
      tone: resolution.tone,
      lines: resolution.lines.slice(0, 3),
    });

    if (resolution.kind === "route") {
      navigate(resolution.to);
      return;
    }

    if (resolution.kind === "external") {
      if (resolution.openInNewTab) {
        window.open(resolution.href, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.assign(resolution.href);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCommand = commandInput.trim();

    if (!trimmedCommand) {
      return;
    }

    setCommandInput("");
    executeCommand(trimmedCommand);
  };

  const feedbackClassName =
    feedback?.tone === "error"
      ? "border-brand-accent/40 text-brand-accent"
      : feedback?.tone === "success"
        ? "border-brand-frame/35 text-brand-contrast"
        : "border-brand-line/20 text-brand-muted";
  const showSessionActions = !authLoading && (isAdmin || isAuthenticated);

  return (
    <header className="sticky top-0 z-40 py-4">
      <div className="brand-terminal-panel">
        <div className="brand-window-header">
          <span className="brand-window-dot brand-window-dot-active" />
          <span className="brand-window-dot" />
          <span className="brand-window-dot" />
          <span className="brand-window-label">{terminalShellLabel}</span>
          <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.22em] text-brand-muted lg:inline">
            route :: {location.pathname}
          </span>
        </div>

        <div className="grid gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.95fr)]">
          <div className="space-y-4">
            <Link
              to="/"
              className="brand-terminal-subpanel block transition hover:border-brand-frame/35"
            >
              <p className="brand-eyebrow">root session</p>
              <p className="mt-3 text-lg font-semibold text-brand-contrast">
                {portfolioProfile.name}
              </p>
              <p className="mt-2 text-sm text-brand-muted">{portfolioProfile.title}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-brand-frame">
                current target :: {getActiveCommand(location.pathname)}
              </p>
            </Link>

            <form onSubmit={handleSubmit} className="brand-terminal-subpanel">
              <label htmlFor="site-command-prompt" className="sr-only">
                Global site command prompt
              </label>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-brand-muted">
                global command prompt
              </p>
              <div className="mt-3 flex items-start gap-3 font-mono text-sm">
                <span className="shrink-0 text-brand-accent">{prompt}</span>
                <input
                  id="site-command-prompt"
                  type="text"
                  value={commandInput}
                  onChange={(event) => setCommandInput(event.target.value)}
                  className="brand-terminal-input"
                  placeholder="help"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </form>

            {feedback ? (
              <div
                className={`rounded-[1.15rem] border px-4 py-3 font-mono text-xs whitespace-pre-wrap ${feedbackClassName}`}
              >
                {feedback.lines.join("\n")}
              </div>
            ) : (
              <p className="px-1 font-mono text-xs text-brand-muted">
                Try `cd projects`, `less resume`, `./jit-cafe`, or `open github`.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <section className="brand-terminal-subpanel">
              <p className="brand-eyebrow">preset commands</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {terminalFeaturedCommands.map((command) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => executeCommand(command)}
                    className="brand-terminal-chip"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </section>

            <section className="brand-terminal-subpanel">
              <p className="brand-eyebrow">{showSessionActions ? "workspace" : "operator context"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!authLoading && isAdmin ? (
                  <Link to="/admin/projects" className="brand-terminal-chip">
                    sudo admin
                  </Link>
                ) : null}
                {!authLoading && isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="brand-terminal-chip"
                  >
                    logout
                  </button>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-brand-line/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-muted">
                  node :: {portfolioProfile.location}
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
