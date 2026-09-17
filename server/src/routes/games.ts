import { Router } from "express";
import { prisma } from "../prisma";

export const gamesRouter = Router();
const CURRENT_SEASON = new Date().getFullYear();

function serializeTeam(team: { id: string; name: string; shortName: string; primaryColor: string; logoUrl: string | null }) {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    primaryColor: team.primaryColor,
    logoUrl: team.logoUrl,
  };
}

async function teamPanel(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      seasonStats: { where: { season: CURRENT_SEASON } },
      players: {
        include: { seasonStats: { where: { season: CURRENT_SEASON } } },
      },
    },
  });
  if (!team) return null;

  const stat = team.seasonStats[0];
  const topPerformers = team.players
    .map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      position: p.position,
      photoUrl: p.photoUrl,
      pointsPerGame: p.seasonStats[0]?.pointsPerGame ?? null,
      reboundsPerGame: p.seasonStats[0]?.reboundsPerGame ?? null,
      assistsPerGame: p.seasonStats[0]?.assistsPerGame ?? null,
    }))
    .filter((p) => p.pointsPerGame !== null)
    .sort((a, b) => (b.pointsPerGame ?? 0) - (a.pointsPerGame ?? 0))
    .slice(0, 3);

  return {
    ...serializeTeam(team),
    record: stat ? { wins: stat.wins, losses: stat.losses } : null,
    seasonStats: stat
      ? {
          pointsPerGame: stat.pointsPerGame,
          opponentPointsPerGame: stat.opponentPointsPerGame,
          reboundsPerGame: stat.reboundsPerGame,
          assistsPerGame: stat.assistsPerGame,
          netRating: stat.netRating,
          pace: stat.pace,
          effectiveFieldGoalPct: stat.effectiveFieldGoalPct,
          turnoversPerGame: stat.turnoversPerGame,
        }
      : null,
    topPerformers,
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

  const [homePanel, awayPanel] = await Promise.all([teamPanel(g.homeTeamId), teamPanel(g.awayTeamId)]);

  res.json({
    game: {
      id: g.id,
      status: g.status,
      period: g.period,
      clock: g.clock,
      startTime: g.startTime,
      venue: g.venue,
      broadcast: g.broadcast,
      homeTeam: { ...homePanel!, score: g.homeScore },
      awayTeam: { ...awayPanel!, score: g.awayScore },
    },
  });
});
