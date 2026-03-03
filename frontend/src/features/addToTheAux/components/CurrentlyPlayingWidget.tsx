import type { CurrentlyPlayingResponse } from "../types/spotify";

type CurrentlyPlayingWidgetProps = {
  currentlyPlaying: CurrentlyPlayingResponse | null;
  loading: boolean;
  error: string;
  embedded?: boolean;
  className?: string;
};

function formatProgress(progressMs: number | null, durationMs: number | null): number {
  if (!progressMs || !durationMs || durationMs <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (progressMs / durationMs) * 100));
}

function CurrentlyPlayingWidget({
  currentlyPlaying,
  loading,
  error,
  embedded = false,
  className = "",
}: CurrentlyPlayingWidgetProps) {
  const isPlaying = Boolean(currentlyPlaying?.playing);

  if (!isPlaying && !loading) {
    return null;
  }

  const progress = formatProgress(currentlyPlaying?.progressMs ?? null, currentlyPlaying?.durationMs ?? null);
  const wrapperClass = embedded
    ? "w-full"
    : "fixed bottom-4 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] sm:bottom-6 sm:right-6";

  return (
    <aside
      data-orbit-drag-ignore="true"
      className={`${wrapperClass} ${className} overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/78 shadow-[0_24px_60px_rgba(2,6,23,0.5)] backdrop-blur-2xl`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_38%)]" />
      <div className="relative grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3 p-2.5 lg:grid-cols-[56px_minmax(0,1fr)] lg:p-3">
        <div className="aspect-square overflow-hidden rounded-[14px] bg-[radial-gradient(circle_at_top,#263870,#0a1124_78%)] lg:rounded-[16px]">
          {currentlyPlaying?.imageUrl ? (
            <img
              src={currentlyPlaying.imageUrl}
              alt={currentlyPlaying.albumName ?? currentlyPlaying.trackName ?? "Current track artwork"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-slate-400">
              <span className="sr-only">No artwork</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-[1.375rem] w-[1.375rem]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 4v16" />
                <path d="M7 8.5v7" />
                <path d="M17 8.5v7" />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-indigo-200/72">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)] animate-pulse" />
            <span>{loading && !currentlyPlaying ? "Loading" : error ? "Unavailable" : "Now playing"}</span>
          </div>

          {error ? (
            <p className="text-xs text-rose-200 lg:mt-2">{error}</p>
          ) : currentlyPlaying ? (
            <>
              <p className="line-clamp-2 text-sm font-semibold leading-tight text-slate-50 lg:mt-1.5 lg:line-clamp-1">
                {currentlyPlaying.trackName || "Unknown track"}
              </p>
              <p className="mt-0.5 hidden line-clamp-1 text-[11px] text-slate-300 lg:block">
                {currentlyPlaying.artistName || "Unknown artist"}
              </p>
              <p className="mt-0.5 hidden line-clamp-1 text-[10px] text-slate-400 lg:block">
                {currentlyPlaying.albumName || "Unknown album"}
              </p>
              <div className="mt-2.5 hidden h-1.5 overflow-hidden rounded-full bg-white/8 lg:block">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,0.95),rgba(129,140,248,0.95))]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {currentlyPlaying.spotifyUrl && (
                <a
                  href={currentlyPlaying.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 hidden items-center gap-1.5 text-[11px] font-medium text-sky-200 transition hover:text-sky-100 lg:inline-flex"
                >
                  <span>Open</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </a>
              )}
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export default CurrentlyPlayingWidget;
