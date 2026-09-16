import { Router } from "express";
import { prisma } from "../prisma";

export const playersRouter = Router();
const CURRENT_SEASON = 2026;

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
