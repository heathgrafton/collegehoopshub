/**
 * Loose types for ESPN's unofficial "site API" JSON. This API isn't
 * documented by ESPN — these shapes are reconstructed from public knowledge
 * of the endpoints and widely-used community tooling, not verified against
 * a live response (this sandbox has no network access to test with). Every
 * field consumers actually read should be treated as possibly-missing;
 * see mappers.ts for the defensive handling.
 */

export type EspnStandingsResponse = {
  children?: EspnStandingsGroup[];
};

export type EspnStandingsGroup = {
  id?: string;
  name?: string;
  abbreviation?: string;
  standings?: {
    entries?: EspnStandingsEntry[];
  };
};

export type EspnStandingsEntry = {
  team?: {
    id?: string;
    location?: string;
    name?: string;
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    color?: string;
  };
  stats?: { name?: string; value?: number; displayValue?: string }[];
};

export type EspnScoreboardResponse = {
  events?: EspnEvent[];
};

export type EspnEvent = {
  id?: string;
  date?: string;
  competitions?: EspnCompetition[];
};

export type EspnCompetition = {
  venue?: { fullName?: string };
  status?: {
    displayClock?: string;
    period?: number;
    type?: { state?: "pre" | "in" | "post"; completed?: boolean };
  };
  broadcasts?: { names?: string[] }[];
  competitors?: EspnCompetitor[];
};

export type EspnCompetitor = {
  id?: string;
  homeAway?: "home" | "away";
  score?: string;
  team?: {
    id?: string;
    location?: string;
    name?: string;
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    color?: string;
  };
};

export type EspnRosterResponse = {
  athletes?: (EspnRosterGroup | EspnAthlete)[];
};

export type EspnRosterGroup = {
  position?: string;
  items?: EspnAthlete[];
};

export type EspnAthlete = {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  jersey?: string;
  position?: { abbreviation?: string };
  height?: number; // inches
  experience?: { years?: number; displayValue?: string };
  birthPlace?: { city?: string; state?: string; country?: string };
};

export type EspnNewsResponse = {
  articles?: EspnArticle[];
};

export type EspnArticle = {
  id?: number | string;
  headline?: string;
  description?: string;
  published?: string;
  images?: { url?: string }[];
  categories?: { team?: { id?: string } }[];
};
