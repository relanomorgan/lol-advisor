import { useState } from "react";
import axios from "axios";
import PlayerCard from "./components/PlayerCard";

function App() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!gameName || !tagLine) return;
    setLoading(true);
    setError("");
    setPlayer(null);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/player/${encodeURIComponent(gameName)}/${tagLine}`
      );
      setPlayer(res.data);
    } catch (e) {
      setError("Joueur introuvable ou erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e1a",
      color: "#fff",
      fontFamily: "sans-serif",
      padding: "2rem"
    }}>
      <h1 style={{ color: "#c89b3c", textAlign: "center", marginBottom: "2rem" }}>
        LoL Advisor
      </h1>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "2rem" }}>
        <input
          placeholder="Pseudo"
          value={gameName}
          onChange={e => setGameName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{
            padding: "10px 16px", borderRadius: "6px", border: "1px solid #c89b3c",
            background: "#0d1117", color: "#fff", fontSize: "16px", width: "200px"
          }}
        />
        <input
          placeholder="TAG"
          value={tagLine}
          onChange={e => setTagLine(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{
            padding: "10px 16px", borderRadius: "6px", border: "1px solid #c89b3c",
            background: "#0d1117", color: "#fff", fontSize: "16px", width: "100px"
          }}
        />
        <button
          onClick={search}
          style={{
            padding: "10px 24px", borderRadius: "6px", border: "none",
            background: "#c89b3c", color: "#0a0e1a", fontWeight: "bold",
            fontSize: "16px", cursor: "pointer"
          }}
        >
          Rechercher
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#c89b3c" }}>Chargement...</p>}
      {error && <p style={{ textAlign: "center", color: "#e84057" }}>{error}</p>}
      {player && <PlayerCard player={player} />}
    </div>
  );
}

export default App;