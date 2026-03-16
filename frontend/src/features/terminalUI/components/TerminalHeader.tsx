import type { PointerEvent } from "react";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";
import UiModeToggle from "../../../components/common/UiModeToggle";
import { terminalShellLabel } from "../../portfolio/data/terminalShell";

type TerminalHeaderProps = {
  canToggleFullscreen?: boolean;
  draggable?: boolean;
  isFullscreen?: boolean;
  isDragging: boolean;
  minimal?: boolean;
  onDragStart: (event: PointerEvent<HTMLDivElement>) => void;
  onToggleFullscreen?: () => void;
  workingDirectory: string;
};

function TerminalHeader({
  canToggleFullscreen = false,
  draggable = true,
  isFullscreen = false,
  isDragging,
  minimal = false,
  onDragStart,
  onToggleFullscreen,
  workingDirectory,
}: TerminalHeaderProps) {
  const dragZoneClassName = minimal
    ? `terminal-shell-dragzone terminal-shell-dragzone-minimal${draggable ? "" : " terminal-shell-dragzone-static"}${isDragging ? " terminal-shell-dragzone-active" : ""}`
    : `terminal-shell-dragzone${draggable ? "" : " terminal-shell-dragzone-static"}${isDragging ? " terminal-shell-dragzone-active" : ""}`;
  const handlePointerDown = draggable ? onDragStart : undefined;

  if (minimal) {
    return (
      <header className="terminal-shell-toolbar terminal-shell-toolbar-minimal">
        <div className={dragZoneClassName} onPointerDown={handlePointerDown}>
          <span className="terminal-shell-grip" aria-hidden="true" />
          <span className="sr-only">Drag terminal window</span>
        </div>
        <UiModeToggle appearance="terminal" />
      </header>
    );
  }

  return (
    <header className="terminal-shell-header">
      <div className={dragZoneClassName} onPointerDown={handlePointerDown}>
        <span className="terminal-shell-label">{terminalShellLabel}</span>
        <span className="terminal-shell-directory">{workingDirectory}</span>
      </div>
      <div className="flex items-center gap-2">
        {canToggleFullscreen ? (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="terminal-shell-toggle"
            aria-label={isFullscreen ? "Restore terminal window" : "Open terminal full screen"}
            title={isFullscreen ? "Restore terminal window" : "Open terminal full screen"}
          >
            {isFullscreen ? <HiArrowsPointingIn className="h-4 w-4" aria-hidden="true" /> : <HiArrowsPointingOut className="h-4 w-4" aria-hidden="true" />}
            <span>{isFullscreen ? "Restore" : "Full screen"}</span>
          </button>
        ) : null}
        <UiModeToggle appearance="terminal" />
      </div>
    </header>
  );
}

export default TerminalHeader;
