/**
 * One-time backfill: geocodes each team to lat/lng via OpenStreetMap's
 * Nominatim (free, no API key). Nominatim's usage policy caps this at 1
 * request/second and asks for an identifying User-Agent — this script does
 * both. Tries the team's actual arena name first (e.g. "Charles E. Smith
 * Center, Washington, DC") since city-level geocoding puts every school in
 * the same city at one identical point — Philadelphia alone has 5 D-I
 * programs that would otherwise stack exactly on top of each other on the
 * map. Falls back to city/state if the venue can't be found.
 *
 * Pass --force to re-geocode teams that already have coordinates (used once
 * to upgrade everyone from the original city-level pass to venue precision).
 * Without it, only teams missing coordinates are queried, so a partial run
 * just picks up where it left off.
 */
import { prisma } from "./prisma";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "CollegeHoopsHub-dev/1.0 (local one-time geocode script, no public deployment)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  const qs = new URLSearchParams({ format: "json", limit: "1", q: query });
  const res = await fetch(`${NOMINATIM_URL}?${qs.toString()}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return null;
  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) return null;
  return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
}

async function main() {
  const force = process.argv.includes("--force");
  const teams = await prisma.team.findMany({ where: force ? {} : { latitude: null } });
  console.log(`[geocode] ${teams.length} team(s) to process${force ? " (--force: including already-geocoded)" : ""}`);

  let geocodedByVenue = 0;
  let geocodedByCity = 0;
  let missed = 0;

  for (const team of teams) {
    if (!team.city || !team.state) {
      missed++;
      continue;
    }
    try {
      let result: { lat: number; lon: number } | null = null;

      if (team.venueName) {
        result = await geocode(`${team.venueName}, ${team.city}, ${team.state}, USA`);
        await sleep(1100);
        if (result) geocodedByVenue++;
      }

      if (!result) {
        result = await geocode(`${team.city}, ${team.state}, USA`);
        await sleep(1100);
        if (result) geocodedByCity++;
      }

      if (!result) {
        console.warn(`[geocode] no match for ${team.name} (${team.venueName ?? "no venue"}, ${team.city}, ${team.state})`);
        missed++;
        continue;
      }

      await prisma.team.update({
        where: { id: team.id },
        data: { latitude: result.lat, longitude: result.lon },
      });
    } catch (err) {
      console.warn(`[geocode] failed for ${team.name}: ${(err as Error).message}`);
      missed++;
    }
  }

  console.log(`[geocode] done — ${geocodedByVenue} by venue, ${geocodedByCity} by city fallback, ${missed} missed`);
}

main()
  .catch((err) => {
    console.error("[geocode] fatal:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
