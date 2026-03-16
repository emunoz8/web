import { MutableRefObject } from "react";
import { type TerminalLogEntry } from "../hooks/useTerminalSession";

type TerminalLogProps = {
  entries: TerminalLogEntry[];
  fallbackPrompt: string;
  logEndRef: MutableRefObject<HTMLDivElement | null>;
};

function TerminalLog({ entries, fallbackPrompt, logEndRef }: TerminalLogProps) {
  return (
    <section className="terminal-shell-log" aria-label="Terminal session log">
      {entries.map((entry) => (
        <div key={entry.id} className={`terminal-log-entry terminal-log-entry-${entry.type}`}>
          {entry.type === "command" ? (
            <>
              <span className="terminal-log-entry-prompt">{entry.prompt ?? fallbackPrompt}</span>
              <span className="terminal-log-entry-command-text">{entry.text}</span>
            </>
          ) : (
            <span>{entry.text}</span>
          )}
        </div>
      ))}
      <div ref={logEndRef} />
    </section>
  );
}

export default TerminalLog;
