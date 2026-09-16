/**
 * Turns raw ESPN JSON into normalized shapes the sync layer can upsert.
 * Every function here is defensive on purpose: a missing/renamed field in
 * the real response should produce a skipped row + a console.warn, never a
 * crash that takes down the whole sync run. Once this has been run against
 * a real response, tighten these back up where the shape turns out to be
 * stable.
 */
import type {
  EspnArticle,
  EspnAthlete,
  EspnCompetition,
  EspnEvent,
  EspnNewsResponse,
  EspnRosterResponse,
  EspnScoreboardResponse,
  EspnStandingsEntry,
  EspnStandingsGroup,
  EspnStandingsResponse,
} from "./types";

export type NormalizedConference = {
  espnId: string;
  name: string;
  shortName: string;
};

export type NormalizedTeamRecord = {
  wins: number;
  losses: number;
  conferenceWins: number;
  conferenceLosses: number;
};

export type NormalizedTeam = {
  espnId: string;
  conferenceEspnId: string;
  name: string;
  shortName: string;
  nickname: string;
  city: string;
  state: string;
  primaryColor: string;
  record: NormalizedTeamRecord;
};

export type NormalizedGame = {
  espnId: string;
  startTime: Date;
  status: "scheduled" | "live" | "final";
  period: number;
  clock: string;
  venue: string;
  broadcast: string | null;
  homeTeamEspnId: string;
  awayTeamEspnId: string;
  homeScore: number;
  awayScore: number;
};

export type NormalizedPlayer = {
  espnId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  position: string;
  heightInches: number;
  classYear: string;
  hometown: string;
};

export type NormalizedArticle = {
  espnId: string;
  title: string;
  summary: string;
  body: string;
  publishedAt: Date;
  imageUrl: string | null;
  teamEspnIds: string[];
};

function findStat(stats: { name?: string; value?: number }[] | undefined, candidates: string[]): number {
  if (!stats) return 0;
  const lowerCandidates = candidates.map((c) => c.toLowerCase());
  const found = stats.find((s) => s.name && lowerCandidates.includes(s.name.toLowerCase()));
  return found?.value ?? 0;
}

function normalizeColor(color: string | undefined): string {
  if (!color) return "#666666";
  return color.startsWith("#") ? color : `#${color}`;
}

export function mapConferences(raw: EspnStandingsResponse): NormalizedConference[] {
  const groups = raw.children ?? [];
  const out: NormalizedConference[] = [];
  for (const g of groups) {
    if (!g.id || !g.name) {
      console.warn("[espn] skipping standings group with missing id/name", g);
      continue;
    }
    out.push({ espnId: g.id, name: g.name, shortName: g.abbreviation ?? g.name });
  }
  return out;
}

export function mapTeamsFromStandings(raw: EspnStandingsResponse): NormalizedTeam[] {
  const groups: EspnStandingsGroup[] = raw.children ?? [];
  const out: NormalizedTeam[] = [];

  for (const group of groups) {
    if (!group.id) continue;
    const entries: EspnStandingsEntry[] = group.standings?.entries ?? [];
    for (const entry of entries) {
      const team = entry.team;
      if (!team?.id || !team.displayName) {
        console.warn("[espn] skipping standings entry with missing team id/name", entry);
        continue;
      }
      out.push({
        espnId: team.id,
        conferenceEspnId: group.id,
        name: team.displayName,
        shortName: team.shortDisplayName ?? team.abbreviation ?? team.displayName,
        nickname: team.name ?? team.shortDisplayName ?? team.displayName,
        city: team.location ?? "",
        state: "",
        primaryColor: normalizeColor(team.color),
        record: {
          // Candidate stat-name keys are a best guess; if these come back
          // as 0 for every team, inspect entry.stats[].name from a live
          // response and adjust the candidate lists below.
          wins: findStat(entry.stats, ["wins"]),
          losses: findStat(entry.stats, ["losses"]),
          conferenceWins: findStat(entry.stats, ["vsconf_wins", "conferencewins", "confwins"]),
          conferenceLosses: findStat(entry.stats, ["vsconf_losses", "conferencelosses", "conflosses"]),
        },
      });
    }
  }
  return out;
}

