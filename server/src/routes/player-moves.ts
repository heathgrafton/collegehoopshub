import { Router } from "express";
import { prisma } from "../prisma";
import { projectLatLng } from "../mapProjection";

export const playerMovesRouter = Router();

type MapSchool = {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  logoUrl: string | null;
  x: number;
  y: number;
  arrivals: { id: string; playerName: string; position: string | null; stars: number | null; originName: string | null }[];
  departures: { id: string; playerName: string; position: string | null; stars: number | null; destinationName: string | null }[];
};

/**
 * Every transfer attributed to a school (as origin or destination) that's
 * geocoded, so tapping a school on the map shows its full arrivals/departures
 * list — not just the subset where the OTHER end also happened to match a
 * team, which is a stricter requirement than a single school's own data needs.
 */
playerMovesRouter.get("/map", async (_req, res) => {
  const moves = await prisma.playerMove.findMany({
    where: {
      type: "transfer",
      OR: [{ originTeamId: { not: null } }, { destinationTeamId: { not: null } }],
    },
    include: { originTeam: true, destinationTeam: true },
  });

  const schools = new Map<string, MapSchool>();

  function schoolFor(team: NonNullable<(typeof moves)[number]["originTeam"]>): MapSchool | null {
    if (team.latitude === null || team.longitude === null) return null;
    let school = schools.get(team.id);
    if (!school) {
      const xy = projectLatLng(team.latitude, team.longitude);
      if (!xy) return null;
      school = {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        primaryColor: team.primaryColor,
        logoUrl: team.logoUrl,
        x: xy.x,
        y: xy.y,
        arrivals: [],
        departures: [],
      };
      schools.set(team.id, school);
    }
    return school;
  }

  const lines: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];

  for (const m of moves) {
    const originSchool = m.originTeam ? schoolFor(m.originTeam) : null;
    const destSchool = m.destinationTeam ? schoolFor(m.destinationTeam) : null;

    if (originSchool) {
      originSchool.departures.push({
        id: m.id,
        playerName: m.playerName,
        position: m.position,
        stars: m.stars,
        destinationName: m.destinationName,
      });
    }
    if (destSchool) {
      destSchool.arrivals.push({
        id: m.id,
        playerName: m.playerName,
        position: m.position,
        stars: m.stars,
        originName: m.originName,
      });
    }
    if (originSchool && destSchool) {
      lines.push({ id: m.id, x1: originSchool.x, y1: originSchool.y, x2: destSchool.x, y2: destSchool.y });
    }
  }

  // Lines are purely decorative (each school's own arrivals/departures list
  // already has the full detail) — capping keeps the SVG from drawing 700+
  // overlapping strokes, which was a real source of lag on the phone.
  const cappedLines = lines.slice(0, 300);

  res.json({
    viewBox: { width: 975, height: 610 },
    schools: Array.from(schools.values()),
    lines: cappedLines,
  });
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
