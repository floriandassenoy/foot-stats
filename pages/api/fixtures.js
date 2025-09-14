// pages/api/fixtures.js
const fetch = require("node-fetch");

let cache = {}; // simple in-memory cache (cleared si l'instance se redémarre)
const TTL_SECONDS = 60; // durée du cache en secondes

export default async function handler(req, res) {
  const competition = req.query.competition;
  if (!competition) return res.status(400).json({ error: "competition param required" });

  const now = Date.now();
  if (cache[competition] && (now - cache[competition].ts) < TTL_SECONDS * 1000) {
    return res.status(200).json({ from: "cache", ...cache[competition].data });
  }

  const API_BASE = "https://api.football-data.org/v4";
  const url = `${API_BASE}/competitions/${competition}/matches`;

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "FOOTBALL_API_KEY not set in env" });

  try {
    const r = await fetch(url, { headers: { "X-Auth-Token": apiKey } });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }
    const data = await r.json();
    cache[competition] = { ts: now, data };
    return res.status(200).json({ from: "api", ...data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
	
