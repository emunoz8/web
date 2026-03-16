import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import type { ProjectPreview } from "../data/projects";

type ProjectPreviewFrameProps = {
  preview: ProjectPreview;
};

export function ProjectPreviewFrame({ preview }: ProjectPreviewFrameProps) {
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!viewerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
          aria-label={preview.title}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center rounded-[1.75rem] border border-brand-line/18 bg-brand-surface/96 p-4 shadow-[0_28px_84px_rgb(var(--brand-shadow-modal)/0.42)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
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
