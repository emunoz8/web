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
      {entries.map((entry) => {
        const leadingSpaces = entry.type === "command" ? 0 : entry.text.match(/^ +/)?.[0].length ?? 0;
        const text = leadingSpaces > 0 ? entry.text.slice(leadingSpaces) : entry.text;

        return (
          <div key={entry.id} className={`terminal-log-entry terminal-log-entry-${entry.type}`}>
            {entry.type === "command" ? (
              <>
                <span className="terminal-log-entry-prompt">{entry.prompt ?? fallbackPrompt}</span>
                <span className="terminal-log-entry-command-text">{entry.text}</span>
              </>
            ) : (
              <span
                className="terminal-log-entry-text"
                style={leadingSpaces > 0 ? { paddingInlineStart: `${leadingSpaces}ch` } : undefined}
              >
                {text || "\u00a0"}
              </span>
            )}
          </div>
        );
      })}
      <div ref={logEndRef} />
    </section>
  );
}

export default TerminalLog;
