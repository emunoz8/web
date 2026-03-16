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
    ? "aux-currently-playing aux-currently-playing-embedded"
    : "aux-currently-playing aux-currently-playing-floating";

  return (
    <aside
      data-orbit-drag-ignore="true"
      className={`${wrapperClass}${className ? ` ${className}` : ""}`}
    >
      <div className="aux-currently-playing-backdrop" />
      <div className="aux-currently-playing-inner">
        <div className="aux-currently-playing-art">
          {currentlyPlaying?.imageUrl ? (
            <img
              src={currentlyPlaying.imageUrl}
              alt={currentlyPlaying.albumName ?? currentlyPlaying.trackName ?? "Current track artwork"}
              className="aux-artwork-cover"
              loading="lazy"
            />
          ) : (
            <div className="aux-currently-playing-art-empty">
              <span className="sr-only">No artwork</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="aux-currently-playing-art-empty-icon"
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

        <div className="aux-currently-playing-meta">
          <div className="aux-currently-playing-status">
            <span className="aux-currently-playing-dot" />
            <span>{loading && !currentlyPlaying ? "Loading" : error ? "Unavailable" : "Now playing"}</span>
          </div>

          {error ? (
            <p className="aux-currently-playing-error">{error}</p>
          ) : currentlyPlaying ? (
            <>
              <p className="aux-currently-playing-track">
                {currentlyPlaying.trackName || "Unknown track"}
              </p>
              <p className="aux-currently-playing-artist">
                {currentlyPlaying.artistName || "Unknown artist"}
              </p>
              <p className="aux-currently-playing-album">
                {currentlyPlaying.albumName || "Unknown album"}
              </p>
              <div className="aux-currently-playing-progress">
                <div
                  className="aux-currently-playing-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {currentlyPlaying.spotifyUrl && (
                <a
                  href={currentlyPlaying.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="aux-currently-playing-link"
                >
                  <span>Open</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="aux-currently-playing-link-icon"
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
