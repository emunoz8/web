import { useEffect, useId, useRef, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import type { ProjectPreview } from "../data/projects";

type ProjectPreviewFrameProps = {
  preview: ProjectPreview;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectPreviewFrame({ preview }: ProjectPreviewFrameProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleId = useId();

  useEffect(() => {
    if (!viewerOpen) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setViewerOpen(false);
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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (triggerRef.current) {
        triggerRef.current.focus();
      } else {
        previousActiveElement?.focus?.();
      }
    };
  }, [viewerOpen]);

  return (
    <>
      <article className="group flex h-full flex-col border-t border-brand-line/18 pt-4">
        <div className="overflow-hidden rounded-[1.75rem] border border-brand-line/16 bg-brand-surface/40 transition-colors duration-200 group-hover:border-brand-frame/28">
          {preview.kind === "route" ? (
            <iframe
              title={preview.title}
              src={preview.src}
              className="pointer-events-none h-[22rem] w-full border-0 bg-white"
              loading="lazy"
            />
          ) : (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setViewerOpen(true)}
              className="block w-full cursor-zoom-in"
              aria-label={`Open larger image for ${preview.title}`}
            >
              <img
                src={preview.src}
                alt={preview.alt}
                className="h-[22rem] w-full object-cover"
                loading="lazy"
              />
            </button>
          )}
        </div>

        <div className="flex h-full flex-col pt-5">
          <p className="portfolio-kicker">{preview.kind === "route" ? "Live Surface" : "Screenshot"}</p>
          <h3 className="portfolio-display-subtitle mt-3">{preview.title}</h3>
          <p className="mt-3 portfolio-copy">{preview.caption}</p>
        </div>
      </article>

      {preview.kind === "image" && viewerOpen ? (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-brand-overlay/72 p-4 backdrop-blur-sm"
          onClick={() => setViewerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
        >
          <div
            ref={dialogRef}
            className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center rounded-[1.75rem] border border-brand-line/18 bg-brand-surface/96 p-4 shadow-[0_28px_84px_rgb(var(--brand-shadow-modal)/0.42)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={dialogTitleId} className="sr-only">
              {preview.title}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setViewerOpen(false)}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-line/18 bg-brand-surface/92 text-brand-contrast transition hover:border-brand-frame/34 hover:text-brand-accent"
              aria-label="Close image viewer"
            >
              <HiXMark className="h-5 w-5" />
            </button>
            <img
              src={preview.src}
              alt={preview.alt}
              className="max-h-[82vh] w-auto max-w-full rounded-[1.1rem] object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
