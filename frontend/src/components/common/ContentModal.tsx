import React, { useEffect, useId, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "../helpers/MarkdownRenderer";
import { ContentItem } from "../../lib/api";

export interface ContentModalProps {
  open: boolean;
  item: ContentItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onEngagementChanged?: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function resolveProjectPresentation(projectUrl: string): {
  internalRoute: string | null;
  linkHref: string | null;
  iframeSrc: string | null;
} {
  const trimmed = projectUrl.trim();
  if (!trimmed) {
    return { internalRoute: null, linkHref: null, iframeSrc: null };
  }

  if (trimmed.startsWith("/")) {
    return { internalRoute: trimmed, linkHref: null, iframeSrc: null };
  }

  if (typeof window === "undefined") {
    return { internalRoute: null, linkHref: trimmed, iframeSrc: trimmed };
  }

  try {
    const resolved = new URL(trimmed, window.location.origin);
    const isHttp = resolved.protocol === "http:" || resolved.protocol === "https:";
    if (!isHttp) {
      return { internalRoute: null, linkHref: trimmed, iframeSrc: null };
    }

    const href = resolved.toString();
    const isSameOrigin = resolved.origin === window.location.origin;
    const internalRoute = isSameOrigin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : null;
    return {
      internalRoute,
      linkHref: isSameOrigin ? null : href,
      iframeSrc: isSameOrigin ? null : href,
    };
  } catch {
    return { internalRoute: null, linkHref: trimmed, iframeSrc: null };
  }
}

const ContentModal: React.FC<ContentModalProps> = ({
  open,
  item,
  loading,
  error,
  onClose,
}) => {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const projectUrl = item?.type === "PROJECT" ? item?.projectUrl?.trim() ?? "" : "";
  const { internalRoute: projectInternalRoute, linkHref: projectLinkHref, iframeSrc } =
    resolveProjectPresentation(projectUrl);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus?.();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const contentBody = item?.bodyMd ?? item?.description ?? "";

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/65 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-[84rem] max-h-[96vh] sm:max-h-[90vh] overflow-y-auto rounded-md sm:rounded-lg bg-white text-gray-900 border border-indigo-300"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 min-h-10 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close dialog"
        >
          X
        </button>

        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-10">
            <div>
              <h2 id={titleId} className="text-lg sm:text-xl font-bold">
                {item?.title ?? "Content"}
              </h2>
              {item && (
                <p className="text-xs sm:text-sm opacity-80 mt-1 break-all">
                  {item.type} | {item.slug} | {new Date(item.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {projectInternalRoute && (
              <button
                className="border rounded-md min-h-10 px-3 py-2 text-sm hover:bg-gray-100"
                type="button"
                onClick={() => {
                  onClose();
                  navigate(projectInternalRoute);
                }}
              >
                Open Project
              </button>
            )}
            {!projectInternalRoute && projectLinkHref && (
              <a
                className="border rounded-md min-h-10 px-3 py-2 text-sm hover:bg-gray-100"
                href={projectLinkHref}
                target="_blank"
                rel="noreferrer"
              >
                Open Project
              </a>
            )}
          </div>
        </div>

        <div className="p-1 sm:p-2">
          {!loading && !error && iframeSrc && (
            <div className="p-3 sm:p-4 md:p-6 space-y-3">
              <div className="rounded-xl border border-gray-300 overflow-hidden shadow-lg bg-gray-100">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 bg-gray-200">
                  <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="ml-2 text-xs sm:text-sm opacity-80 truncate">{iframeSrc}</span>
                </div>
                <iframe
                  title={item?.title ?? "Project Window"}
                  src={iframeSrc}
                  className="block h-[70vh] min-h-[32rem] w-full bg-white"
                />
              </div>
            </div>
          )}
          {loading && <p className="p-3 sm:p-4">Loading content...</p>}
          {error && <p className="p-3 sm:p-4 text-red-500">Could not load content: {error}</p>}
          {!loading && !error && contentBody.trim() === "" && !iframeSrc && <p className="p-3 sm:p-4">No body content yet.</p>}
          {!loading && !error && contentBody.trim() !== "" && <MarkdownRenderer content={contentBody} />}
        </div>
      </div>
    </div>
  );
};

export default ContentModal;
