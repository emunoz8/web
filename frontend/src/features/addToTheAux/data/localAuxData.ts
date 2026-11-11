import type {
  CurrentlyPlayingResponse,
  PlaylistTrackView,
  PlaylistViewResponse,
  TrackSearchResult,
} from "../types/spotify";

function createCoverDataUri(primaryHex: string, secondaryHex: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryHex}" />
        <stop offset="100%" stop-color="${secondaryHex}" />
      </linearGradient>
    </defs>
    <rect width="240" height="240" rx="28" fill="url(#g)" />
    <circle cx="120" cy="120" r="64" fill="rgba(9,9,11,0.58)" />
    <circle cx="120" cy="120" r="18" fill="rgba(255,255,255,0.82)" />
    <text x="120" y="212" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="600" letter-spacing="1.5">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_AUX_PLAYLIST_ITEMS: PlaylistTrackView[] = [
  {
    id: "aux-track-01",
    name: "Everlong",
    uri: "spotify:track:5UWwZ5lm5PKu6eKsHAGxOk",
    artistName: "Foo Fighters",
    albumName: "The Colour and the Shape",
    imageUrl: createCoverDataUri("#4f46e5", "#0ea5e9", "FF • 1997"),
    addedBy: "edwin",
    addedAt: "2026-10-26T20:12:00.000Z",
  },
  {
    id: "aux-track-02",
    name: "Knights of Cydonia",
    uri: "spotify:track:7ouMYWpwJ422jRcDASZB7P",
    artistName: "Muse",
    albumName: "Black Holes and Revelations",
    imageUrl: createCoverDataUri("#7c3aed", "#ec4899", "MUSE • 2006"),
    addedBy: "edwin",
    addedAt: "2026-10-26T20:09:00.000Z",
  },
  {
    id: "aux-track-03",
    name: "Reptilia",
    uri: "spotify:track:57Xjny5yNzAcsxnusKmAfA",
    artistName: "The Strokes",
    albumName: "Room on Fire",
    imageUrl: createCoverDataUri("#ea580c", "#facc15", "ROF • 2003"),
    addedBy: "guest",
    addedAt: "2026-10-26T20:06:00.000Z",
  },
  {
    id: "aux-track-04",
    name: "Schism",
    uri: "spotify:track:55mJleti2WfWEFNFcBduhc",
    artistName: "TOOL",
    albumName: "Lateralus",
    imageUrl: createCoverDataUri("#0f172a", "#38bdf8", "TOOL • 2001"),
    addedBy: "edwin",
    addedAt: "2026-10-26T20:03:00.000Z",
  },
  {
    id: "aux-track-05",
    name: "No One Knows",
    uri: "spotify:track:6y20BV5L33R8YXM0YuI38N",
    artistName: "Queens of the Stone Age",
    albumName: "Songs for the Deaf",
    imageUrl: createCoverDataUri("#b91c1c", "#111827", "QOTSA • 2002"),
    addedBy: "edwin",
    addedAt: "2026-10-26T20:00:00.000Z",
  },
  {
    id: "aux-track-06",
    name: "Paranoid Android",
    uri: "spotify:track:6LgJvl0Xdtc73RJ1mmpotq",
    artistName: "Radiohead",
    albumName: "OK Computer",
    imageUrl: createCoverDataUri("#0284c7", "#cbd5e1", "OKC • 1997"),
    addedBy: "guest",
    addedAt: "2026-10-26T19:57:00.000Z",
  },
  {
    id: "aux-track-07",
    name: "Chop Suey!",
    uri: "spotify:track:2DlHlPMa4M17kufBvI2lEN",
    artistName: "System Of A Down",
    albumName: "Toxicity",
    imageUrl: createCoverDataUri("#ca8a04", "#7f1d1d", "SOAD • 2001"),
    addedBy: "edwin",
    addedAt: "2026-10-26T19:54:00.000Z",
  },
  {
    id: "aux-track-08",
    name: "Black Hole Sun",
    uri: "spotify:track:2EoOZnxNgtmZaD8uUmz2nD",
    artistName: "Soundgarden",
    albumName: "Superunknown",
    imageUrl: createCoverDataUri("#9a3412", "#31102f", "SG • 1994"),
    addedBy: "edwin",
    addedAt: "2026-10-26T19:51:00.000Z",
  },
  {
    id: "aux-track-09",
    name: "1979",
    uri: "spotify:track:5QLHGv0DfpeXLNFo7SFEy1",
    artistName: "The Smashing Pumpkins",
    albumName: "Mellon Collie and the Infinite Sadness",
    imageUrl: createCoverDataUri("#1e3a8a", "#fbbf24", "SP • 1995"),
    addedBy: "guest",
    addedAt: "2026-10-26T19:48:00.000Z",
  },
  {
    id: "aux-track-10",
    name: "Do I Wanna Know?",
    uri: "spotify:track:5FVd6KXrgO9B3JPmC8OPst",
    artistName: "Arctic Monkeys",
    albumName: "AM",
    imageUrl: createCoverDataUri("#18181b", "#a855f7", "AM • 2013"),
    addedBy: "edwin",
    addedAt: "2026-10-26T19:45:00.000Z",
  },
  {
    id: "aux-track-11",
    name: "Stockholm Syndrome",
    uri: "spotify:track:42933JJ78Zb3gv310bfbdb",
    artistName: "Muse",
    albumName: "Absolution",
    imageUrl: createCoverDataUri("#374151", "#60a5fa", "MUSE • 2003"),
    addedBy: "edwin",
    addedAt: "2026-10-26T19:42:00.000Z",
  },
  {
    id: "aux-track-12",
    name: "My Own Summer (Shove It)",
    uri: "spotify:track:1158ckiB5S4cpsdYHDB9IF",
    artistName: "Deftones",
    albumName: "Around the Fur",
    imageUrl: createCoverDataUri("#065f46", "#1e293b", "DEFT • 1997"),
    addedBy: "edwin",
    addedAt: "2026-10-26T19:39:00.000Z",
  },
];

