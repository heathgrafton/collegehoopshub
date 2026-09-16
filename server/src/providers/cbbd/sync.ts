import { prisma } from "../../prisma";
import { cbbdClient } from "./client";
import { mapPlayerSeasonStats, mapRecruits, mapTeamSeasonStats, mapTransfers, type NormalizedPlayerMove } from "./mappers";

const CURRENT_SEASON = new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear();

// The portal/recruiting endpoints label rows by calendar year, not the
// +1-shifted "season" convention above (verified live: 2026 already has data
// for both, 2027 doesn't exist yet).
const CURRENT_RECRUITING_YEAR = new Date().getFullYear();

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * CBBD doesn't share ESPN's team/player ids, so the first sync matches its
 * records to our existing Team/Player rows by normalized name (those rows
 * need to exist already — run the ESPN sync, or the mock seed, first).
 * Once matched, the CBBD id is cached on `cbbdId` so future syncs are a
 * direct lookup instead of a name match.
 */
async function buildTeamLookup() {
  const teams = await prisma.team.findMany();
  const byCbbdId = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const t of teams) {
    if (t.cbbdId) byCbbdId.set(t.cbbdId, t.id);
    byName.set(normalizeName(t.shortName), t.id);
    byName.set(normalizeName(t.name), t.id);
  }
  return { byCbbdId, byName };
}

function resolveTeamId(
  lookup: { byCbbdId: Map<string, string>; byName: Map<string, string> },
  cbbdTeamId: string | undefined,
  teamSchool: string
): string | undefined {
  if (cbbdTeamId && lookup.byCbbdId.has(cbbdTeamId)) return lookup.byCbbdId.get(cbbdTeamId);
  return lookup.byName.get(normalizeName(teamSchool));
}

/** Fills TeamSeasonStat's advanced fields (PPG, adjusted efficiency, SOS, ...). */
export async function syncTeamSeasonStats(season: number = CURRENT_SEASON) {
  const raw = await cbbdClient.fetchTeamSeasonStats(season);
  const stats = mapTeamSeasonStats(raw);
  console.log(`[cbbd] syncing season stats for ${stats.length} teams`);

  const lookup = await buildTeamLookup();
  let matched = 0;
  let skipped = 0;

  for (const s of stats) {
    const teamId = resolveTeamId(lookup, undefined, s.teamSchool);
    if (!teamId) {
      skipped++;
      continue;
    }
    matched++;

    await prisma.teamSeasonStat.upsert({
      where: { teamId_season: { teamId, season: s.season } },
      create: {
        teamId,
        season: s.season,
        wins: s.wins,
        losses: s.losses,
        conferenceWins: 0,
        conferenceLosses: 0,
        pointsPerGame: s.pointsPerGame,
        opponentPointsPerGame: s.opponentPointsPerGame,
        reboundsPerGame: s.reboundsPerGame,
        assistsPerGame: s.assistsPerGame,
        netRating: s.netRating,
        strengthOfSchedule: s.strengthOfSchedule,
      },
      // Win/loss record is owned by the ESPN standings/scoreboard sync,
      // which stays fresher during the season — only advanced stats here.
      update: {
        pointsPerGame: s.pointsPerGame,
        opponentPointsPerGame: s.opponentPointsPerGame,
        reboundsPerGame: s.reboundsPerGame,
        assistsPerGame: s.assistsPerGame,
        netRating: s.netRating,
        strengthOfSchedule: s.strengthOfSchedule,
      },
    });
  }

  if (skipped > 0) {
    console.warn(
      `[cbbd] could not match ${skipped} team(s) by name — run the ESPN/mock team sync first, or inspect naming mismatches`
    );
  }
  console.log(`[cbbd] team season stats sync complete (${matched} matched)`);
}

