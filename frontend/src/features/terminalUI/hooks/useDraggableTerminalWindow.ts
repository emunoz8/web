import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

const WINDOW_MARGIN = 16;

type WindowPosition = {
  x: number;
  y: number;
};

type WindowSize = {
  width: number;
  height: number;
};

type DraggableTerminalWindow = {
  handleDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  position: WindowPosition | null;
  windowRef: RefObject<HTMLDivElement | null>;
};

function clampWindowPosition(position: WindowPosition, size: WindowSize): WindowPosition {
  const maxX = Math.max(WINDOW_MARGIN, window.innerWidth - size.width - WINDOW_MARGIN);
  const maxY = Math.max(WINDOW_MARGIN, window.innerHeight - size.height - WINDOW_MARGIN);

  return {
    x: Math.min(Math.max(position.x, WINDOW_MARGIN), maxX),
    y: Math.min(Math.max(position.y, WINDOW_MARGIN), maxY),
  };
}

function getCenteredWindowPosition(size: WindowSize): WindowPosition {
  return clampWindowPosition(
    {
      x: (window.innerWidth - size.width) / 2,
      y: (window.innerHeight - size.height) / 2,
    },
    size,
  );
}

export function useDraggableTerminalWindow(layoutKey: string): DraggableTerminalWindow {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ offsetX: 0, offsetY: 0 });
  const [position, setPosition] = useState<WindowPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useLayoutEffect(() => {
    if (!windowRef.current) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const bounds = windowRef.current?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      const size = { width: bounds.width, height: bounds.height };

      setPosition((currentPosition) =>
        currentPosition ? clampWindowPosition(currentPosition, size) : getCenteredWindowPosition(size),
      );
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [layoutKey]);

  useEffect(() => {
    const handleResize = () => {
      const bounds = windowRef.current?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      const size = { width: bounds.width, height: bounds.height };

      setPosition((currentPosition) =>
        currentPosition ? clampWindowPosition(currentPosition, size) : getCenteredWindowPosition(size),
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = windowRef.current?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      const size = { width: bounds.width, height: bounds.height };

      setPosition(
        clampWindowPosition(
          {
            x: event.clientX - dragStateRef.current.offsetX,
            y: event.clientY - dragStateRef.current.offsetY,
          },
          size,
        ),
      );
    };

    const stopDragging = () => {
      setIsDragging(false);
    };

    document.body.classList.add("terminal-window-dragging");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      document.body.classList.remove("terminal-window-dragging");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [isDragging]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const bounds = windowRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    dragStateRef.current = {
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };

    setPosition({ x: bounds.left, y: bounds.top });
    setIsDragging(true);
    event.preventDefault();
  };

  return {
    handleDragStart,
    isDragging,
    position,
    windowRef,
  };
}
