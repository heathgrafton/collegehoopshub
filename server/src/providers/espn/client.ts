import type { EspnNewsResponse, EspnRosterResponse, EspnScoreboardResponse, EspnStandingsResponse } from "./types";

const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball";

// Standings live on a different ESPN host than the other site-api endpoints;
// site.api.espn.com's own /standings route returns an empty stub.
const STANDINGS_BASE_URL = "https://site.web.api.espn.com/apis/v2/sports/basketball/mens-college-basketball";

// ESPN's "group" id for the full Division I men's basketball field.
const DIVISION_I_GROUP = "50";

class EspnClientError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "EspnClientError";
  }
}

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new EspnClientError(`Network error calling ESPN API: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new EspnClientError(`ESPN API request to ${url} failed with status ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const espnClient = {
  /** Conference standings for all of Division I, with each team's record. */
  fetchStandings(season?: number): Promise<EspnStandingsResponse> {
    const qs = new URLSearchParams({ group: DIVISION_I_GROUP });
    if (season) qs.set("season", String(season));
    return getJson(`${STANDINGS_BASE_URL}/standings?${qs.toString()}`);
  },

  /** Games for a given date (YYYYMMDD, local ESPN convention). Defaults to today. */
  fetchScoreboard(dateYYYYMMDD?: string): Promise<EspnScoreboardResponse> {
    const qs = new URLSearchParams({ groups: DIVISION_I_GROUP, limit: "500" });
    if (dateYYYYMMDD) qs.set("dates", dateYYYYMMDD);
    return getJson(`${BASE_URL}/scoreboard?${qs.toString()}`);
  },

  /** Full roster for a single team, by ESPN team id. */
  fetchTeamRoster(espnTeamId: string): Promise<EspnRosterResponse> {
    return getJson(`${BASE_URL}/teams/${espnTeamId}/roster`);
  },

  /** Recent headlines, optionally scoped to a team. */
  fetchNews(limit = 30): Promise<EspnNewsResponse> {
    const qs = new URLSearchParams({ limit: String(limit) });
    return getJson(`${BASE_URL}/news?${qs.toString()}`);
  },
};

export { EspnClientError };
