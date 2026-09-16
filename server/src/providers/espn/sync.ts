import { prisma } from "../../prisma";
import { espnClient } from "./client";
import {
  mapConferences,
  mapNews,
  mapRoster,
  mapScoreboard,
  mapTeamsFromStandings,
} from "./mappers";

const CURRENT_SEASON = new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear();

/** Upserts every conference + team + current record from ESPN standings. */
export async function syncConferencesAndTeams(season?: number) {
  const raw = await espnClient.fetchStandings(season);
  const conferences = mapConferences(raw);
  const teams = mapTeamsFromStandings(raw);

  console.log(`[espn] syncing ${conferences.length} conferences, ${teams.length} teams`);

  const conferenceIdByEspnId = new Map<string, string>();
  for (const c of conferences) {
    const row = await prisma.conference.upsert({
      where: { espnId: c.espnId },
      create: { espnId: c.espnId, name: c.name, shortName: c.shortName },
      update: { name: c.name, shortName: c.shortName },
    });
    conferenceIdByEspnId.set(c.espnId, row.id);
  }

  let skipped = 0;
  for (const t of teams) {
    const conferenceId = conferenceIdByEspnId.get(t.conferenceEspnId);
    if (!conferenceId) {
      skipped++;
      continue;
    }
    const team = await prisma.team.upsert({
      where: { espnId: t.espnId },
      create: {
        espnId: t.espnId,
        name: t.name,
        shortName: t.shortName,
        nickname: t.nickname,
        city: t.city,
        state: t.state,
        primaryColor: t.primaryColor,
        conferenceId,
      },
      update: {
        name: t.name,
        shortName: t.shortName,
        nickname: t.nickname,
        primaryColor: t.primaryColor,
        conferenceId,
      },
    });

    await prisma.teamSeasonStat.upsert({
      where: { teamId_season: { teamId: team.id, season: season ?? CURRENT_SEASON } },
      create: {
        teamId: team.id,
        season: season ?? CURRENT_SEASON,
        wins: t.record.wins,
        losses: t.record.losses,
        conferenceWins: t.record.conferenceWins,
        conferenceLosses: t.record.conferenceLosses,
      },
      update: {
        wins: t.record.wins,
        losses: t.record.losses,
        conferenceWins: t.record.conferenceWins,
        conferenceLosses: t.record.conferenceLosses,
      },
    });
  }

  if (skipped > 0) {
    console.warn(`[espn] skipped ${skipped} team(s) with no matching conference`);
  }
  console.log("[espn] conferences + teams sync complete");
}

/** Upserts games (and their scores/status) for a given date, or today if omitted. */
export async function syncScoreboard(dateYYYYMMDD?: string) {
  const raw = await espnClient.fetchScoreboard(dateYYYYMMDD);
  const games = mapScoreboard(raw);
  console.log(`[espn] syncing ${games.length} games`);

  let skipped = 0;
  for (const g of games) {
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { espnId: g.homeTeamEspnId } }),
      prisma.team.findUnique({ where: { espnId: g.awayTeamEspnId } }),
    ]);
    if (!homeTeam || !awayTeam) {
      // Run syncConferencesAndTeams first — a game can't be linked to teams
      // that haven't been synced yet.
      skipped++;
      continue;
    }

    await prisma.game.upsert({
      where: { espnId: g.espnId },
      create: {
        espnId: g.espnId,
        season: CURRENT_SEASON,
        startTime: g.startTime,
        status: g.status,
        period: g.period,
        clock: g.clock,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        venue: g.venue,
        broadcast: g.broadcast,
      },
      update: {
        status: g.status,
        period: g.period,
        clock: g.clock,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
      },
    });
  }

  if (skipped > 0) {
    console.warn(`[espn] skipped ${skipped} game(s) with unknown teams — run team sync first`);
  }
  console.log("[espn] scoreboard sync complete");
}

/** Upserts roster bios for every team already in the DB (run team sync first). */
export async function syncRosters() {
  const teams = await prisma.team.findMany({ where: { espnId: { not: null } } });
  console.log(`[espn] syncing rosters for ${teams.length} teams`);

  for (const team of teams) {
    if (!team.espnId) continue;
    try {
      const raw = await espnClient.fetchTeamRoster(team.espnId);
      const players = mapRoster(raw);
      for (const p of players) {
        await prisma.player.upsert({
          where: { espnId: p.espnId },
          create: {
            espnId: p.espnId,
            teamId: team.id,
            firstName: p.firstName,
            lastName: p.lastName,
            jerseyNumber: p.jerseyNumber,
            position: p.position,
            heightInches: p.heightInches,
            classYear: p.classYear,
            hometown: p.hometown,
          },
          update: {
            teamId: team.id,
            firstName: p.firstName,
            lastName: p.lastName,
            jerseyNumber: p.jerseyNumber,
            position: p.position,
            heightInches: p.heightInches,
            classYear: p.classYear,
            hometown: p.hometown,
          },
        });
      }
    } catch (err) {
      console.warn(`[espn] failed to sync roster for team ${team.shortName} (${team.espnId}): ${(err as Error).message}`);
    }
  }
  console.log("[espn] roster sync complete");
}

/** Upserts recent news headlines, linking to a team when one is recognized. */
export async function syncNews() {
  const raw = await espnClient.fetchNews();
  const articles = mapNews(raw);
  console.log(`[espn] syncing ${articles.length} articles`);

  for (const a of articles) {
    let teamId: string | null = null;
    if (a.teamEspnIds.length > 0) {
      const team = await prisma.team.findUnique({ where: { espnId: a.teamEspnIds[0] } });
      teamId = team?.id ?? null;
    }

    await prisma.newsArticle.upsert({
      where: { espnId: a.espnId },
      create: {
        espnId: a.espnId,
        title: a.title,
        summary: a.summary,
        body: a.body,
        source: "ESPN",
        publishedAt: a.publishedAt,
        imageUrl: a.imageUrl,
        teamId,
      },
      update: {
        title: a.title,
        summary: a.summary,
        body: a.body,
        imageUrl: a.imageUrl,
        teamId,
      },
    });
  }
  console.log("[espn] news sync complete");
}

/** Full sync, in dependency order: conferences/teams -> rosters/scoreboard/news. */
export async function syncAll() {
  await syncConferencesAndTeams();
  await Promise.all([syncRosters(), syncScoreboard(), syncNews()]);
}
