import { ReactNode, useState } from "react";
import TerminalHeader from "./TerminalHeader";
import TerminalLog from "./TerminalLog";
import TerminalPrompt from "./TerminalPrompt";
import { useDraggableTerminalWindow } from "../hooks/useDraggableTerminalWindow";
import { useTerminalSession } from "../hooks/useTerminalSession";

type TerminalUIProps = {
  children: ReactNode;
};

function TerminalUI({ children }: TerminalUIProps) {
  const {
    commandInput,
    handleInputKeyDown,
    handleSubmit,
    inputRef,
    locationPathname,
    logEndRef,
    logs,
    prompt,
    setCommandInput,
    workingDirectory,
  } = useTerminalSession();
  const [manualFullscreen, setManualFullscreen] = useState(false);
  const hasPageContent = children !== null && children !== undefined && children !== false;
  const isFullscreen = manualFullscreen;
  const { handleDragStart, isDragging, position, windowRef } = useDraggableTerminalWindow(
    `${locationPathname}:${hasPageContent ? "content" : "empty"}:${isFullscreen ? "fullscreen" : "floating"}`,
  );
  const workspaceClassName = [
    "terminal-workspace",
    hasPageContent ? "terminal-workspace-with-window" : "",
    isFullscreen ? "terminal-workspace-open" : "",
    isDragging ? "terminal-workspace-dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const workspaceStyle = isFullscreen
    ? {
        left: 0,
        top: 0,
      }
    : position
      ? {
          left: position.x,
          top: position.y,
        }
      : {
          visibility: "hidden" as const,
        };

  return (
    <div className={workspaceClassName} ref={windowRef} style={workspaceStyle}>
      <div className={isFullscreen ? "terminal-shell-screen terminal-shell-screen-open" : "terminal-shell-screen"}>
        <TerminalHeader
          canToggleFullscreen
          draggable={!isFullscreen}
          isFullscreen={isFullscreen}
          isDragging={isDragging}
          onDragStart={handleDragStart}
          onToggleFullscreen={() => setManualFullscreen((currentValue) => !currentValue)}
          workingDirectory={workingDirectory}
        />

        {hasPageContent ? (
          <div className="terminal-shell-split">
            <div className="terminal-shell-session">
              <TerminalLog entries={logs} fallbackPrompt={prompt} logEndRef={logEndRef} />
              <TerminalPrompt
                commandInput={commandInput}
                inputRef={inputRef}
                onChange={(event) => setCommandInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                onSubmit={handleSubmit}
                prompt={prompt}
                stacked
              />
            </div>
            <div className="terminal-shell-window">
              <div className="terminal-shell-window-bar">
                <span className="terminal-shell-window-path">{locationPathname}</span>
              </div>
              <div className="terminal-open-content">{children}</div>
            </div>
          </div>
        ) : (
          <>
            <TerminalLog entries={logs} fallbackPrompt={prompt} logEndRef={logEndRef} />
            <TerminalPrompt
              commandInput={commandInput}
              inputRef={inputRef}
              onChange={(event) => setCommandInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              onSubmit={handleSubmit}
              prompt={prompt}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TerminalUI;
