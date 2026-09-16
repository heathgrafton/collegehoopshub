/**
 * Turns raw CBBD JSON into normalized shapes the sync layer can match
 * against existing Team/Player rows and upsert. Defensive by the same
 * philosophy as the ESPN mappers: a missing/renamed field should skip a
 * row with a console.warn, not crash the run. See types.ts for the
 * confidence caveat on these shapes.
 */
import type { CbbdPlayerSeasonStat, CbbdRecruit, CbbdStatValue, CbbdTeamSeasonStat, CbbdTransfer } from "./types";

export type NormalizedTeamSeasonStat = {
  teamSchool: string;
  season: number;
  wins: number;
  losses: number;
  pointsPerGame: number | null;
  opponentPointsPerGame: number | null;
  reboundsPerGame: number | null;
  assistsPerGame: number | null;
  netRating: number | null;
  strengthOfSchedule: number | null;
};

export type NormalizedPlayerSeasonStat = {
  athleteId: string;
  firstName: string;
  lastName: string;
  teamSchool: string;
  season: number;
  gamesPlayed: number;
  pointsPerGame: number | null;
  reboundsPerGame: number | null;
  assistsPerGame: number | null;
  stealsPerGame: number | null;
  blocksPerGame: number | null;
  minutesPerGame: number | null;
  fieldGoalPct: number | null;
  threePointPct: number | null;
  freeThrowPct: number | null;
};

export type NormalizedPlayerMove = {
  cbbdId: string;
  type: "transfer" | "commitment";
  year: number;
  playerName: string;
  position: string | null;
  stars: number | null;
  rating: number | null;
  originName: string | null;
  originConference: string | null;
  destinationName: string | null;
  destinationConference: string | null;
};

export function mapTransfers(raw: CbbdTransfer[]): NormalizedPlayerMove[] {
  const out: NormalizedPlayerMove[] = [];
  for (const t of raw) {
    if (t.id === undefined || !t.lastName) {
      console.warn("[cbbd] skipping transfer with missing id/name", t);
      continue;
    }
    out.push({
      cbbdId: `transfer-${t.id}`,
      type: "transfer",
      year: t.year,
      playerName: `${t.firstName} ${t.lastName}`.trim(),
      position: t.position ?? null,
      stars: t.stars,
      rating: t.rating,
      originName: t.origin?.name ?? null,
      originConference: t.origin?.conference ?? null,
      destinationName: t.destination?.name ?? null,
      destinationConference: t.destination?.conference ?? null,
    });
  }
  return out;
}

export function mapRecruits(raw: CbbdRecruit[]): NormalizedPlayerMove[] {
  const out: NormalizedPlayerMove[] = [];
  for (const r of raw) {
    if (r.id === undefined || !r.name) {
      console.warn("[cbbd] skipping recruit with missing id/name", r);
      continue;
    }
    out.push({
      cbbdId: `commitment-${r.id}`,
      type: "commitment",
      year: r.year,
      playerName: r.name,
      position: r.position,
      stars: r.stars,
      rating: r.rating,
      originName: r.school,
      originConference: null,
      destinationName: r.committedTo?.name ?? null,
      destinationConference: r.committedTo?.conference ?? null,
    });
  }
  return out;
}

/** Reads a stat that might be a plain number or a `{ perGame, total }` object. */
function readPerGame(value: CbbdStatValue): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return value;
  return value.perGame ?? null;
}

export function mapTeamSeasonStats(raw: CbbdTeamSeasonStat[]): NormalizedTeamSeasonStat[] {
  const out: NormalizedTeamSeasonStat[] = [];
  for (const t of raw) {
    if (!t.team || t.season === undefined) {
      console.warn("[cbbd] skipping team season stat with missing team/season", t);
      continue;
    }
    out.push({
      teamSchool: t.team,
      season: t.season,
      wins: t.wins ?? 0,
      losses: t.losses ?? 0,
      pointsPerGame: readPerGame(t.points),
      opponentPointsPerGame: readPerGame(t.opponentPoints),
      reboundsPerGame: readPerGame(t.rebounds),
      assistsPerGame: readPerGame(t.assists),
      netRating: t.netRating ?? null,
      strengthOfSchedule: t.strengthOfSchedule ?? t.sos ?? null,
    });
  }
  return out;
}

export function mapPlayerSeasonStats(raw: CbbdPlayerSeasonStat[]): NormalizedPlayerSeasonStat[] {
  const out: NormalizedPlayerSeasonStat[] = [];
  for (const p of raw) {
    if (p.athleteId === undefined || !p.name || !p.team || p.season === undefined) {
      console.warn("[cbbd] skipping player season stat with missing id/name/team/season", p);
      continue;
    }
    const [firstName, ...rest] = p.name.trim().split(" ");

    out.push({
      athleteId: String(p.athleteId),
      firstName,
      lastName: rest.join(" "),
      teamSchool: p.team,
      season: p.season,
      gamesPlayed: p.games ?? 0,
      pointsPerGame: readPerGame(p.points),
      reboundsPerGame: readPerGame(p.rebounds),
      assistsPerGame: readPerGame(p.assists),
      stealsPerGame: readPerGame(p.steals),
      blocksPerGame: readPerGame(p.blocks),
      minutesPerGame: readPerGame(p.minutes),
      fieldGoalPct: p.fieldGoalPct ?? p.fieldGoals?.pct ?? null,
      threePointPct: p.threePointPct ?? p.threePointFieldGoals?.pct ?? null,
      freeThrowPct: p.freeThrowPct ?? p.freeThrows?.pct ?? null,
    });
  }
  return out;
}
