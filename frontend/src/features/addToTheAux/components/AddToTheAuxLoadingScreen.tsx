function AddToTheAuxLoadingScreen() {
  return (
    <section className="aux-loading-screen">
      <div className="aux-loading-screen-background">
        <div className="aux-loading-core-glow" />
        <div className="aux-loading-fuchsia-glow" />
        <div className="aux-loading-sky-glow" />
      </div>

      <div className="aux-loading-screen-content">
        <div className="aux-loading-screen-orbit">
          <div className="aux-loading-screen-ring" />
          <div className="aux-loading-screen-ring-inner" />
          <div className="aux-loading-screen-pulse" />
          <div className="aux-loading-screen-spin-outer" />
          <div className="aux-loading-screen-spin-inner" />
        </div>

        <p className="aux-loading-screen-kicker">AddToTheAUX</p>
        <h1 className="aux-loading-screen-title">Loading the playlist orbit</h1>
        <p className="aux-loading-screen-copy">
          Pulling the latest tracks from Spotify before the stage opens.
        </p>
        <div className="sr-only" aria-live="polite">
          Loading playlist from Spotify.
        </div>
      </div>
    </section>
  );
}

export default AddToTheAuxLoadingScreen;
