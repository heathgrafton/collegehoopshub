/**
 * Seeds a representative slice of Division I men's basketball data (a
 * handful of conferences/teams/players rather than the full ~360-team
 * field) so every screen has realistic data to render against. Shaped to
 * match what a real provider (ESPN, CollegeBasketballData.com, etc.) would
 * return, so the mock DataProvider can later be swapped for a live one
 * without changing consumers.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEASON = 2026;

type TeamSeed = {
  name: string;
  shortName: string;
  nickname: string;
  city: string;
  state: string;
  primaryColor: string;
  players: {
    firstName: string;
    lastName: string;
    jerseyNumber: string;
    position: string;
    heightInches: number;
    classYear: string;
    hometown: string;
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    mpg: number;
    fgPct: number;
    threePct: number;
    ftPct: number;
  }[];
  wins: number;
  losses: number;
  confWins: number;
  confLosses: number;
};

const CONFERENCES: Record<string, TeamSeed[]> = {
  "Atlantic Coast Conference": [
    {
      name: "Duke Blue Devils",
      shortName: "Duke",
      nickname: "Blue Devils",
      city: "Durham",
      state: "NC",
      primaryColor: "#003087",
      wins: 21,
      losses: 4,
      confWins: 12,
      confLosses: 3,
      players: [
        { firstName: "Cooper", lastName: "Flagg", jerseyNumber: "2", position: "F", heightInches: 81, classYear: "Fr", hometown: "Newport, ME", ppg: 19.8, rpg: 8.4, apg: 4.1, spg: 1.5, bpg: 1.6, mpg: 33.2, fgPct: 0.487, threePct: 0.381, ftPct: 0.812 },
        { firstName: "Kon", lastName: "Knueppel", jerseyNumber: "7", position: "G", heightInches: 78, classYear: "Fr", hometown: "Wisconsin Rapids, WI", ppg: 15.6, rpg: 4.2, apg: 2.9, spg: 1.1, bpg: 0.3, mpg: 31.5, fgPct: 0.462, threePct: 0.402, ftPct: 0.855 },
        { firstName: "Tyrese", lastName: "Proctor", jerseyNumber: "5", position: "G", heightInches: 76, classYear: "Jr", hometown: "Sydney, Australia", ppg: 11.4, rpg: 3.1, apg: 4.5, spg: 1.2, bpg: 0.2, mpg: 30.1, fgPct: 0.431, threePct: 0.375, ftPct: 0.821 },
      ],
    },
    {
      name: "North Carolina Tar Heels",
      shortName: "UNC",
      nickname: "Tar Heels",
      city: "Chapel Hill",
      state: "NC",
      primaryColor: "#7BAFD4",
      wins: 18,
      losses: 7,
      confWins: 10,
      confLosses: 5,
      players: [
        { firstName: "RJ", lastName: "Davis", jerseyNumber: "4", position: "G", heightInches: 73, classYear: "Sr", hometown: "White Plains, NY", ppg: 20.2, rpg: 3.8, apg: 4.4, spg: 1.4, bpg: 0.1, mpg: 34.8, fgPct: 0.451, threePct: 0.389, ftPct: 0.842 },
        { firstName: "Elliot", lastName: "Cadeau", jerseyNumber: "2", position: "G", heightInches: 75, classYear: "So", hometown: "Mount Vernon, NY", ppg: 10.1, rpg: 3.2, apg: 5.9, spg: 1.0, bpg: 0.1, mpg: 29.7, fgPct: 0.418, threePct: 0.322, ftPct: 0.701 },
      ],
    },
    {
      name: "NC State Wolfpack",
      shortName: "NC State",
      nickname: "Wolfpack",
      city: "Raleigh",
      state: "NC",
      primaryColor: "#CC0000",
      wins: 14,
      losses: 11,
      confWins: 7,
      confLosses: 8,
      players: [
        { firstName: "Marcus", lastName: "Hill", jerseyNumber: "10", position: "G", heightInches: 74, classYear: "Jr", hometown: "Greensboro, NC", ppg: 16.3, rpg: 3.5, apg: 3.9, spg: 1.3, bpg: 0.2, mpg: 32.0, fgPct: 0.441, threePct: 0.358, ftPct: 0.799 },
      ],
    },
  ],
  "Big Ten Conference": [
    {
      name: "Purdue Boilermakers",
      shortName: "Purdue",
      nickname: "Boilermakers",
      city: "West Lafayette",
      state: "IN",
      primaryColor: "#CEB888",
      wins: 22,
      losses: 3,
      confWins: 14,
      confLosses: 1,
      players: [
        { firstName: "Braden", lastName: "Smith", jerseyNumber: "3", position: "G", heightInches: 72, classYear: "Jr", hometown: "Westfield, IN", ppg: 16.1, rpg: 5.4, apg: 7.2, spg: 2.0, bpg: 0.2, mpg: 34.5, fgPct: 0.462, threePct: 0.401, ftPct: 0.871 },
        { firstName: "Trey", lastName: "Kaufman-Renn", jerseyNumber: "4", position: "F", heightInches: 81, classYear: "Sr", hometown: "Indianapolis, IN", ppg: 19.4, rpg: 6.8, apg: 1.9, spg: 0.7, bpg: 0.5, mpg: 30.9, fgPct: 0.541, threePct: 0.312, ftPct: 0.702 },
      ],
    },
    {
      name: "Michigan State Spartans",
      shortName: "Michigan St.",
      nickname: "Spartans",
      city: "East Lansing",
      state: "MI",
      primaryColor: "#18453B",
      wins: 20,
      losses: 5,
      confWins: 12,
      confLosses: 3,
      players: [
        { firstName: "Jase", lastName: "Richardson", jerseyNumber: "11", position: "G", heightInches: 75, classYear: "Fr", hometown: "East Lansing, MI", ppg: 14.6, rpg: 3.0, apg: 2.4, spg: 1.0, bpg: 0.3, mpg: 27.8, fgPct: 0.489, threePct: 0.412, ftPct: 0.833 },
      ],
    },
    {
      name: "Illinois Fighting Illini",
      shortName: "Illinois",
      nickname: "Fighting Illini",
      city: "Champaign",
      state: "IL",
      primaryColor: "#E84A27",
      wins: 17,
      losses: 8,
      confWins: 9,
      confLosses: 6,
      players: [
        { firstName: "Kasparas", lastName: "Jakucionis", jerseyNumber: "32", position: "G", heightInches: 77, classYear: "Fr", hometown: "Vilnius, Lithuania", ppg: 15.2, rpg: 4.7, apg: 4.3, spg: 1.1, bpg: 0.3, mpg: 31.4, fgPct: 0.438, threePct: 0.355, ftPct: 0.798 },
      ],
    },
  ],
  "Big 12 Conference": [
    {
      name: "Houston Cougars",
      shortName: "Houston",
      nickname: "Cougars",
      city: "Houston",
      state: "TX",
      primaryColor: "#C8102E",
      wins: 23,
      losses: 2,
      confWins: 15,
      confLosses: 0,
      players: [
        { firstName: "J'Wan", lastName: "Roberts", jerseyNumber: "13", position: "F", heightInches: 80, classYear: "Sr", hometown: "Bay City, TX", ppg: 13.8, rpg: 8.1, apg: 1.4, spg: 0.9, bpg: 1.2, mpg: 29.6, fgPct: 0.548, threePct: 0.0, ftPct: 0.688 },
        { firstName: "Emanuel", lastName: "Sharp", jerseyNumber: "21", position: "G", heightInches: 76, classYear: "Jr", hometown: "Aurora, IL", ppg: 14.7, rpg: 3.6, apg: 2.2, spg: 1.0, bpg: 0.2, mpg: 30.2, fgPct: 0.429, threePct: 0.379, ftPct: 0.844 },
      ],
    },
    {
      name: "Kansas Jayhawks",
      shortName: "Kansas",
      nickname: "Jayhawks",
      city: "Lawrence",
      state: "KS",
      primaryColor: "#0051BA",
      wins: 19,
      losses: 6,
      confWins: 11,
      confLosses: 4,
      players: [
        { firstName: "Hunter", lastName: "Dickinson", jerseyNumber: "1", position: "C", heightInches: 84, classYear: "Sr", hometown: "Alexandria, VA", ppg: 17.9, rpg: 10.6, apg: 1.8, spg: 0.6, bpg: 1.4, mpg: 31.1, fgPct: 0.559, threePct: 0.341, ftPct: 0.771 },
      ],
    },
    {
      name: "Iowa State Cyclones",
      shortName: "Iowa State",
      nickname: "Cyclones",
      city: "Ames",
      state: "IA",
      primaryColor: "#C8102E",
      wins: 21,
      losses: 4,
      confWins: 12,
      confLosses: 3,
      players: [
        { firstName: "Curtis", lastName: "Jones", jerseyNumber: "5", position: "G", heightInches: 74, classYear: "Sr", hometown: "Chicago, IL", ppg: 12.9, rpg: 3.3, apg: 3.1, spg: 1.6, bpg: 0.2, mpg: 28.9, fgPct: 0.441, threePct: 0.368, ftPct: 0.812 },
      ],
    },
  ],
  "Southeastern Conference": [
    {
      name: "Auburn Tigers",
      shortName: "Auburn",
      nickname: "Tigers",
      city: "Auburn",
      state: "AL",
      primaryColor: "#0C2340",
      wins: 24,
      losses: 1,
      confWins: 13,
      confLosses: 0,
      players: [
        { firstName: "Johni", lastName: "Broome", jerseyNumber: "4", position: "F", heightInches: 82, classYear: "Sr", hometown: "Jackson, MS", ppg: 18.4, rpg: 10.8, apg: 2.6, spg: 1.2, bpg: 2.1, mpg: 32.3, fgPct: 0.512, threePct: 0.298, ftPct: 0.732 },
      ],
    },
    {
      name: "Kentucky Wildcats",
      shortName: "Kentucky",
      nickname: "Wildcats",
      city: "Lexington",
      state: "KY",
      primaryColor: "#0033A0",
      wins: 18,
      losses: 7,
      confWins: 9,
      confLosses: 4,
      players: [
        { firstName: "Lamont", lastName: "Butler", jerseyNumber: "1", position: "G", heightInches: 74, classYear: "Sr", hometown: "Riverside, CA", ppg: 12.6, rpg: 2.9, apg: 3.8, spg: 1.5, bpg: 0.2, mpg: 30.4, fgPct: 0.452, threePct: 0.371, ftPct: 0.809 },
      ],
    },
    {
      name: "Tennessee Volunteers",
      shortName: "Tennessee",
      nickname: "Volunteers",
      city: "Knoxville",
      state: "TN",
      primaryColor: "#FF8200",
      wins: 20,
      losses: 5,
      confWins: 10,
      confLosses: 3,
      players: [
        { firstName: "Chaz", lastName: "Lanier", jerseyNumber: "2", position: "G", heightInches: 76, classYear: "Sr", hometown: "Crossville, TN", ppg: 17.5, rpg: 3.4, apg: 1.9, spg: 1.3, bpg: 0.3, mpg: 32.8, fgPct: 0.463, threePct: 0.402, ftPct: 0.865 },
      ],
    },
  ],
  "Big East Conference": [
    {
      name: "UConn Huskies",
      shortName: "UConn",
      nickname: "Huskies",
      city: "Storrs",
      state: "CT",
      primaryColor: "#000E2F",
      wins: 19,
      losses: 6,
      confWins: 12,
      confLosses: 3,
      players: [
        { firstName: "Alex", lastName: "Karaban", jerseyNumber: "11", position: "F", heightInches: 80, classYear: "Sr", hometown: "Southborough, MA", ppg: 16.8, rpg: 5.9, apg: 2.2, spg: 0.8, bpg: 0.5, mpg: 31.7, fgPct: 0.468, threePct: 0.392, ftPct: 0.821 },
      ],
    },
    {
      name: "Creighton Bluejays",
      shortName: "Creighton",
      nickname: "Bluejays",
      city: "Omaha",
      state: "NE",
      primaryColor: "#005CA9",
      wins: 17,
      losses: 8,
      confWins: 10,
      confLosses: 5,
      players: [
        { firstName: "Ryan", lastName: "Kalkbrenner", jerseyNumber: "11", position: "C", heightInches: 85, classYear: "Sr", hometown: "St. Louis, MO", ppg: 16.9, rpg: 7.2, apg: 1.6, spg: 0.5, bpg: 2.8, mpg: 28.5, fgPct: 0.612, threePct: 0.371, ftPct: 0.741 },
      ],
    },
  ],
  "West Coast Conference": [
    {
      name: "Gonzaga Bulldogs",
      shortName: "Gonzaga",
      nickname: "Bulldogs",
      city: "Spokane",
      state: "WA",
      primaryColor: "#041E42",
      wins: 22,
      losses: 3,
      confWins: 15,
      confLosses: 0,
      players: [
        { firstName: "Graham", lastName: "Ike", jerseyNumber: "13", position: "F", heightInches: 81, classYear: "Sr", hometown: "Bellevue, WA", ppg: 18.9, rpg: 8.3, apg: 1.7, spg: 0.6, bpg: 1.0, mpg: 29.9, fgPct: 0.573, threePct: 0.333, ftPct: 0.699 },
        { firstName: "Ryan", lastName: "Nembhard", jerseyNumber: "0", position: "G", heightInches: 73, classYear: "Sr", hometown: "Aurora, ON", ppg: 13.1, rpg: 3.2, apg: 8.9, spg: 1.4, bpg: 0.1, mpg: 33.6, fgPct: 0.451, threePct: 0.379, ftPct: 0.831 },
      ],
    },
    {
      name: "Saint Mary's Gaels",
      shortName: "Saint Mary's",
      nickname: "Gaels",
      city: "Moraga",
      state: "CA",
      primaryColor: "#B4232A",
      wins: 19,
      losses: 6,
      confWins: 13,
      confLosses: 2,
      players: [
        { firstName: "Mitchell", lastName: "Saxen", jerseyNumber: "20", position: "C", heightInches: 83, classYear: "Sr", hometown: "Snohomish, WA", ppg: 12.4, rpg: 7.6, apg: 1.2, spg: 0.4, bpg: 1.1, mpg: 27.3, fgPct: 0.541, threePct: 0.0, ftPct: 0.712 },
      ],
    },
  ],
};

const NEWS: { title: string; summary: string; body: string; source: string; daysAgo: number; teamShortName?: string }[] = [
  {
    title: "Selection Sunday looms as bubble teams jockey for position",
    summary: "With three weeks left in the regular season, the bracket picture is starting to take shape across every major conference.",
    body: "With three weeks left in the regular season, the bracket picture is starting to take shape. Several bubble teams face crucial road tests this week that could define their NCAA Tournament resumes. Selection committee members have emphasized strength of schedule and quality wins as the season winds down.",
    source: "CBB Wire",
    daysAgo: 0,
  },
  {
    title: "Cooper Flagg named National Player of the Week",
    summary: "Duke's freshman phenom posted back-to-back 25-point games in wins over top-15 opponents.",
    body: "Duke's freshman phenom posted back-to-back 25-point games in wins over top-15 opponents this week, cementing his status as the frontrunner for national player of the year honors. Flagg is averaging nearly 20 points, 8 rebounds and 4 assists per game this season.",
    source: "Hoops Daily",
    daysAgo: 1,
    teamShortName: "Duke",
  },
  {
    title: "Houston clinches Big 12 regular season title with unbeaten conference run",
    summary: "The Cougars became the first team in the new-look Big 12 to finish conference play undefeated.",
    body: "The Cougars became the first team in the new-look Big 12 to finish conference play undefeated, capping the run with a dominant defensive performance. Head coach Kelvin Sampson credited the team's depth and physicality for the historic season.",
    source: "Big 12 Insider",
    daysAgo: 2,
    teamShortName: "Houston",
  },
  {
    title: "Auburn holds onto No. 1 ranking after narrow escape",
    summary: "Johni Broome's double-double propelled the Tigers past a scrappy SEC road opponent.",
    body: "Johni Broome's double-double propelled the Tigers past a scrappy SEC road opponent in a game that came down to the final possession. Auburn remains the last unbeaten team in SEC play and the top overall seed in most bracket projections.",
    source: "SEC Network",
    daysAgo: 3,
    teamShortName: "Auburn",
  },
  {
    title: "Gonzaga's Ryan Nembhard closing in on program assist record",
    summary: "The senior guard needs just 41 more assists to become the Bulldogs' all-time leader.",
    body: "The senior guard needs just 41 more assists to become the Bulldogs' all-time leader in the category, a mark that has stood for over a decade. Gonzaga remains undefeated in West Coast Conference play heading into the final stretch.",
    source: "WCC Report",
    daysAgo: 4,
    teamShortName: "Gonzaga",
  },
  {
    title: "Conference tournament schedules released ahead of March Madness",
    summary: "All 32 Division I conferences have finalized dates for their postseason tournaments.",
    body: "All 32 Division I conferences have finalized dates for their postseason tournaments, setting the stage for a chaotic final week before Selection Sunday. Several automatic bids remain up for grabs in one-bid leagues.",
    source: "NCAA Central",
    daysAgo: 5,
  },
];

function randomPastMinutes(min: number, max: number) {
  const minutes = Math.floor(Math.random() * (max - min)) + min;
  return new Date(Date.now() - minutes * 60_000);
}

function randomFutureHours(min: number, max: number) {
  const hours = Math.floor(Math.random() * (max - min)) + min;
  return new Date(Date.now() + hours * 60 * 60_000);
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.chatMessage.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.game.deleteMany();
  await prisma.playerSeasonStat.deleteMany();
  await prisma.teamSeasonStat.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.conference.deleteMany();
  await prisma.user.deleteMany();

  const teamIdByShortName = new Map<string, string>();

  for (const [confName, teams] of Object.entries(CONFERENCES)) {
    const conference = await prisma.conference.create({
      data: {
        name: confName,
        shortName: confName
          .replace("Conference", "")
          .trim()
          .split(" ")
          .map((w) => w[0])
          .join(""),
      },
    });

    for (const t of teams) {
      const team = await prisma.team.create({
        data: {
          name: t.name,
          shortName: t.shortName,
          nickname: t.nickname,
          city: t.city,
          state: t.state,
          primaryColor: t.primaryColor,
          conferenceId: conference.id,
        },
      });
      teamIdByShortName.set(t.shortName, team.id);

      await prisma.teamSeasonStat.create({
        data: {
          teamId: team.id,
          season: SEASON,
          wins: t.wins,
          losses: t.losses,
          conferenceWins: t.confWins,
          conferenceLosses: t.confLosses,
          pointsPerGame: 74 + Math.random() * 12,
          opponentPointsPerGame: 62 + Math.random() * 12,
          reboundsPerGame: 33 + Math.random() * 5,
          assistsPerGame: 13 + Math.random() * 5,
          netRating: Math.random() * 30 - 5,
          strengthOfSchedule: Math.random() * 10 - 2,
        },
      });

      for (const p of t.players) {
        const player = await prisma.player.create({
          data: {
            teamId: team.id,
            firstName: p.firstName,
            lastName: p.lastName,
            jerseyNumber: p.jerseyNumber,
            position: p.position,
            heightInches: p.heightInches,
            classYear: p.classYear,
            hometown: p.hometown,
          },
        });
        await prisma.playerSeasonStat.create({
          data: {
            playerId: player.id,
            season: SEASON,
            gamesPlayed: t.wins + t.losses,
            pointsPerGame: p.ppg,
            reboundsPerGame: p.rpg,
            assistsPerGame: p.apg,
            stealsPerGame: p.spg,
            blocksPerGame: p.bpg,
            minutesPerGame: p.mpg,
            fieldGoalPct: p.fgPct,
            threePointPct: p.threePct,
            freeThrowPct: p.ftPct,
          },
        });
      }
    }
  }

  console.log("Creating games (live / scheduled / final)...");
  const allShortNames = Array.from(teamIdByShortName.keys());

  function pairTeams(count: number, used: Set<string>) {
    const pairs: [string, string][] = [];
    const pool = allShortNames.filter((n) => !used.has(n));
    for (let i = 0; i < count && pool.length >= 2; i++) {
      const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      const b = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      used.add(a);
      used.add(b);
      pairs.push([a, b]);
    }
    return pairs;
  }

  const used = new Set<string>();

  // Live games in progress
  for (const [home, away] of pairTeams(3, used)) {
    const homeScore = 40 + Math.floor(Math.random() * 30);
    const awayScore = 40 + Math.floor(Math.random() * 30);
    await prisma.game.create({
      data: {
        season: SEASON,
        startTime: randomPastMinutes(40, 90),
        status: "live",
        period: Math.random() > 0.5 ? 2 : 1,
        clock: `${Math.floor(Math.random() * 19)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        homeTeamId: teamIdByShortName.get(home)!,
        awayTeamId: teamIdByShortName.get(away)!,
        homeScore,
        awayScore,
        venue: `${home} Arena`,
        broadcast: ["ESPN", "FS1", "CBS", "TNT"][Math.floor(Math.random() * 4)],
      },
    });
  }

  // Final games (already completed today)
  for (const [home, away] of pairTeams(4, used)) {
    const homeScore = 55 + Math.floor(Math.random() * 30);
    const awayScore = 55 + Math.floor(Math.random() * 30);
    await prisma.game.create({
      data: {
        season: SEASON,
        startTime: randomPastMinutes(150, 300),
        status: "final",
        period: 2,
        clock: "0:00",
        homeTeamId: teamIdByShortName.get(home)!,
        awayTeamId: teamIdByShortName.get(away)!,
        homeScore,
        awayScore,
        venue: `${home} Arena`,
        broadcast: ["ESPN2", "ESPNU", "FS1"][Math.floor(Math.random() * 3)],
      },
    });
  }

  // Scheduled/upcoming games
  for (const [home, away] of pairTeams(5, used)) {
    await prisma.game.create({
      data: {
        season: SEASON,
        startTime: randomFutureHours(2, 96),
        status: "scheduled",
        period: 0,
        clock: "",
        homeTeamId: teamIdByShortName.get(home)!,
        awayTeamId: teamIdByShortName.get(away)!,
        homeScore: 0,
        awayScore: 0,
        venue: `${home} Arena`,
        broadcast: ["ESPN", "FS1", "CBS", "ACCN", "SECN"][Math.floor(Math.random() * 5)],
      },
    });
  }

  console.log("Creating news articles...");
  for (const n of NEWS) {
    await prisma.newsArticle.create({
      data: {
        title: n.title,
        summary: n.summary,
        body: n.body,
        source: n.source,
        publishedAt: new Date(Date.now() - n.daysAgo * 24 * 60 * 60_000),
        teamId: n.teamShortName ? teamIdByShortName.get(n.teamShortName) : undefined,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
