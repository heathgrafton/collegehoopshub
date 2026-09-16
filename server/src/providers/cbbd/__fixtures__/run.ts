/**
 * Smoke test for the CBBD mappers against hand-built fixtures. Same caveat
 * as the ESPN fixtures: these approximate what CBBD returns based on
 * general knowledge of the API, not a verified live response (no network
 * access to CBBD from this sandbox). This catches mapper bugs; it can't
 * catch "the real API doesn't actually look like this." The fixtures
 * intentionally mix the nested (`{ perGame, total }`) and flat-number
 * forms a stat value might take, since that's the biggest unknown in
 * mappers.ts's `readPerGame`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mapPlayerSeasonStats, mapTeamSeasonStats } from "../mappers";
import type { CbbdPlayerSeasonStat, CbbdTeamSeasonStat } from "../types";

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(__dirname, name), "utf-8")) as T;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function main() {
  const teamStatsRaw = loadFixture<CbbdTeamSeasonStat[]>("team-season-stats.json");
  const teamStats = mapTeamSeasonStats(teamStatsRaw);
  assert(teamStats.length === 2, `expected 2 team stat rows, got ${teamStats.length}`);

  const duke = teamStats.find((t) => t.teamSchool === "Duke");
  assert(!!duke, "Duke not found in mapped team stats");
  assert(duke!.pointsPerGame === 81.2, `expected nested points.perGame to resolve to 81.2, got ${duke!.pointsPerGame}`);
  assert(duke!.wins === 21 && duke!.losses === 4, "Duke record mismatch");
  assert(duke!.netRating === 28.3, "Duke netRating mismatch");

  const flat = teamStats.find((t) => t.teamSchool === "Some Unmatched School");
  assert(!!flat, "flat-stat team not found");
  assert(flat!.pointsPerGame === 70.0, `expected flat-number points to resolve to 70.0, got ${flat!.pointsPerGame}`);
  console.log("team season stats mapping OK:", teamStats.length, "rows (nested + flat stat forms both handled)");

  const playerStatsRaw = loadFixture<CbbdPlayerSeasonStat[]>("player-season-stats.json");
  const playerStats = mapPlayerSeasonStats(playerStatsRaw);
  assert(playerStats.length === 2, `expected 2 player stat rows, got ${playerStats.length}`);

  const flagg = playerStats.find((p) => p.athleteId === "5107157");
  assert(!!flagg, "Cooper Flagg not found in mapped player stats");
  assert(flagg!.firstName === "Cooper" && flagg!.lastName === "Flagg", "player name split mismatch");
  assert(flagg!.pointsPerGame === 19.8, `expected nested points.perGame to resolve to 19.8, got ${flagg!.pointsPerGame}`);
  assert(flagg!.fieldGoalPct === 0.487, "field goal pct mismatch");

  const flatPlayer = playerStats.find((p) => p.athleteId === "9999999");
  assert(!!flatPlayer, "flat-stat player not found");
  assert(flatPlayer!.pointsPerGame === 5.0, `expected flat-number points to resolve to 5.0, got ${flatPlayer!.pointsPerGame}`);
  console.log("player season stats mapping OK:", playerStats.length, "rows (nested + flat stat forms both handled)");

  console.log("\nAll CBBD mapper fixture checks passed.");
}

main();
