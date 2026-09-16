import type {
  CbbdConference,
  CbbdPlayerSeasonStat,
  CbbdRecruit,
  CbbdTeam,
  CbbdTeamSeasonStat,
  CbbdTransfer,
} from "./types";

const BASE_URL = "https://api.collegebasketballdata.com";

class CbbdClientError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "CbbdClientError";
  }
}

function apiKey(): string {
  const key = process.env.CBBD_API_KEY;
  if (!key) {
    throw new CbbdClientError(
      "CBBD_API_KEY is not set. Sign up for a free key at https://collegebasketballdata.com and add it to server/.env."
    );
  }
  return key;
}

async function getJson<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(params);
  const url = `${BASE_URL}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey()}` },
    });
  } catch (err) {
    throw new CbbdClientError(`Network error calling CBBD API: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new CbbdClientError(`CBBD API request to ${url} failed with status ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const cbbdClient = {
  fetchTeams(): Promise<CbbdTeam[]> {
    return getJson("/teams");
  },

  fetchConferences(): Promise<CbbdConference[]> {
    return getJson("/conferences");
  },

  fetchTeamSeasonStats(season: number): Promise<CbbdTeamSeasonStat[]> {
    return getJson("/stats/team/season", { season: String(season) });
  },

  fetchPlayerSeasonStats(season: number): Promise<CbbdPlayerSeasonStat[]> {
    return getJson("/stats/player/season", { season: String(season) });
  },

  fetchPortalTransfers(year: number): Promise<CbbdTransfer[]> {
    return getJson("/recruiting/portal", { year: String(year) });
  },

  fetchRecruits(year: number): Promise<CbbdRecruit[]> {
    return getJson("/recruiting/players", { year: String(year) });
  },
};

export { CbbdClientError };
