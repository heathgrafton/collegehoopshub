import { Router } from "express";
import { prisma } from "../prisma";
import { projectLatLng } from "../mapProjection";

export const playerMovesRouter = Router();

/**
 * Transfers only (commitments have a high school origin, not a college one —
 * there's no second campus to draw a line to) where both the origin and
 * destination team are matched AND geocoded, projected to map x/y so the
 * mobile app just draws points/lines without needing any projection math.
 */
playerMovesRouter.get("/map", async (_req, res) => {
  const moves = await prisma.playerMove.findMany({
    where: {
      type: "transfer",
      originTeamId: { not: null },
      destinationTeamId: { not: null },
      originTeam: { latitude: { not: null }, longitude: { not: null } },
      destinationTeam: { latitude: { not: null }, longitude: { not: null } },
    },
    include: { originTeam: true, destinationTeam: true },
    orderBy: { syncedAt: "desc" },
    take: 500,
  });

  const points = moves
    .map((m) => {
      const origin = m.originTeam!;
      const destination = m.destinationTeam!;
      const originXY = projectLatLng(origin.latitude!, origin.longitude!);
      const destXY = projectLatLng(destination.latitude!, destination.longitude!);
      if (!originXY || !destXY) return null;
      return {
        id: m.id,
        playerName: m.playerName,
        position: m.position,
        stars: m.stars,
        origin: { id: origin.id, name: origin.name, shortName: origin.shortName, x: originXY.x, y: originXY.y },
        destination: {
          id: destination.id,
          name: destination.name,
          shortName: destination.shortName,
          primaryColor: destination.primaryColor,
          x: destXY.x,
          y: destXY.y,
        },
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  res.json({ viewBox: { width: 975, height: 610 }, moves: points });
});

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