export const SEARCHABLE_AUX_TRACKS: TrackSearchResult[] = [
  {
    id: "search-track-01",
    name: "The Pretender",
    uri: "spotify:track:7x8dCjCr0x6x2lXKujYD34",
    artistName: "Foo Fighters",
    albumName: "Echoes, Silence, Patience & Grace",
    imageUrl: createCoverDataUri("#dc2626", "#18181b", "FF • 2007"),
  },
  {
    id: "search-track-02",
    name: "Hysteria",
    uri: "spotify:track:7xyYsOvq5Ec3P4fr6mM9fD",
    artistName: "Muse",
    albumName: "Absolution",
    imageUrl: createCoverDataUri("#6d28d9", "#2563eb", "MUSE • 2003"),
  },
  {
    id: "search-track-03",
    name: "Karma Police",
    uri: "spotify:track:63OQupATfueTdZMWTxW03A",
    artistName: "Radiohead",
    albumName: "OK Computer",
    imageUrl: createCoverDataUri("#0369a1", "#94a3b8", "OKC • 1997"),
  },
  {
    id: "search-track-04",
    name: "Someday",
    uri: "spotify:track:7hm4HTk9encxT0LYC0J6oI",
    artistName: "The Strokes",
    albumName: "Is This It",
    imageUrl: createCoverDataUri("#d97706", "#1d4ed8", "ITI • 2001"),
  },
  {
    id: "search-track-05",
    name: "Forty Six & 2",
    uri: "spotify:track:6AioToErdhymVvI4GpXz9F",
    artistName: "TOOL",
    albumName: "Ænima",
    imageUrl: createCoverDataUri("#111827", "#6366f1", "TOOL • 1996"),
  },
  {
    id: "search-track-06",
    name: "Go With the Flow",
    uri: "spotify:track:45DElIx0dXqUH4A83yQFdE",
    artistName: "Queens of the Stone Age",
    albumName: "Songs for the Deaf",
    imageUrl: createCoverDataUri("#991b1b", "#09090b", "QOTSA • 2002"),
  },
  {
    id: "search-track-07",
    name: "Change (In the House of Flies)",
    uri: "spotify:track:51c94ac31swyDQj9B3Lzs3",
    artistName: "Deftones",
    albumName: "White Pony",
    imageUrl: createCoverDataUri("#475569", "#0f172a", "WP • 2000"),
  },
  {
    id: "search-track-08",
    name: "R U Mine?",
    uri: "spotify:track:2AT8iROs4FQueDv2c8q2KE",
    artistName: "Arctic Monkeys",
    albumName: "AM",
    imageUrl: createCoverDataUri("#27272a", "#c084fc", "AM • 2013"),
  },
  {
    id: "search-track-09",
    name: "Cherub Rock",
    uri: "spotify:track:6L89mwZXSOwYl76YXfX13s",
    artistName: "The Smashing Pumpkins",
    albumName: "Siamese Dream",
    imageUrl: createCoverDataUri("#ea580c", "#7c2d12", "SD • 1993"),
  },
  {
    id: "search-track-10",
    name: "Plush",
    uri: "spotify:track:3jJZVeExYzVYiV6Y9Fl3DX",
    artistName: "Stone Temple Pilots",
    albumName: "Core",
    imageUrl: createCoverDataUri("#b45309", "#1f2937", "STP • 1992"),
  },
];

