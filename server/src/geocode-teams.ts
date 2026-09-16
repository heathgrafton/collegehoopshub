/**
 * One-time backfill: geocodes each team's city/state to lat/lng via
 * OpenStreetMap's Nominatim (free, no API key). Nominatim's usage policy caps
 * this at 1 request/second and asks for an identifying User-Agent — this
 * script does both. Safe to re-run: only teams missing coordinates are
 * queried, so a partial/interrupted run just picks up where it left off.
 */
import { prisma } from "./prisma";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "CollegeHoopsHub-dev/1.0 (local one-time geocode script, no public deployment)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(city: string, state: string): Promise<{ lat: number; lon: number } | null> {
  const qs = new URLSearchParams({ format: "json", limit: "1", q: `${city}, ${state}, USA` });
  const res = await fetch(`${NOMINATIM_URL}?${qs.toString()}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return null;
  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) return null;
  return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
}

async function main() {
  const teams = await prisma.team.findMany({ where: { latitude: null } });
  console.log(`[geocode] ${teams.length} team(s) missing coordinates`);

  let geocoded = 0;
  let missed = 0;

  for (const team of teams) {
    if (!team.city || !team.state) {
      missed++;
      continue;
    }
    try {
      const result = await geocode(team.city, team.state);
      if (!result) {
        console.warn(`[geocode] no match for ${team.name} (${team.city}, ${team.state})`);
        missed++;
      } else {
        await prisma.team.update({
          where: { id: team.id },
          data: { latitude: result.lat, longitude: result.lon },
        });
        geocoded++;
      }
    } catch (err) {
      console.warn(`[geocode] failed for ${team.name}: ${(err as Error).message}`);
      missed++;
    }
    await sleep(1100);
  }

  console.log(`[geocode] done — ${geocoded} geocoded, ${missed} missed`);
}

main()
  .catch((err) => {
    console.error("[geocode] fatal:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
