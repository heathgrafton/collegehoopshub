import { Router } from "express";
import { prisma } from "../prisma";

export const playerMovesRouter = Router();

playerMovesRouter.get("/", async (req, res) => {
  const { type, team } = req.query as { type?: string; team?: string };

  const moves = await prisma.playerMove.findMany({
    where: {
      type: type ? type : undefined,
      destinationTeamId: team ? team : undefined,
    },
    include: { destinationTeam: true },
    orderBy: [{ syncedAt: "desc" }, { rating: "desc" }],
    take: 200,
  });

  res.json({
    moves: moves.map((m) => ({
      id: m.id,
      type: m.type,
      year: m.year,
      playerName: m.playerName,
      position: m.position,
      stars: m.stars,
      rating: m.rating,
      origin: m.originName ? { name: m.originName, conference: m.originConference } : null,
      destination: m.destinationName ? { name: m.destinationName, conference: m.destinationConference } : null,
      destinationTeam: m.destinationTeam
        ? {
            id: m.destinationTeam.id,
            shortName: m.destinationTeam.shortName,
            primaryColor: m.destinationTeam.primaryColor,
            logoUrl: m.destinationTeam.logoUrl,
          }
        : null,
    })),
  });
});
