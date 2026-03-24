type Champion = {
  id: number;
  name: string;
  image: string;
  level: number;
  points: number;
};

type RankInfo = {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winrate: number;
};

type Player = {
  game_name: string;
  tag_line: string;
  summoner_level: number;
  profile_icon_id: number;
  rank: RankInfo | null;
  top_champions: Champion[];
};

const TIER_THEMES: Record<string, { bg: string; accent: string; border: string; badge: string }> = {
  IRON:        { bg: "#0d0d0d", accent: "#8a8a8a", border: "#4a4a4a", badge: "#2a2a2a" },
  BRONZE:      { bg: "#1a0f0a", accent: "#cd7f32", border: "#8b4513", badge: "#2d1a0e" },
  SILVER:      { bg: "#0f1117", accent: "#c0c0c0", border: "#708090", badge: "#1e2430" },
  GOLD:        { bg: "#1a1500", accent: "#ffd700", border: "#b8860b", badge: "#2a2000" },
  PLATINUM:    { bg: "#001a1a", accent: "#00e5cc", border: "#007a6e", badge: "#002a28" },
  EMERALD:     { bg: "#001a0d", accent: "#00c853", border: "#006b3c", badge: "#002a15" },
  DIAMOND:     { bg: "#00001a", accent: "#b9f2ff", border: "#4fc3f7", badge: "#00002a" },
  MASTER:      { bg: "#1a001a", accent: "#9b59b6", border: "#6c3483", badge: "#2a002a" },
  GRANDMASTER: { bg: "#1a0000", accent: "#e74c3c", border: "#922b21", badge: "#2a0000" },
  CHALLENGER:  { bg: "#0a0a1a", accent: "#00d4ff", border: "#0078a0", badge: "#0a1020" },
};

const DEFAULT_THEME = { bg: "#0a0e1a", accent: "#c89b3c", border: "#3a3a3a", badge: "#161b27" };

const TIER_LABELS: Record<string, string> = {
  IRON: "Fer", BRONZE: "Bronze", SILVER: "Argent", GOLD: "Or",
  PLATINUM: "Platine", EMERALD: "Émeraude", DIAMOND: "Diamant",
  MASTER: "Master", GRANDMASTER: "Grand Master", CHALLENGER: "Challenger"
};

const MAX_POINTS: Record<number, number> = {
  1: 1800, 2: 2400, 3: 3000, 4: 4500, 5: 6300,
  6: 9000, 7: 13500, 8: 19800, 9: 28200, 10: 40200,
};

function getMasteryProgress(points: number, level: number): number {
  const max = MAX_POINTS[level] || MAX_POINTS[10];
  const prev = MAX_POINTS[level - 1] || 0;
  return Math.min(100, Math.round(((points - prev) / (max - prev)) * 100));
}

export default function PlayerCard({ player }: { player: Player }) {
  const tier = player.rank?.tier || "UNRANKED";
  const theme = TIER_THEMES[tier] || DEFAULT_THEME;
  const ddVersion = "16.6.1";

  return (
    <div style={{
      maxWidth: "620px", margin: "0 auto",
      background: theme.bg, borderRadius: "16px",
      border: `1px solid ${theme.border}`,
      padding: "1.5rem", transition: "all .3s ease"
    }}>

      {/* Header profil */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative" }}>
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/profileicon/${player.profile_icon_id}.png`}
            alt="icon"
            style={{ width: "72px", height: "72px", borderRadius: "50%", border: `3px solid ${theme.accent}` }}
          />
          <span style={{
            position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)",
            background: theme.badge, border: `1px solid ${theme.border}`,
            borderRadius: "10px", padding: "1px 8px",
            fontSize: "11px", fontWeight: 500, color: theme.accent, whiteSpace: "nowrap"
          }}>
            Niv. {player.summoner_level}
          </span>
        </div>
        <div>
          <h2 style={{ margin: 0, color: theme.accent, fontSize: "20px" }}>
            {player.game_name}
            <span style={{ color: "#5c6470", fontSize: "14px" }}>#{player.tag_line}</span>
          </h2>
          {player.rank ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier.toLowerCase()}.png`}
                alt={tier}
                style={{ width: "32px", height: "32px" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div>
                <span style={{ color: theme.accent, fontWeight: 500 }}>
                  {TIER_LABELS[tier]} {player.rank.rank}
                </span>
                <span style={{ color: "#5c6470", fontSize: "13px" }}> — {player.rank.lp} LP</span>
                <div style={{ fontSize: "12px", color: "#5c6470", marginTop: "2px" }}>
                  <span style={{ color: "#4ade80" }}>{player.rank.wins}V</span>
                  {" "}<span style={{ color: "#f87171" }}>{player.rank.losses}D</span>
                  {" "}· Winrate{" "}
                  <span style={{ color: player.rank.winrate >= 50 ? "#4ade80" : "#f87171", fontWeight: 500 }}>
                    {player.rank.winrate}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#5c6470", margin: "4px 0 0", fontSize: "13px" }}>Non classé</p>
          )}
        </div>
      </div>

      {/* Champions */}
      <h3 style={{
        color: "#5c6470", fontSize: "11px", textTransform: "uppercase",
        letterSpacing: "0.1em", margin: "0 0 10px"
      }}>
        Champions les plus joués
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {player.top_champions.map((champ, i) => {
          const progress = getMasteryProgress(champ.points, champ.level);
          return (
            <div key={champ.id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: theme.badge, borderRadius: "10px", padding: "10px 14px",
              border: `0.5px solid ${theme.border}`
            }}>
              <span style={{ color: "#5c6470", fontSize: "12px", minWidth: "14px" }}>{i + 1}</span>
              <img src={champ.image} alt={champ.name} style={{
                width: "44px", height: "44px", borderRadius: "6px",
                border: `2px solid ${theme.accent}`
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 500, color: theme.accent }}>{champ.name}</span>
                  <span style={{ fontSize: "11px", color: "#5c6470" }}>
                    Niv. {champ.level} · {champ.points.toLocaleString("fr-FR")} pts
                  </span>
                </div>
                {/* Barre de progression maîtrise */}
                <div style={{
                  marginTop: "6px", height: "4px", borderRadius: "2px",
                  background: theme.border, overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${theme.border}, ${theme.accent})`,
                    transition: "width .6s ease"
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}