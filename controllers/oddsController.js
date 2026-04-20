const express = require("express");

const router = express.Router();

// Keep the list focused to avoid wasting API quota.
const MAJOR_SPORTS = [
  { key: "americanfootball_nfl", title: "NFL" },
  { key: "basketball_nba", title: "NBA" },
  { key: "baseball_mlb", title: "MLB" },
  { key: "icehockey_nhl", title: "NHL" },
  { key: "soccer_epl", title: "Premier League" }
];

const CACHE_TTL_MS = 60 * 1000;
let cache = { expiresAt: 0, payload: null };

function normalizeScore(match, sportTitle) {
  const scores = Array.isArray(match.scores) ? match.scores : [];
  const home = scores.find((s) => s.name === match.home_team);
  const away = scores.find((s) => s.name === match.away_team);

  return {
    id: match.id,
    sport: sportTitle,
    commenceTime: match.commence_time,
    completed: !!match.completed,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    homeScore: home ? Number(home.score) : null,
    awayScore: away ? Number(away.score) : null,
    lastUpdate: match.last_update || null
  };
}

async function fetchScoresForSport(apiKey, sport) {
  const url = `https://api.the-odds-api.com/v4/sports/${sport.key}/scores/?daysFrom=2&apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Odds API ${sport.key} failed (${res.status}): ${details}`);
  }

  const rows = await res.json();
  return rows.map((row) => normalizeScore(row, sport.title));
}

router.get("/scores", async (req, res) => {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "ODDS_API_KEY is missing. Add it to your environment before calling /api/scores."
    });
  }

  if (Date.now() < cache.expiresAt && cache.payload) {
    return res.json({ source: "cache", scores: cache.payload });
  }

  try {
    const allSports = await Promise.all(MAJOR_SPORTS.map((sport) => fetchScoresForSport(apiKey, sport)));
    const scores = allSports.flat().sort((a, b) => new Date(b.commenceTime) - new Date(a.commenceTime));

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, payload: scores };
    res.json({ source: "api", scores });
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: "Failed to load scores from The Odds API." });
  }
});

module.exports = router;

