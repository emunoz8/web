import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  buildInitialTerminalHistory,
  getTerminalPrompt,
  getTerminalWorkingDirectory,
  resolveTerminalApiCommand,
  resolveTerminalCommand,
  type TerminalTone,
} from "../../portfolio/data/terminalShell";
import { subscribeTerminalTelemetry } from "../lib/terminalTelemetry";

type TerminalLogType = TerminalTone | "command";

export type TerminalLogEntry = {
  id: string;
  type: TerminalLogType;
  text: string;
  prompt?: string;
};

const MAX_VISIBLE_LOGS = 120;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

function createInitialLogs(): TerminalLogEntry[] {
  return buildInitialTerminalHistory().map((entry, index) => ({
    ...entry,
    id: `boot-${index}`,
  }));
}

function normalizeCommand(command: string) {
  return command.trim().toLowerCase().replace(/\s+/g, " ");
}

export function useTerminalSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [commandInput, setCommandInput] = useState("");
  const [logs, setLogs] = useState<TerminalLogEntry[]>(() => createInitialLogs());
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const prompt = getTerminalPrompt(location.pathname);
  const workingDirectory = getTerminalWorkingDirectory(location.pathname);

  const appendLogs = (nextEntries: TerminalLogEntry[]) => {
    setLogs((currentLogs) => [...currentLogs, ...nextEntries].slice(-MAX_VISIBLE_LOGS));
  };

  const focusPrompt = (selectText = false) => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if (selectText) {
      input.select();
      return;
    }

    const cursorPosition = input.value.length;
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const resetPromptInput = () => {
    setCommandInput("");
    setHistoryIndex(null);
  };

  const clearTerminalOutput = () => {
    resetPromptInput();
    setLogs([
      {
        id: `clear-${Date.now()}`,
        type: "info",
        text: `screen cleared :: ${location.pathname}`,
      },
    ]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [logs]);

  useEffect(() => {
    return subscribeTerminalTelemetry((detail) => {
      setLogs((currentLogs) =>
        [
          ...currentLogs,
          ...detail.lines.map((line, index) => ({
            id: `telemetry-${Date.now()}-${index}`,
            type: detail.tone ?? "info",
            text: line,
          })),
        ].slice(-MAX_VISIBLE_LOGS),
      );
    });
  }, []);

  useEffect(() => {
    focusPrompt();
  }, [location.pathname]);

  const executeCommand = async (rawCommand: string) => {
    const trimmedCommand = rawCommand.trim();

    if (!trimmedCommand) {
      return;
    }

    const normalizedCommand = normalizeCommand(trimmedCommand);

    setCommandHistory((currentHistory) => {
      const nextHistory =
        currentHistory[currentHistory.length - 1] === trimmedCommand
          ? currentHistory
          : [...currentHistory, trimmedCommand];
      return nextHistory.slice(-40);
    });
    setHistoryIndex(null);

    appendLogs([
      {
        id: `command-${Date.now()}`,
        type: "command",
        text: trimmedCommand,
        prompt,
      },
    ]);

    if (normalizedCommand === "logout") {
      if (!isAuthenticated) {
        appendLogs([
          {
            id: `logout-error-${Date.now()}`,
            type: "error",
            text: "No authenticated session is active.",
          },
        ]);
        return;
      }

      await logout();
      appendLogs([
        {
          id: `logout-success-${Date.now()}`,
          type: "success",
          text: "Session closed.",
        },
      ]);
      return;
    }

    if (normalizedCommand === "login" || normalizedCommand === "ssh login") {
      appendLogs([
        {
          id: `login-route-${Date.now()}`,
          type: "success",
          text: "Opening /login.",
        },
      ]);
      navigate("/login");
      return;
    }

    if (normalizedCommand === "admin" || normalizedCommand === "sudo admin") {
      if (!isAdmin) {
        appendLogs([
          {
            id: `admin-error-${Date.now()}`,
            type: "error",
            text: "Permission denied. Admin access required.",
          },
        ]);
        return;
      }

      appendLogs([
        {
          id: `admin-route-${Date.now()}`,
          type: "success",
          text: "Opening /admin/projects.",
        },
      ]);
      navigate("/admin/projects");
      return;
    }

    const apiResolution = await resolveTerminalApiCommand(trimmedCommand);

    if (apiResolution) {
      appendLogs(
        apiResolution.lines.map((line, index) => ({
          id: `api-output-${Date.now()}-${index}`,
          type: apiResolution.tone,
          text: line,
        }))
      );
      return;
    }

    const resolution = resolveTerminalCommand(trimmedCommand, location.pathname);

    if (resolution.kind === "clear") {
      clearTerminalOutput();
      return;
    }

    appendLogs(
      resolution.lines.map((line, index) => ({
        id: `output-${Date.now()}-${index}`,
        type: resolution.tone,
        text: line,
      }))
    );

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

  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      const editableTarget = isEditableTarget(event.target);
      const inputFocused = document.activeElement === inputRef.current;
      const lowerKey = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && lowerKey === "k") {
        event.preventDefault();
        focusPrompt(true);
        return;
      }

      if (event.shiftKey && event.key === "Escape" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (!editableTarget || inputFocused) {
          event.preventDefault();
          clearTerminalOutput();
          focusPrompt();
        }
        return;
      }

      if (editableTarget) {
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "/") {
        event.preventDefault();
        focusPrompt();
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "?") {
        event.preventDefault();
        resetPromptInput();
        focusPrompt();
        void executeCommand("help");
        return;
      }

      if (!event.ctrlKey && !event.metaKey && event.altKey && event.key === "ArrowUp") {
        event.preventDefault();
        resetPromptInput();
        focusPrompt();
        void executeCommand("cd ..");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCommand = commandInput.trim();

    if (!trimmedCommand) {
      return;
    }

    setCommandInput("");
    void executeCommand(trimmedCommand);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const lowerKey = event.key.toLowerCase();

    if (event.shiftKey && event.key === "Escape") {
      event.preventDefault();
      clearTerminalOutput();
      focusPrompt();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && lowerKey === "c") {
      event.preventDefault();
      resetPromptInput();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      resetPromptInput();
      return;
    }

    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      resetPromptInput();
      void executeCommand("cd ..");
      return;
    }

    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    if (commandHistory.length === 0) {
      return;
    }

    if (event.key === "ArrowUp") {
      const nextIndex =
        historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommandInput(commandHistory[nextIndex]);
      return;
    }

    if (historyIndex === null) {
      return;
    }

    const nextIndex = historyIndex + 1;

    if (nextIndex >= commandHistory.length) {
      setHistoryIndex(null);
      setCommandInput("");
      return;
    }

    setHistoryIndex(nextIndex);
    setCommandInput(commandHistory[nextIndex]);
  };

  return {
    commandInput,
    focusPrompt,
    handleInputKeyDown,
    handleSubmit,
    inputRef,
    locationPathname: location.pathname,
    logEndRef,
    logs,
    prompt,
    setCommandInput,
    workingDirectory,
  };
}
