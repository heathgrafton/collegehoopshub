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

Not synced from ESPN yet: per-team/per-player advanced season stats (PPG,
RPG, etc. beyond win-loss record) — the standings endpoint doesn't carry
them and the athlete-stats endpoint's shape is the part of ESPN's API I'm
least confident about without a live sample to check. `TeamSeasonStat`'s
advanced fields are nullable for exactly this reason; the UI already
renders "–" when they're missing. `PlayerSeasonStat` rows simply aren't
created by the ESPN sync yet, same as before.

Other providers worth evaluating alongside/instead of ESPN: CollegeBasketballData.com
(free tier, richer advanced stats incl. NET/efficiency — a better fit for
Bracketology once that's built — requires an API key) or SportsDataIO
(paid, official support/SLA).

**Every screen still carries a small "Demo data" label.** That's still
correct until `npm run sync:espn` has actually been run somewhere with
network access — remove the `<DemoBanner />` usages in `mobile/app/(tabs)/`
once real data is confirmed flowing.

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
  seed populates, keyed on that column.
- `User`, `Favorite`, `ChatMessage` — modeled now so the schema doesn't need
  to change shape later, but not yet wired to the mobile UI or a real auth
  flow.

## Roadmap

Roughly in the order it makes sense to build:

1. **Real data integration** — ESPN sync is built (see above) but unverified
   against a live response; the next step is running it from a machine with
   network access, fixing whatever the mappers got wrong, and scheduling
   `sync:scoreboard --watch` (or a cron/serverless equivalent) in
   production. Advanced team/player season stats still need a source —
   likely CollegeBasketballData.com given the Bracketology page needs them
   too.
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
