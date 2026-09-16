/**
 * Smoke test for the ESPN mappers against hand-built fixtures that
 * approximate real response shapes (see mappers.ts / types.ts for the
 * caveat: these shapes are reconstructed from memory, not verified against
 * a live call, since this dev sandbox has no network access to ESPN).
 *
 * This catches mapper bugs (wrong field paths, broken logic) but can't
 * catch "the real API doesn't actually look like this." Run
 * `npm run sync:espn` from a machine with real internet access to find
 * those, and update the fixtures/mappers to match what comes back.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mapConferences, mapNews, mapRoster, mapScoreboard, mapTeamsFromStandings } from "../mappers";
import type { EspnNewsResponse, EspnRosterResponse, EspnScoreboardResponse, EspnStandingsResponse } from "../types";

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(__dirname, name), "utf-8")) as T;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function main() {
  const standings = loadFixture<EspnStandingsResponse>("standings.json");
  const conferences = mapConferences(standings);
  assert(conferences.length === 2, `expected 2 conferences, got ${conferences.length}`);
  assert(conferences[0].name === "Atlantic Coast Conference", "conference name mismatch");
  assert(conferences[0].shortName === "ACC", "conference shortName mismatch");

  const teams = mapTeamsFromStandings(standings);
  assert(teams.length === 3, `expected 3 teams, got ${teams.length}`);
  const duke = teams.find((t) => t.espnId === "150");
  assert(!!duke, "Duke not found in mapped teams");
  assert(duke!.name === "Duke Blue Devils", "Duke name mismatch");
  assert(duke!.record.wins === 21 && duke!.record.losses === 4, "Duke record mismatch");
  assert(duke!.record.conferenceWins === 12 && duke!.record.conferenceLosses === 3, "Duke conf record mismatch");
  assert(duke!.primaryColor === "#003087", `Duke color mismatch: ${duke!.primaryColor}`);
  console.log("standings mapping OK:", conferences.length, "conferences,", teams.length, "teams");

  const scoreboard = loadFixture<EspnScoreboardResponse>("scoreboard.json");
  const games = mapScoreboard(scoreboard);
  assert(games.length === 2, `expected 2 games, got ${games.length}`);
  const liveGame = games.find((g) => g.espnId === "401585865");
  assert(!!liveGame, "live game not found");
  assert(liveGame!.status === "live", `expected live status, got ${liveGame!.status}`);
  assert(liveGame!.homeTeamEspnId === "153" && liveGame!.awayTeamEspnId === "150", "game team mapping mismatch");
  assert(liveGame!.homeScore === 64 && liveGame!.awayScore === 62, "game score mismatch");
  const scheduledGame = games.find((g) => g.espnId === "401585900");
  assert(scheduledGame!.status === "scheduled", "expected scheduled status");
  console.log("scoreboard mapping OK:", games.length, "games");

  const roster = loadFixture<EspnRosterResponse>("roster.json");
  const players = mapRoster(roster);
  assert(players.length === 2, `expected 2 players, got ${players.length}`);
  const flagg = players.find((p) => p.espnId === "5107157");
  assert(!!flagg, "Cooper Flagg not found in mapped roster");
  assert(flagg!.firstName === "Cooper" && flagg!.lastName === "Flagg", "player name mismatch");
  assert(flagg!.classYear === "Fr", `expected classYear Fr, got ${flagg!.classYear}`);
  assert(flagg!.hometown === "Newport, ME", `hometown mismatch: ${flagg!.hometown}`);
  console.log("roster mapping OK:", players.length, "players");

  const news = loadFixture<EspnNewsResponse>("news.json");
  const articles = mapNews(news);
  assert(articles.length === 2, `expected 2 articles, got ${articles.length}`);
  assert(articles[0].teamEspnIds.includes("150"), "expected first article linked to team 150");
  assert(articles[1].teamEspnIds.length === 0, "expected second article to have no team link");
  console.log("news mapping OK:", articles.length, "articles");

  console.log("\nAll ESPN mapper fixture checks passed.");
}

main();
