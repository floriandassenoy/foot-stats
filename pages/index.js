// pages/index.js
import { useState } from "react";

const COMPETITIONS = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "LaLiga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" },
  { code: "CL", name: "Champions League" },
  { code: "EL", name: "Europa League" }
];

export default function Home() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  async function loadCompetition(code) {
    setLoading(true);
    try {
      const res = await fetch(`/api/fixtures?competition=${code}`);
      const json = await res.json();
      setData(prev => ({ ...prev, [code]: json }));
    } catch (e) {
      alert("Erreur lors du chargement : " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function computeTeamStats(matches, teamIdOrName) {
    const stats = { played:0, won:0, draw:0, lost:0, gf:0, ga:0, pts:0 };
    (matches || []).forEach(m => {
      const home = (m.homeTeam && (m.homeTeam.id || m.homeTeam.name));
      const away = (m.awayTeam && (m.awayTeam.id || m.awayTeam.name));
      const isHome = (m.homeTeam && (m.homeTeam.id === teamIdOrName || m.homeTeam.name === teamIdOrName));
      const isAway = (m.awayTeam && (m.awayTeam.id === teamIdOrName || m.awayTeam.name === teamIdOrName));
      if(!isHome && !isAway) return;
      stats.played++;
      const teamGoals = isHome ? (m.score?.fullTime?.home ?? 0) : (m.score?.fullTime?.away ?? 0);
      const oppGoals = isHome ? (m.score?.fullTime?.away ?? 0) : (m.score?.fullTime?.home ?? 0);
      stats.gf += teamGoals;
      stats.ga += oppGoals;
      if(teamGoals > oppGoals) { stats.won++; stats.pts += 3; }
      else if(teamGoals === oppGoals) { stats.draw++; stats.pts += 1; }
      else { stats.lost++; }
    });
    return stats;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 20 }}>
      <h1>Mon site de stats foot (MVP)</h1>
      <p>Cliquer sur une compétition pour charger les matchs.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {COMPETITIONS.map(c => (
          <div key={c.code} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 6 }}>
            <h3>{c.name}</h3>
            <button onClick={() => loadCompetition(c.code)} disabled={loading}>
              {loading ? "Chargement..." : "Charger les matchs"}
            </button>

            {data[c.code] && data[c.code].matches && (
              <div style={{ marginTop: 10 }}>
                <h4>Matchs ({data[c.code].matches.length})</h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {data[c.code].matches.slice(0,50).map(m => (
                    <li key={m.id} style={{ padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <strong style={{ cursor: "pointer" }} onClick={() => {
                        const stats = computeTeamStats(data[c.code].matches, m.homeTeam.id ?? m.homeTeam.name);
                        alert(`${m.homeTeam.name} — joué: ${stats.played}, pts: ${stats.pts}, buts: ${stats.gf}-${stats.ga}`);
                      }}>{m.homeTeam.name}</strong>
                      {" "}vs{" "}
                      <strong style={{ cursor: "pointer" }} onClick={() => {
                        const stats = computeTeamStats(data[c.code].matches, m.awayTeam.id ?? m.awayTeam.name);
                        alert(`${m.awayTeam.name} — joué: ${stats.played}, pts: ${stats.pts}, buts: ${stats.gf}-${stats.ga}`);
                      }}>{m.awayTeam.name}</strong>
                      {" "} — { (m.score?.fullTime?.home ?? "-") } : { (m.score?.fullTime?.away ?? "-") } <br/>
                      <small>{m.utcDate} — {m.status}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 20, color: "#666" }}>Conseil : commence par charger une compétition, puis clique sur un nom d’équipe pour voir des stats simples calculées à partir des matchs chargés.</p>
    </div>
  )
}
