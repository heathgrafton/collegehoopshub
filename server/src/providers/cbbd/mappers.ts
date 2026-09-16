/**
 * Turns raw CBBD JSON into normalized shapes the sync layer can match
 * against existing Team/Player rows and upsert. Defensive by the same
 * philosophy as the ESPN mappers: a missing/renamed field should skip a
 * row with a console.warn, not crash the run. See types.ts for the
 * confidence caveat on these shapes.
 */
import type { CbbdPlayerSeasonStat, CbbdStatValue, CbbdTeamSeasonStat } from "./types";

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