function mapGameStatus(state: string | undefined): NormalizedGame["status"] {
  if (state === "in") return "live";
  if (state === "post") return "final";
  return "scheduled";
}

export function mapScoreboard(raw: EspnScoreboardResponse): NormalizedGame[] {
  const events: EspnEvent[] = raw.events ?? [];
  const out: NormalizedGame[] = [];

  for (const event of events) {
    if (!event.id || !event.date) {
      console.warn("[espn] skipping event with missing id/date", event);
      continue;
    }
    const competition: EspnCompetition | undefined = event.competitions?.[0];
    if (!competition) {
      console.warn(`[espn] event ${event.id} has no competitions, skipping`);
      continue;
    }
    const home = competition.competitors?.find((c) => c.homeAway === "home");
    const away = competition.competitors?.find((c) => c.homeAway === "away");
    if (!home?.team?.id || !away?.team?.id) {
      console.warn(`[espn] event ${event.id} missing home/away team, skipping`);
      continue;
    }

    out.push({
      espnId: event.id,
      startTime: new Date(event.date),
      status: mapGameStatus(competition.status?.type?.state),
      period: competition.status?.period ?? 0,
      clock: competition.status?.displayClock ?? "",
      venue: competition.venue?.fullName ?? "",
      broadcast: competition.broadcasts?.[0]?.names?.[0] ?? null,
      homeTeamEspnId: home.team.id,
      awayTeamEspnId: away.team.id,
      homeScore: Number(home.score ?? 0),
      awayScore: Number(away.score ?? 0),
    });
  }
  return out;
}

function classYearFromExperience(experience: EspnAthlete["experience"]): string {
  if (experience?.displayValue) return experience.displayValue;
  // Fallback heuristic: ESPN's "years" field isn't guaranteed to map
  // cleanly to Fr/So/Jr/Sr for college rosters — verify against a live
  // roster response and prefer displayValue above when it's present.
  const years = experience?.years ?? 0;
  return ["Fr", "So", "Jr", "Sr"][Math.min(years, 3)];
}

export function mapRoster(raw: EspnRosterResponse): NormalizedPlayer[] {
  const groups = raw.athletes ?? [];
  const athletes: EspnAthlete[] = groups.flatMap((g) => ("items" in g ? g.items ?? [] : [g as EspnAthlete]));

  const out: NormalizedPlayer[] = [];
  for (const a of athletes) {
    if (!a.id || (!a.fullName && !a.lastName)) {
      console.warn("[espn] skipping roster athlete with missing id/name", a);
      continue;
    }
    const [firstName, ...rest] = (a.fullName ?? `${a.firstName ?? ""} ${a.lastName ?? ""}`).trim().split(" ");
    out.push({
      espnId: a.id,
      firstName: a.firstName ?? firstName ?? "",
      lastName: a.lastName ?? rest.join(" ") ?? "",
      jerseyNumber: a.jersey ?? "",
      position: a.position?.abbreviation ?? "",
      heightInches: a.height ?? 0,
      classYear: classYearFromExperience(a.experience),
      hometown: [a.birthPlace?.city, a.birthPlace?.state].filter(Boolean).join(", "),
    });
  }
  return out;
}

export function mapNews(raw: EspnNewsResponse): NormalizedArticle[] {
  const articles: EspnArticle[] = raw.articles ?? [];
  const out: NormalizedArticle[] = [];

  for (const a of articles) {
    if (a.id === undefined || !a.headline) {
      console.warn("[espn] skipping article with missing id/headline", a);
      continue;
    }
    out.push({
      espnId: String(a.id),
      title: a.headline,
      summary: a.description ?? "",
      // The free site API doesn't expose full article bodies (that's
      // paywalled/rendered on espn.com), so body reuses the description.
      body: a.description ?? "",
      publishedAt: a.published ? new Date(a.published) : new Date(),
      imageUrl: a.images?.[0]?.url ?? null,
      teamEspnIds: (a.categories ?? [])
        .map((c) => c.team?.id)
        .filter((id): id is string | number => Boolean(id))
        .map((id) => String(id)),
    });
  }
  return out;
}