/** Creates/updates PlayerSeasonStat rows, matching CBBD athletes to existing Player rows by name + team. */
export async function syncPlayerSeasonStats(season: number = CURRENT_SEASON) {
  const raw = await cbbdClient.fetchPlayerSeasonStats(season);
  const stats = mapPlayerSeasonStats(raw);
  console.log(`[cbbd] syncing season stats for ${stats.length} players`);

  const teamLookup = await buildTeamLookup();
  let matched = 0;
  let skipped = 0;

  for (const s of stats) {
    const teamId = resolveTeamId(teamLookup, undefined, s.teamSchool);
    if (!teamId) {
      skipped++;
      continue;
    }

    let player = await prisma.player.findUnique({ where: { cbbdId: s.athleteId } });
    if (!player) {
      const candidates = await prisma.player.findMany({ where: { teamId } });
      player =
        candidates.find(
          (p) => normalizeName(`${p.firstName}${p.lastName}`) === normalizeName(`${s.firstName}${s.lastName}`)
        ) ?? null;
      if (player && !player.cbbdId) {
        player = await prisma.player.update({ where: { id: player.id }, data: { cbbdId: s.athleteId } });
      }
    }

    if (!player) {
      skipped++;
      continue;
    }
    matched++;

    await prisma.playerSeasonStat.upsert({
      where: { playerId_season: { playerId: player.id, season: s.season } },
      create: {
        playerId: player.id,
        season: s.season,
        gamesPlayed: s.gamesPlayed,
        pointsPerGame: s.pointsPerGame ?? 0,
        reboundsPerGame: s.reboundsPerGame ?? 0,
        assistsPerGame: s.assistsPerGame ?? 0,
        stealsPerGame: s.stealsPerGame ?? 0,
        blocksPerGame: s.blocksPerGame ?? 0,
        minutesPerGame: s.minutesPerGame ?? 0,
        fieldGoalPct: s.fieldGoalPct ?? 0,
        threePointPct: s.threePointPct ?? 0,
        freeThrowPct: s.freeThrowPct ?? 0,
      },
      update: {
        gamesPlayed: s.gamesPlayed,
        pointsPerGame: s.pointsPerGame ?? 0,
        reboundsPerGame: s.reboundsPerGame ?? 0,
        assistsPerGame: s.assistsPerGame ?? 0,
        stealsPerGame: s.stealsPerGame ?? 0,
        blocksPerGame: s.blocksPerGame ?? 0,
        minutesPerGame: s.minutesPerGame ?? 0,
        fieldGoalPct: s.fieldGoalPct ?? 0,
        threePointPct: s.threePointPct ?? 0,
        freeThrowPct: s.freeThrowPct ?? 0,
      },
    });
  }

  if (skipped > 0) {
    console.warn(
      `[cbbd] could not match ${skipped} player(s) by name+team — run the ESPN/mock roster sync first, or inspect naming mismatches`
    );
  }
  console.log(`[cbbd] player season stats sync complete (${matched} matched)`);
}

/** Upserts transfer-portal moves and recruiting commitments, matching a destination team when one exists. */
export async function syncPlayerMoves(year: number = CURRENT_RECRUITING_YEAR) {
  const [rawTransfers, rawRecruits] = await Promise.all([
    cbbdClient.fetchPortalTransfers(year),
    cbbdClient.fetchRecruits(year),
  ]);
  const moves: NormalizedPlayerMove[] = [...mapTransfers(rawTransfers), ...mapRecruits(rawRecruits)];
  console.log(`[cbbd] syncing ${moves.length} player moves (${rawTransfers.length} transfers, ${rawRecruits.length} commitments)`);

  const lookup = await buildTeamLookup();
  let matched = 0;

  for (const m of moves) {
    const destinationTeamId = m.destinationName ? resolveTeamId(lookup, undefined, m.destinationName) : undefined;
    if (destinationTeamId) matched++;

    await prisma.playerMove.upsert({
      where: { cbbdId: m.cbbdId },
      create: {
        cbbdId: m.cbbdId,
        type: m.type,
        year: m.year,
        playerName: m.playerName,
        position: m.position,
        stars: m.stars,
        rating: m.rating,
        originName: m.originName,
        originConference: m.originConference,
        destinationName: m.destinationName,
        destinationConference: m.destinationConference,
        destinationTeamId: destinationTeamId ?? null,
      },
      update: {
        stars: m.stars,
        rating: m.rating,
        destinationName: m.destinationName,
        destinationConference: m.destinationConference,
        destinationTeamId: destinationTeamId ?? null,
      },
    });
  }

  console.log(`[cbbd] player moves sync complete (${matched} matched to a team)`);
}

export async function syncAll(season: number = CURRENT_SEASON) {
  await syncTeamSeasonStats(season);
  await syncPlayerSeasonStats(season);
  await syncPlayerMoves();
}
