/**
 * Types for CollegeBasketballData.com's REST API (api.collegebasketballdata.com).
 * CbbdTeam/CbbdConference below are unverified guesses and currently unused
 * (fetchTeams/fetchConferences are dead code — nothing calls them). Everything
 * from CbbdTeamSeasonStat onward is checked against the live OpenAPI spec and
 * live sample responses (2026-09-16) — see the per-type notes.
 */

export type CbbdTeam = {
  id?: number;
  school?: string;
  mascot?: string;
  abbreviation?: string;
  displayName?: string;
  shortDisplayName?: string;
  primaryColor?: string;
  currentCity?: string;
  currentState?: string;
  conferenceId?: number;
  conference?: string;
};

export type CbbdConference = {
  id?: number;
  name?: string;
  abbreviation?: string;
  shortName?: string;
};

// Verified against CBBD's live OpenAPI spec (api.collegebasketballdata.com/api-docs.json)
// on 2026-09-16: /stats/team/season and /stats/player/season return season
// TOTALS (not per-game averages) — the mapper divides by `games` itself.
type CbbdShootingSplit = { made: number | null; attempted: number | null; pct: number | null };
type CbbdReboundSplit = { total: number | null; offensive: number | null; defensive: number | null };

export type CbbdTeamSeasonUnitStats = {
  fieldGoals: CbbdShootingSplit;
  twoPointFieldGoals: CbbdShootingSplit;
  threePointFieldGoals: CbbdShootingSplit;
  freeThrows: CbbdShootingSplit;
  rebounds: CbbdReboundSplit;
  turnovers: { total: number | null; teamTotal: number | null };
  fouls: { total: number | null; technical: number | null; flagrant: number | null };
  points: { total: number | null; inPaint: number | null; offTurnovers: number | null; fastBreak: number | null };
  fourFactors: {
    effectiveFieldGoalPct: number | null;
    turnoverRatio: number | null;
    offensiveReboundPct: number | null;
    freeThrowRate: number | null;
  };
  assists: number | null;
  blocks: number | null;
  steals: number | null;
  possessions: number | null;
  rating: number | null;
  trueShooting: number | null;
};

export type CbbdTeamSeasonStat = {
  season: number;
  teamId: number;
  team: string;
  conference: string | null;
  games: number;
  wins: number;
  losses: number;
  pace: number | null;
  teamStats: CbbdTeamSeasonUnitStats;
  opponentStats: CbbdTeamSeasonUnitStats;
};

// Verified against CBBD's live OpenAPI spec (api.collegebasketballdata.com/api-docs.json)
// on 2026-09-16, unlike the other shapes in this file — these field names are confirmed.
export type CbbdTeamRef = { id: number | null; name: string | null; conference: string | null };

export type CbbdTransfer = {
  id: number;
  year: number;
  firstName: string;
  lastName: string;
  position: string;
  origin: CbbdTeamRef | null;
  destination: CbbdTeamRef | null;
  stars: number | null;
  rating: number | null;
};

export type CbbdRecruit = {
  id: number;
  year: number;
  name: string;
  position: string | null;
  school: string | null;
  committedTo: CbbdTeamRef | null;
  stars: number;
  rating: number;
  ranking: number | null;
};

export type CbbdPlayerSeasonStat = {
  season: number;
  athleteId: number;
  name: string;
  team: string;
  position: string;
  games: number;
  minutes: number;
  points: number | null;
  turnovers: number | null;
  fouls: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  usage: number | null;
  offensiveRating: number | null;
  defensiveRating: number | null;
  netRating: number | null;
  effectiveFieldGoalPct: number | null;
  trueShootingPct: number | null;
  fieldGoals: CbbdShootingSplit;
  threePointFieldGoals: CbbdShootingSplit;
  freeThrows: CbbdShootingSplit;
  rebounds: CbbdReboundSplit;
  winShares: { total: number | null; offensive: number | null; defensive: number | null; totalPer40: number | null };
};
