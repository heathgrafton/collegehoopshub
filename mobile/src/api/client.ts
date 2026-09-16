import Constants from "expo-constants";

/**
 * The API base URL. Override at runtime with EXPO_PUBLIC_API_URL, e.g.
 *   EXPO_PUBLIC_API_URL=http://192.168.1.23:4000 npx expo start
 * "localhost" only resolves to the dev server itself on web/iOS simulator —
 * a physical device or Android emulator needs your machine's LAN IP.
 */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`);
  } catch (err) {
    throw new ApiError(
      `Could not reach the CollegeHoopsHub API at ${API_BASE_URL}. Is the server running? (${(err as Error).message})`
    );
  }
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed with status ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getScoreboard: () => request<{ games: GameSummary[] }>("/api/scoreboard"),
  getGame: (id: string) => request<{ game: GameSummary }>(`/api/games/${id}`),
  getTeams: (params?: { conference?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.conference) qs.set("conference", params.conference);
    if (params?.search) qs.set("search", params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ teams: TeamSummary[] }>(`/api/teams${suffix}`);
  },
  getConferences: () => request<{ conferences: Conference[] }>("/api/teams/conferences"),
  getTeam: (id: string) => request<{ team: TeamDetail }>(`/api/teams/${id}`),
  getPlayers: (params?: { team?: string; conference?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.team) qs.set("team", params.team);
    if (params?.conference) qs.set("conference", params.conference);
    if (params?.search) qs.set("search", params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ players: PlayerListItem[] }>(`/api/players${suffix}`);
  },
  getPlayer: (id: string) => request<{ player: PlayerDetail }>(`/api/players/${id}`),
  getPlayerMoves: (params?: { type?: "transfer" | "commitment"; team?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.team) qs.set("team", params.team);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ moves: PlayerMove[] }>(`/api/player-moves${suffix}`);
  },
  getNews: (params?: { teamId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.teamId) qs.set("teamId", params.teamId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ articles: NewsArticle[] }>(`/api/news${suffix}`);
  },
};

// --- Types (mirror server response shapes) ---

export type Conference = { id: string; name: string; shortName: string };

export type TeamRef = { id: string; name: string; shortName: string; primaryColor: string; logoUrl: string | null };

export type GameSummary = {
  id: string;
  status: "scheduled" | "live" | "final";
  period: number;
  clock: string;
  startTime: string;
  venue: string;
  broadcast: string | null;
  homeTeam: TeamRef & { score: number };
  awayTeam: TeamRef & { score: number };
};

export type TeamRecord = {
  wins: number;
  losses: number;
  conferenceWins: number;
  conferenceLosses: number;
};

export type TeamSummary = {
  id: string;
  name: string;
  shortName: string;
  nickname: string;
  primaryColor: string;
  logoUrl: string | null;
  conference: Conference;
  record: TeamRecord | null;
};

export type PlayerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  position: string;
  classYear: string;
  photoUrl: string | null;
  team: TeamRef & { conference: Conference };
  pointsPerGame: number | null;
  reboundsPerGame: number | null;
  assistsPerGame: number | null;
};

export type PlayerMove = {
  id: string;
  type: "transfer" | "commitment";
  year: number;
  playerName: string;
  position: string | null;
  stars: number | null;
  rating: number | null;
  origin: { name: string | null; conference: string | null } | null;
  destination: { name: string | null; conference: string | null } | null;
  destinationTeam: { id: string; shortName: string; primaryColor: string; logoUrl: string | null } | null;
};

export type RosterPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  position: string;
  classYear: string;
  photoUrl: string | null;
  pointsPerGame: number | null;
  reboundsPerGame: number | null;
  assistsPerGame: number | null;
};

export type TeamDetail = TeamSummary & {
  city: string;
  state: string;
  seasonStats: {
    pointsPerGame: number | null;
    opponentPointsPerGame: number | null;
    reboundsPerGame: number | null;
    assistsPerGame: number | null;
    netRating: number | null;
    strengthOfSchedule: number | null;
    pace: number | null;
    effectiveFieldGoalPct: number | null;
    turnoversPerGame: number | null;
  } | null;
  roster: RosterPlayer[];
  recentGames: {
    id: string;
    startTime: string;
    homeTeam: { id: string; shortName: string; score: number };
    awayTeam: { id: string; shortName: string; score: number };
  }[];
  upcomingGames: {
    id: string;
    startTime: string;
    venue: string;
    broadcast: string | null;
    homeTeam: { id: string; shortName: string };
    awayTeam: { id: string; shortName: string };
  }[];
};

export type PlayerDetail = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  position: string;
  heightInches: number;
  classYear: string;
  hometown: string;
  photoUrl: string | null;
  team: {
    id: string;
    name: string;
    shortName: string;
    primaryColor: string;
    logoUrl: string | null;
    conference: { id: string; name: string };
  };
  seasonStats: {
    gamesPlayed: number;
    pointsPerGame: number;
    reboundsPerGame: number;
    assistsPerGame: number;
    stealsPerGame: number;
    blocksPerGame: number;
    minutesPerGame: number;
    turnoversPerGame: number | null;
    foulsPerGame: number | null;
    offensiveReboundsPerGame: number | null;
    defensiveReboundsPerGame: number | null;
    fieldGoalPct: number;
    fieldGoalsMade: number | null;
    fieldGoalsAttempted: number | null;
    threePointPct: number;
    threePointMade: number | null;
    threePointAttempted: number | null;
    freeThrowPct: number;
    freeThrowsMade: number | null;
    freeThrowsAttempted: number | null;
    usage: number | null;
    offensiveRating: number | null;
    defensiveRating: number | null;
    netRating: number | null;
    effectiveFieldGoalPct: number | null;
    trueShootingPct: number | null;
    winShares: number | null;
  } | null;
};

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
  team: { id: string; shortName: string } | null;
};
