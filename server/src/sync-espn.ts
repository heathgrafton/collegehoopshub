/**
 * Full ESPN sync: conferences, teams, records, rosters, today's scoreboard,
 * and news. Run this once to populate a fresh DB, and periodically after
 * (e.g. daily) to pick up roster/conference changes. For frequent live-score
 * updates during game windows, use `npm run sync:scoreboard` instead — it's
 * much cheaper than a full sync.
 */
import { syncAll } from "./providers/espn/sync";
import { prisma } from "./prisma";

syncAll()
  .then(() => {
    console.log("[espn] full sync done");
  })
  .catch((err) => {
    console.error("[espn] full sync failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
