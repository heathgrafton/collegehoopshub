import { Router } from "express";
import { prisma } from "../prisma";

export const teamsRouter = Router();
const CURRENT_SEASON = 2026;

teamsRouter.get("/", async (req, res) => {
  const { conference, search } = req.query as { conference?: string; search?: string };

  const teams = await prisma.team.findMany({
    where: {
      conference: conference ? { name: conference } : undefined,
      name: search ? { contains: search } : undefined,
    },
    include: {
      conference: true,
      seasonStats: { where: { season: CURRENT_SEASON } },
    },
    orderBy: { name: "asc" },
  });

  res.json({
    teams: teams.map((t) => {
      const stat = t.seasonStats[0];
      return {
        id: t.id,
        name: t.name,
        shortName: t.shortName,
        nickname: t.nickname,
        primaryColor: t.primaryColor,
        conference: { id: t.conference.id, name: t.conference.name, shortName: t.conference.shortName },
        record: stat
          ? {
              wins: stat.wins,
              losses: stat.losses,
              conferenceWins: stat.conferenceWins,
              conferenceLosses: stat.conferenceLosses,
            }
          : null,
      };
    }),
  });
});

teamsRouter.get("/conferences", async (_req, res) => {
  const conferences = await prisma.conference.findMany({ orderBy: { name: "asc" } });
  res.json({ conferences });
});

teamsRouter.get("/:id", async (req, res) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      conference: true,
      seasonStats: { where: { season: CURRENT_SEASON } },
      players: {
        include: { seasonStats: { where: { season: CURRENT_SEASON } } },
        orderBy: { lastName: "asc" },
      },
    },
  });

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  const recentGames = await prisma.game.findMany({
    where: {
      status: "final",
      OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { startTime: "desc" },
    take: 5,
  });

  const upcomingGames = await prisma.game.findMany({
    where: {
      status: "scheduled",
      OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { startTime: "asc" },
    take: 5,
  });

  const stat = team.seasonStats[0];

  res.json({
    team: {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      nickname: team.nickname,
      city: team.city,
      state: team.state,
      primaryColor: team.primaryColor,
      conference: { id: team.conference.id, name: team.conference.name, shortName: team.conference.shortName },
      record: stat
        ? {
            wins: stat.wins,
            losses: stat.losses,
            conferenceWins: stat.conferenceWins,
            conferenceLosses: stat.conferenceLosses,
          }
        : null,
      seasonStats: stat
        ? {
            pointsPerGame: stat.pointsPerGame,
            opponentPointsPerGame: stat.opponentPointsPerGame,
            reboundsPerGame: stat.reboundsPerGame,
            assistsPerGame: stat.assistsPerGame,
            netRating: stat.netRating,
            strengthOfSchedule: stat.strengthOfSchedule,
          }
        : null,
      roster: team.players.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        jerseyNumber: p.jerseyNumber,
        position: p.position,
        classYear: p.classYear,
        pointsPerGame: p.seasonStats[0]?.pointsPerGame ?? null,
        reboundsPerGame: p.seasonStats[0]?.reboundsPerGame ?? null,
        assistsPerGame: p.seasonStats[0]?.assistsPerGame ?? null,
      })),
      recentGames: recentGames.map((g) => ({
        id: g.id,
        startTime: g.startTime,
        homeTeam: { id: g.homeTeam.id, shortName: g.homeTeam.shortName, score: g.homeScore },
        awayTeam: { id: g.awayTeam.id, shortName: g.awayTeam.shortName, score: g.awayScore },
      })),
      upcomingGames: upcomingGames.map((g) => ({
        id: g.id,
        startTime: g.startTime,
        venue: g.venue,
        broadcast: g.broadcast,
        homeTeam: { id: g.homeTeam.id, shortName: g.homeTeam.shortName },
        awayTeam: { id: g.awayTeam.id, shortName: g.awayTeam.shortName },
      })),
    },
  });
});
