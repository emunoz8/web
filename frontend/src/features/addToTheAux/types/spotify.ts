export type ApiError = {
  message?: string;
  detail?: string;
  error?: string;
};

export type PlaylistTrackView = {
  id: string | null;
  name: string | null;
  uri: string | null;
  artistName: string | null;
  albumName: string | null;
  imageUrl: string | null;
  addedBy: string | null;
  addedAt: string | null;
};

export type PlaylistViewResponse = {
  playlistId: string;
  name: string;
  description: string | null;
  totalTracks: number | null;
  items: PlaylistTrackView[];
};

export type TrackSearchResult = {
  id: string;
  name: string;
  uri: string;
  artistName: string | null;
  albumName: string | null;
  imageUrl: string | null;
};

export type TrackSearchResponse = {
  tracks: TrackSearchResult[];
};

export type CurrentlyPlayingResponse = {
  playing: boolean;
  trackId: string | null;
  trackName: string | null;
  artistName: string | null;
  albumName: string | null;
  imageUrl: string | null;
  spotifyUrl: string | null;
  progressMs: number | null;
  durationMs: number | null;
};
