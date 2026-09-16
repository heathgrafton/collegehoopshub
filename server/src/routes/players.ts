import { Router } from "express";
import { prisma } from "../prisma";

export const playersRouter = Router();
const CURRENT_SEASON = 2026;

playersRouter.get("/", async (req, res) => {
  const { team, conference, search } = req.query as { team?: string; conference?: string; search?: string };

  const players = await prisma.player.findMany({
    where: {
      teamId: team ? team : undefined,
      team: conference ? { conference: { name: conference } } : undefined,
      OR: search
        ? [{ firstName: { contains: search } }, { lastName: { contains: search } }]
        : undefined,
    },
    include: {
      team: { include: { conference: true } },
      seasonStats: { where: { season: CURRENT_SEASON } },
    },
    orderBy: { lastName: "asc" },
  });

  res.json({
    players: players.map((p) => {
      const stat = p.seasonStats[0];
      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        jerseyNumber: p.jerseyNumber,
        position: p.position,
        classYear: p.classYear,
        team: {
          id: p.team.id,
          name: p.team.name,
          shortName: p.team.shortName,
          primaryColor: p.team.primaryColor,
          conference: { id: p.team.conference.id, name: p.team.conference.name, shortName: p.team.conference.shortName },
        },
        pointsPerGame: stat?.pointsPerGame ?? null,
        reboundsPerGame: stat?.reboundsPerGame ?? null,
        assistsPerGame: stat?.assistsPerGame ?? null,
      };
    }),
  });
});

playersRouter.get("/:id", async (req, res) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: {
      team: { include: { conference: true } },
      seasonStats: { where: { season: CURRENT_SEASON } },
    },
  });

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const stat = player.seasonStats[0];

  res.json({
    player: {
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      heightInches: player.heightInches,
      classYear: player.classYear,
      hometown: player.hometown,
      team: {
        id: player.team.id,
        name: player.team.name,
        shortName: player.team.shortName,
        primaryColor: player.team.primaryColor,
        conference: { id: player.team.conference.id, name: player.team.conference.name },
      },
      seasonStats: stat
        ? {
            gamesPlayed: stat.gamesPlayed,
            pointsPerGame: stat.pointsPerGame,
            reboundsPerGame: stat.reboundsPerGame,
            assistsPerGame: stat.assistsPerGame,
            stealsPerGame: stat.stealsPerGame,
            blocksPerGame: stat.blocksPerGame,
            minutesPerGame: stat.minutesPerGame,
            fieldGoalPct: stat.fieldGoalPct,
            threePointPct: stat.threePointPct,
            freeThrowPct: stat.freeThrowPct,
          }
        : null,
    },
  });
});
