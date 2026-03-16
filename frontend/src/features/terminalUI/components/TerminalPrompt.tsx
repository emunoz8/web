import { ChangeEvent, FormEvent, KeyboardEvent, MutableRefObject } from "react";

type TerminalPromptProps = {
  commandInput: string;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  prompt: string;
  stacked?: boolean;
};

function TerminalPrompt({
  commandInput,
  inputRef,
  onChange,
  onKeyDown,
  onSubmit,
  prompt,
  stacked = false,
}: TerminalPromptProps) {
  const className = stacked
    ? "terminal-shell-prompt terminal-shell-prompt-stacked"
    : "terminal-shell-prompt";

  return (
    <form onSubmit={onSubmit} className={className}>
      <label htmlFor="terminal-shell-input" className="sr-only">
        Terminal command input
      </label>
      <span className="terminal-shell-prompt-label">{prompt}</span>
      <input
        ref={inputRef}
        id="terminal-shell-input"
        type="text"
        value={commandInput}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="brand-terminal-input"
        autoComplete="off"
        spellCheck={false}
      />
    </form>
  );
}

export default TerminalPrompt;
