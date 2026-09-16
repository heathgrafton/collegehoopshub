import { Router } from "express";
import { prisma } from "../prisma";

export const scoreboardRouter = Router();

function serializeTeam(team: { id: string; name: string; shortName: string; primaryColor: string; logoUrl: string | null }) {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    primaryColor: team.primaryColor,
    logoUrl: team.logoUrl,
  };
}

scoreboardRouter.get("/", async (_req, res) => {
  const games = await prisma.game.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ status: "asc" }, { startTime: "asc" }],
  });

  // live games first, then scheduled (soonest first), then final
  const statusOrder: Record<string, number> = { live: 0, scheduled: 1, final: 2 };
  games.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  res.json({
    games: games.map((g) => ({
      id: g.id,
      status: g.status,
      period: g.period,
      clock: g.clock,
      startTime: g.startTime,
      venue: g.venue,
      broadcast: g.broadcast,
      homeTeam: { ...serializeTeam(g.homeTeam), score: g.homeScore },
      awayTeam: { ...serializeTeam(g.awayTeam), score: g.awayScore },
    })),
  });
});
