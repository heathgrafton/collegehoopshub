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

## A note on live data

This build was developed in a network-restricted sandbox that only allows
npm/GitHub/package-registry traffic — it could not reach any sports-data
API (ESPN's public endpoints, CollegeBasketballData.com, SportsDataIO, etc.
were all blocked at the network policy level, confirmed while building this).
So for now, `server` serves realistic **mock data** — real D1 team and
player names, but fabricated scores/stats — shaped exactly like what a real
provider would return, seeded via `server/prisma/seed.ts`.

**Every screen carries a small "Demo data" label** so nobody mistakes it for
a live feed. Swapping in a real provider later only touches
`server/src/routes/*.ts` (replace the Prisma queries with calls to the
provider, keeping the same response shape) — the mobile app doesn't change.
Good candidates to evaluate first: ESPN's unofficial site API (free, no
key, widely used, no formal SLA), CollegeBasketballData.com (free tier,
richer advanced stats, requires an API key), or SportsDataIO (paid, official
support/SLA).

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
  `NewsArticle` — built and wired up now.
- `User`, `Favorite`, `ChatMessage` — modeled now so the schema doesn't need
  to change shape later, but not yet wired to the mobile UI or a real auth
  flow.

## Roadmap

Roughly in the order it makes sense to build:

1. **Real data integration** — pick a provider (see above), implement it
   behind the existing route shapes, and add a scheduled refresh job for
   scores/stats.
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