let localPlaylistItemsState: PlaylistTrackView[] = [...INITIAL_AUX_PLAYLIST_ITEMS];

export function getLocalAuxPlaylist(): PlaylistViewResponse {
  return {
    playlistId: "37i9dQZF1DXcBWIGoYBM5M",
    name: "AddToTheAUX — Session Queue",
    description: "Interactive frontend demo queue with local search and track contribution.",
    totalTracks: localPlaylistItemsState.length,
    items: [...localPlaylistItemsState],
  };
}

export function addLocalAuxTrack(track: TrackSearchResult): { added: boolean; duplicate: boolean } {
  const exists = localPlaylistItemsState.some(
    (item) => item.uri === track.uri || item.id === track.id,
  );
  if (exists) {
    return { added: false, duplicate: true };
  }

  const nextTrack: PlaylistTrackView = {
    id: track.id,
    name: track.name,
    uri: track.uri,
    artistName: track.artistName,
    albumName: track.albumName,
    imageUrl: track.imageUrl,
    addedBy: "visitor",
    addedAt: new Date().toISOString(),
  };

  localPlaylistItemsState = [nextTrack, ...localPlaylistItemsState];
  return { added: true, duplicate: false };
}

export function searchLocalAuxTracks(query: string, limit: number): TrackSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const combinedCatalog: TrackSearchResult[] = [
    ...SEARCHABLE_AUX_TRACKS,
    ...INITIAL_AUX_PLAYLIST_ITEMS.map((item, idx) => ({
      id: item.id ?? `init-${idx}`,
      name: item.name ?? "Untitled",
      uri: item.uri ?? `spotify:track:init-${idx}`,
      artistName: item.artistName,
      albumName: item.albumName,
      imageUrl: item.imageUrl,
    })),
  ];

  const seenUris = new Set<string>();
  const matches: TrackSearchResult[] = [];

  for (const track of combinedCatalog) {
    if (seenUris.has(track.uri)) {
      continue;
    }
    const haystack = `${track.name} ${track.artistName ?? ""} ${track.albumName ?? ""}`.toLowerCase();
    if (haystack.includes(normalized)) {
      seenUris.add(track.uri);
      matches.push(track);
      if (matches.length >= limit) {
        break;
      }
    }
  }

  return matches;
}

export function getLocalCurrentlyPlaying(progressMs = 94000): CurrentlyPlayingResponse {
  const lead = localPlaylistItemsState[0] ?? INITIAL_AUX_PLAYLIST_ITEMS[0];
  const durationMs = 250000;
  return {
    playing: true,
    trackId: lead.id,
    trackName: lead.name,
    artistName: lead.artistName,
    albumName: lead.albumName,
    imageUrl: lead.imageUrl,
    spotifyUrl: "https://open.spotify.com",
    progressMs: progressMs % durationMs,
    durationMs,
  };
}
