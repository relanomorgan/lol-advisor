type Champion = {
  id: number;
  name: string;
  image: string;
  level: number;
  points: number;
};

type Player = {
  game_name: string;
  tag_line: string;
  summoner_level: number;
  top_champions: Champion[];
};

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div style={{
      maxWidth: "600px", margin: "0 auto",
      background: "#0d1117", borderRadius: "12px",
      border: "1px solid #c89b3c", padding: "1.5rem"
    }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#c89b3c", margin: 0 }}>
          {player.game_name}
          <span style={{ color: "#5c6470", fontSize: "16px" }}>#{player.tag_line}</span>
        </h2>
        <p style={{ color: "#8a9bb0", margin: "4px 0 0" }}>
          Niveau {player.summoner_level}
        </p>
      </div>

      <h3 style={{ color: "#8a9bb0", fontSize: "13px", textTransform: "uppercase",
        letterSpacing: "0.1em", marginBottom: "1rem" }}>
        Champions les plus joués
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {player.top_champions.map((champ, i) => (
          <div key={champ.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#161b27", borderRadius: "8px", padding: "10px 14px"
          }}>
            <span style={{ color: "#5c6470", fontSize: "13px", minWidth: "16px" }}>
              {i + 1}
            </span>
            <img
              src={champ.image}
              alt={champ.name}
              style={{ width: "48px", height: "48px", borderRadius: "6px",
                border: "2px solid #c89b3c" }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: "bold", color: "#e2c97e" }}>
                {champ.name}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#5c6470" }}>
                {champ.points.toLocaleString()} points · Niveau {champ.level}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}