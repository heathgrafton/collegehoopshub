/**
 * Syncs team and player season stats from CollegeBasketballData.com.
 * Requires CBBD_API_KEY in .env (free signup at collegebasketballdata.com)
 * and requires teams/players to already exist — run `npm run sync:espn`
 * (or the mock `npm run seed`) first, since this matches CBBD records to
 * existing rows by name rather than creating new teams/players.
 */
import { syncAll } from "./providers/cbbd/sync";
import { prisma } from "./prisma";

const seasonArg = process.argv.find((a) => a.startsWith("--season="));
const season = seasonArg ? Number(seasonArg.split("=")[1]) : undefined;

syncAll(season)
  .then(() => {
    console.log("[cbbd] sync done");
  })
  .catch((err) => {
    console.error("[cbbd] sync failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
