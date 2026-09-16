import { Router } from "express";
import { prisma } from "../prisma";

export const gamesRouter = Router();

function serializeTeam(team: { id: string; name: string; shortName: string; primaryColor: string; logoUrl: string | null }) {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    primaryColor: team.primaryColor,
    logoUrl: team.logoUrl,
  };
}

gamesRouter.get("/:id", async (req, res) => {
  const g = await prisma.game.findUnique({
    where: { id: req.params.id },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!g) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  res.json({
    game: {
      id: g.id,
      status: g.status,
      period: g.period,
      clock: g.clock,
      startTime: g.startTime,
      venue: g.venue,
      broadcast: g.broadcast,
      homeTeam: { ...serializeTeam(g.homeTeam), score: g.homeScore },
      awayTeam: { ...serializeTeam(g.awayTeam), score: g.awayScore },
    },
  });
});
