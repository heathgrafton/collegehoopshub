/**
 * Loose types for CollegeBasketballData.com's REST API
 * (api.collegebasketballdata.com). Unlike ESPN's hidden API, CBBD publishes
 * an OpenAPI/Swagger spec — but this sandbox has no network access to
 * fetch and check it against, so these shapes are still reconstructed from
 * general knowledge (CBBD is built by the same author as
 * CollegeFootballData.com and follows a similar stats-endpoint convention)
 * rather than a verified live response. Confidence here is lower than the
 * ESPN types — expect to adjust field paths after the first real run.
 *
 * Every numeric stat field is typed as possibly nested (`{ perGame }`) or
 * flat, because it's genuinely unclear from memory which CBBD uses; see
 * mappers.ts's `readStat` helper, which tries both.
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

export type CbbdStatValue = number | { perGame?: number; total?: number } | undefined;

export type CbbdTeamSeasonStat = {
  season?: number;
  teamId?: number;
  team?: string;
  conference?: string;
  games?: number;
  wins?: number;
  losses?: number;
  points?: CbbdStatValue;
  opponentPoints?: CbbdStatValue;
  rebounds?: CbbdStatValue;
  assists?: CbbdStatValue;
  netRating?: number;
  offensiveRating?: number;
  defensiveRating?: number;
  strengthOfSchedule?: number;
  sos?: number;
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
  season?: number;
  athleteId?: number;
  name?: string;
  team?: string;
  position?: string;
  games?: number;
  minutes?: CbbdStatValue;
  points?: CbbdStatValue;
  rebounds?: CbbdStatValue;
  assists?: CbbdStatValue;
  steals?: CbbdStatValue;
  blocks?: CbbdStatValue;
  fieldGoalPct?: number;
  threePointPct?: number;
  freeThrowPct?: number;
  fieldGoals?: { pct?: number };
  threePointFieldGoals?: { pct?: number };
  freeThrows?: { pct?: number };
};
