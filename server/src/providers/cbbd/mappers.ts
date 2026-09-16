/**
 * Turns raw CBBD JSON into normalized shapes the sync layer can match
 * against existing Team/Player rows and upsert. Defensive by the same
 * philosophy as the ESPN mappers: a missing/renamed field should skip a
 * row with a console.warn, not crash the run. See types.ts for the
 * confidence caveat on these shapes.
 */
import type { CbbdPlayerSeasonStat, CbbdRecruit, CbbdTeamSeasonStat, CbbdTransfer } from "./types";

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
  pace: number | null;
  effectiveFieldGoalPct: number | null;
  turnoversPerGame: number | null;
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
  turnoversPerGame: number | null;
  foulsPerGame: number | null;
  offensiveReboundsPerGame: number | null;
  defensiveReboundsPerGame: number | null;
  fieldGoalPct: number | null;
  fieldGoalsMade: number | null;
  fieldGoalsAttempted: number | null;
  threePointPct: number | null;
  threePointMade: number | null;
  threePointAttempted: number | null;
  freeThrowPct: number | null;
  freeThrowsMade: number | null;
  freeThrowsAttempted: number | null;
  usage: number | null;
  offensiveRating: number | null;
  defensiveRating: number | null;
  netRating: number | null;
  effectiveFieldGoalPct: number | null;
  trueShootingPct: number | null;
  winShares: number | null;
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

/** CBBD's season endpoints return totals, not per-game averages — divide here. */
function perGame(total: number | null, games: number): number | null {
  if (total === null || games <= 0) return null;
  return total / games;
}

/**
 * CBBD mixes 0-100 and 0-1 scales for percentages, inconsistently, even
 * within the same object (verified live: fieldGoals.pct is 48.2, but the
 * same player's trueShootingPct is 0.636). This app stores/displays every
 * percentage as a 0-1 fraction, so the 0-100 ones need dividing down.
 */
function pctFrom100(value: number | null): number | null {
  return value === null ? null : value / 100;
}

export function mapTeamSeasonStats(raw: CbbdTeamSeasonStat[]): NormalizedTeamSeasonStat[] {
  const out: NormalizedTeamSeasonStat[] = [];
  for (const t of raw) {
    if (!t.team || t.season === undefined || !t.teamStats) {
      console.warn("[cbbd] skipping team season stat with missing team/season/stats", t);
      continue;
    }
    out.push({
      teamSchool: t.team,
      season: t.season,
      wins: t.wins ?? 0,
      losses: t.losses ?? 0,
      pointsPerGame: perGame(t.teamStats.points.total, t.games),
      opponentPointsPerGame: perGame(t.opponentStats?.points.total ?? null, t.games),
      reboundsPerGame: perGame(t.teamStats.rebounds.total, t.games),
      assistsPerGame: perGame(t.teamStats.assists, t.games),
      netRating: t.teamStats.rating !== null && t.opponentStats?.rating != null ? t.teamStats.rating - t.opponentStats.rating : null,
      // CBBD's season-stats endpoints don't include a strength-of-schedule figure.
      strengthOfSchedule: null,
      pace: t.pace,
      effectiveFieldGoalPct: pctFrom100(t.teamStats.fourFactors.effectiveFieldGoalPct),
      turnoversPerGame: perGame(t.teamStats.turnovers.total, t.games),
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
    const g = p.games;

    out.push({
      athleteId: String(p.athleteId),
      firstName,
      lastName: rest.join(" "),
      teamSchool: p.team,
      season: p.season,
      gamesPlayed: g,
      pointsPerGame: perGame(p.points, g),
      reboundsPerGame: perGame(p.rebounds.total, g),
      assistsPerGame: perGame(p.assists, g),
      stealsPerGame: perGame(p.steals, g),
      blocksPerGame: perGame(p.blocks, g),
      minutesPerGame: perGame(p.minutes, g),
      turnoversPerGame: perGame(p.turnovers, g),
      foulsPerGame: perGame(p.fouls, g),
      offensiveReboundsPerGame: perGame(p.rebounds.offensive, g),
      defensiveReboundsPerGame: perGame(p.rebounds.defensive, g),
      fieldGoalPct: pctFrom100(p.fieldGoals.pct),
      fieldGoalsMade: p.fieldGoals.made,
      fieldGoalsAttempted: p.fieldGoals.attempted,
      threePointPct: pctFrom100(p.threePointFieldGoals.pct),
      threePointMade: p.threePointFieldGoals.made,
      threePointAttempted: p.threePointFieldGoals.attempted,
      freeThrowPct: pctFrom100(p.freeThrows.pct),
      freeThrowsMade: p.freeThrows.made,
      freeThrowsAttempted: p.freeThrows.attempted,
      usage: p.usage,
      offensiveRating: p.offensiveRating,
      defensiveRating: p.defensiveRating,
      netRating: p.netRating,
      effectiveFieldGoalPct: pctFrom100(p.effectiveFieldGoalPct),
      trueShootingPct: p.trueShootingPct,
      winShares: p.winShares.total,
    });
  }
  return out;
}
