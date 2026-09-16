# CollegeHoopsHub

A mobile app for Division I men's college basketball: live scores, news,
per-game and per-player chatrooms, full team/player stats, favorites, and a
March Madness bracketology tool with a weekly mock bracket.

This first pass builds the foundation: the app shell, live-style scoreboard,
team/player browsing, and stats — all running end-to-end against a real
backend and database. Chat, favorites, and bracketology are scaffolded in
the navigation and schema, with working previews where it made sense, but
are not fully built out yet (see Roadmap).

## Architecture

- **`mobile/`** — Expo (React Native + TypeScript) app using Expo Router
  for file-based navigation. Tabs: Scores, Teams, News, Bracketology,
  Favorites. Team/player/game detail screens are pushed on top.
- **`server/`** — Express + TypeScript API backed by Prisma. Serves
  scoreboard, teams, players, and news. Uses SQLite for zero-setup local
  dev; the schema is Postgres-compatible for production (see below).

The mobile app never talks to the database directly — it only calls the
`server` HTTP API. That keeps a real data provider swap (below) contained
to one side.

## Live data: ESPN integration (in progress)

`server/src/providers/espn/` is a real integration against ESPN's
unofficial "site API" (free, no key required, `site.api.espn.com/.../mens-college-basketball/...`).
It's an **ingestion layer**, not a live proxy: sync jobs pull from ESPN and
upsert into the same Prisma tables the mock seed uses (matched by a new
`espnId` column on `Conference`/`Team`/`Player`/`Game`/`NewsArticle`), so
`server/src/routes/*.ts` and the mobile app don't change at all — they just
start returning real rows instead of seeded ones.

**This has not been run against a live ESPN response.** This sandbox's
network policy blocks all external hosts except npm/GitHub/package
registries (confirmed against ESPN, Google, and CollegeBasketballData.com
while building this) — there is no way to make a real HTTP call to ESPN
from here. So:

- `server/src/providers/espn/types.ts` and `mappers.ts` are built from
  general knowledge of these endpoints' shapes, not a verified live sample.
- `npm run test:espn-mappers` (in `server/`) runs the parsing logic against
  hand-built fixture JSON in `__fixtures__/` that approximates what ESPN
  returns — it passes today, but it can only catch mapper bugs, not "the
  real API doesn't actually look like this."
- Fields most likely to need adjustment once tested for real: the
  conference-record stat key names in `mappers.ts` (`findStat` candidate
  lists for `wins`/`losses`/conference record), and `classYearFromExperience`
  (Fr/So/Jr/Sr derivation) — both are called out with comments at their
  definition.

**To actually turn this on**, from a machine with normal internet access:

```bash
cd server
npm run sync:espn          # full sync: conferences, teams, records, rosters, today's games, news
npm run dev                # serves the now-real data — no route/mobile changes needed
```

Then during game windows, keep scores fresh with:

```bash
npm run sync:scoreboard -- --watch   # polls ESPN every 60s and upserts score changes
```

If something looks wrong (a stat is always 0, a name is malformed), the
sync scripts `console.warn` on every row they skip or can't fully parse —
start there, then adjust the corresponding `map*` function in `mappers.ts`
and its fixture in `__fixtures__/` to match reality.

Not synced from ESPN: per-team/per-player advanced season stats (PPG, RPG,
etc. beyond win-loss record) — the standings endpoint doesn't carry them.
That's what the CBBD integration below fills in.

**Every screen still carries a small "Demo data" label.** That's still
correct until a sync has actually been run somewhere with network access —
remove the `<DemoBanner />` usages in `mobile/app/(tabs)/` once real data
is confirmed flowing.

## Live data: CollegeBasketballData.com integration (in progress)

`server/src/providers/cbbd/` fills the gap ESPN's standings endpoint leaves:
per-team and per-player advanced season stats (PPG, RPG, APG, shooting
percentages, adjusted net rating, strength of schedule). Same
ingestion-layer pattern as ESPN — `npm run sync:cbbd` upserts into
`TeamSeasonStat`'s advanced fields and creates `PlayerSeasonStat` rows,
routes and the mobile app don't change.

**Setup**: sign up for a free API key at collegebasketballdata.com and put
it in `server/.env` as `CBBD_API_KEY` (see `.env.example`). `.env` is
gitignored and never pushed, so a key added during one session's local
`server/.env` won't carry over anywhere else — each environment that runs
this needs its own.

CBBD doesn't share ESPN's team/player IDs, so the first sync **matches its
records to existing `Team`/`Player` rows by normalized school/athlete
name** (run `npm run sync:espn` or `npm run seed` first — there needs to be
something to match against). Once matched, the CBBD ID is cached on a new
`cbbdId` column so later syncs are a direct lookup instead of a name match
again. Unmatched rows are skipped with a `console.warn` naming the school
or player — that's where to look first if stats aren't showing up for a
particular team.

