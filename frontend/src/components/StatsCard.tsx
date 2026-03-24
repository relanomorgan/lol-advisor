type ChampStat = {
  id: number;
  name: string;
  image: string;
  games: number;
  wins: number;
  losses: number;
  winrate: number;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
};

type Stats = {
  total_games: number;
  champion_stats: ChampStat[];
};

export default function StatsCard({ stats, theme }: { stats: Stats, theme: { accent: string, bg: string } }) {
  return (
    <div style={{ background: theme.bg, padding: "1.5rem" }}>

      <p style={{
        color: "#5c6470", fontSize: "12px", textTransform: "uppercase",
        letterSpacing: "0.1em", margin: "0 0 12px"
      }}>
        {stats.total_games} dernières parties ranked
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {stats.champion_stats.map((champ) => (
          <div key={champ.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#0d1117", borderRadius: "10px", padding: "10px 14px",
            border: "0.5px solid #1e2430"
          }}>
            <img src={champ.image} alt={champ.name} style={{
              width: "44px", height: "44px", borderRadius: "6px",
              border: `2px solid ${theme.accent}`
            }} />

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 500, color: theme.accent }}>{champ.name}</span>
                <span style={{ fontSize: "12px", color: "#5c6470" }}>
                  {champ.games} partie{champ.games > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px" }}>
                <span style={{ color: champ.winrate >= 50 ? "#4ade80" : "#f87171", fontWeight: 500 }}>
                  {champ.winrate}% win
                </span>
                <span style={{ color: "#5c6470" }}>
                  <span style={{ color: "#4ade80" }}>{champ.wins}V</span>
                  {" "}<span style={{ color: "#f87171" }}>{champ.losses}D</span>
                </span>
                <span style={{ color: "#8a9bb0" }}>
                  KDA{" "}
                  <span style={{
                    color: champ.kda >= 3 ? "#ffd700" : champ.kda >= 2 ? theme.accent : "#8a9bb0",
                    fontWeight: 500
                  }}>
                    {champ.kda}
                  </span>
                </span>
                <span style={{ color: "#5c6470" }}>
                  {(champ.kills / champ.games).toFixed(1)} /
                  {" "}{(champ.deaths / champ.games).toFixed(1)} /
                  {" "}{(champ.assists / champ.games).toFixed(1)}
                </span>
              </div>

              <div style={{
                marginTop: "6px", height: "3px", borderRadius: "2px",
                background: "#1e2430", overflow: "hidden"
              }}>
                <div style={{
                  height: "100%", borderRadius: "2px",
                  width: `${champ.winrate}%`,
                  background: champ.winrate >= 50 ? "#4ade80" : "#f87171",
                  transition: "width .6s ease"
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}