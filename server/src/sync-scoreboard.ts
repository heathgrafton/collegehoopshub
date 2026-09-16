/**
 * Lightweight scoreboard-only sync — run this on a short interval (e.g.
 * every 30-60s via cron, a serverless schedule, or the --watch flag below)
 * during game windows to keep live scores current. Requires teams to
 * already exist (run `npm run sync:espn` at least once first).
 *
 * Usage:
 *   npm run sync:scoreboard            # one-off run
 *   npm run sync:scoreboard -- --watch # loop every 60s until killed
 */
import { syncScoreboard } from "./providers/espn/sync";
import { prisma } from "./prisma";

const watch = process.argv.includes("--watch");

async function runOnce() {
  try {
    await syncScoreboard();
  } catch (err) {
    console.error("[espn] scoreboard sync failed:", err);
  }
}

async function main() {
  await runOnce();
  if (watch) {
    console.log("[espn] watching for score updates every 60s (Ctrl+C to stop)");
    setInterval(runOnce, 60_000);
  } else {
    await prisma.$disconnect();
  }
}

main();