**This has not been run against a live CBBD response either** — same
sandbox network restriction as ESPN (confirmed again against
`api.collegebasketballdata.com` specifically, even with a real key in
hand). Confidence in the exact response shape here is *lower* than ESPN's:
CBBD publishes an OpenAPI spec, which would settle this quickly, but this
sandbox can't fetch it to check. `npm run test:cbbd-mappers` runs the
parsing logic (including both a nested `{ perGame, total }` stat-value
form and a flat-number form, since it's genuinely unclear from memory
which CBBD uses) against fixtures in `__fixtures__/` — passes today, same
caveat as ESPN's fixtures. The name-matching logic itself *has* been
verified against this repo's real seeded/synced data (not just fixtures) —
`Duke` → `Duke Blue Devils`, `Cooper Flagg` → the seeded Duke roster entry,
both matched correctly, and the intentionally-unmatched fixture rows
correctly did not.

```bash
cd server
npm run sync:espn      # or `npm run seed` — need teams/players to match against
npm run sync:cbbd
npm run dev
```

If a run comes back with everything unmatched, the school-name format is
probably the mismatch (e.g. "NC State" vs "North Carolina State") — check
a `console.warn` line's school name against the corresponding `Team.shortName`/`Team.name`
in the DB and adjust `normalizeName`/`resolveTeamId` in
`server/src/providers/cbbd/sync.ts` if it's a systematic pattern rather
than a one-off.

Other providers worth evaluating: SportsDataIO (paid, official support/SLA).

## Running it

### 1. Server

```bash
cd server
npm install
cp .env.example .env        # already points at a local SQLite file
npx prisma db push          # creates dev.db from the schema
npm run seed                # loads mock D1 teams/players/games/news
npm run dev                 # starts the API on http://localhost:4000
```

Sanity check: `curl http://localhost:4000/api/scoreboard`

### 2. Mobile app

```bash
cd mobile
npm install
npx expo start
```

The app defaults to `http://localhost:4000`, which only resolves to your
machine from the iOS simulator or Expo web. For an Android emulator or a
physical device, point it at your machine's LAN IP instead:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.23:4000 npx expo start
```

## Data model

`server/prisma/schema.prisma` defines the full domain:

- `Conference`, `Team`, `Player`, `Game`, `PlayerSeasonStat`, `TeamSeasonStat`,
  `NewsArticle` — built and wired up now. The first five carry an optional
  unique `espnId` so the ESPN sync can upsert into the same rows the mock
  seed populates, keyed on that column. `Team` and `Player` also carry an
  optional unique `cbbdId`, populated by the CBBD sync's name-matching once
  a row's first match succeeds.
- `User`, `Favorite`, `ChatMessage` — modeled now so the schema doesn't need
  to change shape later, but not yet wired to the mobile UI or a real auth
  flow.

## Roadmap

Roughly in the order it makes sense to build:

1. **Real data integration** — ESPN and CBBD sync are both built (see
   above) but unverified against live responses; the next step is running
   both from a machine with network access, fixing whatever the mappers
   got wrong, and scheduling `sync:scoreboard --watch` + a periodic
   `sync:cbbd` (daily is plenty — season stats don't change fast) in
   production.
2. **Accounts** — real auth (e.g. email/OAuth), replacing the placeholder
   `User` model with an actual sign-up/sign-in flow.
3. **Favorites** — star teams/players/conferences from their detail
   screens; a personalized "My Scores" feed on the Favorites tab.
4. **Persisted chat** — per-game and per-player chatrooms backed by
   `ChatMessage`, with real-time delivery (websockets or a polling
   fallback) once accounts exist. The current game-chat screen is a
   local-only preview to validate the UX.
5. **Bracketology** — the full metrics explorer (NET, quadrant records,
   adjusted efficiency, strength of schedule, resume quality) and the
   weekly mock bracket, opening once there's enough of a season's data to
   make it meaningful.

## Notable decisions from this session

- **Platform**: mobile app (Expo/React Native), not web-first.
- **Data source**: intended to be a real API from day one; the sandbox's
  network policy made that infeasible here, so the data layer is built to
  the shape of a real API and is a contained swap later.
- **Backend**: full-stack with a database (Express + Prisma), not
  frontend-only/local-storage — so favorites and chat have somewhere real
  to live once they're built out.
- **First feature**: app shell + scores/teams/stats, since everything else
  (chat, favorites, bracketology) hangs off of it.
