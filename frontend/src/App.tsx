import { useState } from "react";
import axios from "axios";
import PlayerCard, { TIER_THEMES } from "./components/PlayerCard";
import StatsCard from "./components/StatsCard";

type TabId = "profile" | "soloq" | "flex" | "normal";

const TABS: { id: TabId; label: string; endpoint: string }[] = [
  { id: "profile", label: "Profil",         endpoint: "" },
  { id: "soloq",   label: "Ranked SoloQ",   endpoint: "stats/soloq" },
  { id: "flex",    label: "Ranked Flex",    endpoint: "stats/flex" },
  { id: "normal",  label: "Autres parties", endpoint: "stats/normal" },
];

function App() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [player, setPlayer] = useState<any>(null);
  const [statsCache, setStatsCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const tier = player?.rank?.tier;
  const pageBg = tier ? (TIER_THEMES[tier]?.bg || "#0a0e1a") : "#0a0e1a";
  const pageAccent = tier ? (TIER_THEMES[tier]?.accent || "#c89b3c") : "#c89b3c";

  const search = async () => {
    if (!gameName || !tagLine) return;
    setLoading(true);
    setError("");
    setPlayer(null);
    setStatsCache({});
    setActiveTab("profile");
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

  const switchTab = async (tab: typeof TABS[number]) => {
    setActiveTab(tab.id);
    if (tab.id === "profile") return;
    if (statsCache[tab.id]) return;
    setLoadingTab(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/player/${encodeURIComponent(gameName)}/${tagLine}/${tab.endpoint}`
      );
      setStatsCache(prev => ({ ...prev, [tab.id]: res.data }));
    } catch (e) {
      setError(`Erreur lors du chargement de ${tab.label}.`);
    } finally {
      setLoadingTab(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: pageBg,
      color: "#fff",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "2rem",
      transition: "background .5s ease"
    }}>

      {/* Titre */}
      <h1 style={{
        color: pageAccent,
        textAlign: "center",
        marginBottom: "2rem",
        fontSize: "2.4rem",
        letterSpacing: "0.05em",
        fontWeight: 700,
        transition: "color .5s ease"
      }}>
        LoL Advisor
      </h1>

      {/* Barre de recherche */}
      <div style={{
        display: "flex", gap: "8px", justifyContent: "center",
        marginBottom: "2.5rem"
      }}>
        <input
          placeholder="Pseudo"
          value={gameName}
          onChange={e => setGameName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{
            padding: "12px 18px", borderRadius: "10px",
            border: `1.5px solid ${pageAccent}`,
            background: "#0d1117", color: "#fff",
            fontSize: "15px", width: "210px",
            outline: "none", transition: "border-color .5s ease"
          }}
        />
        <input
          placeholder="TAG"
          value={tagLine}
          onChange={e => setTagLine(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{
            padding: "12px 18px", borderRadius: "10px",
            border: `1.5px solid ${pageAccent}`,
            background: "#0d1117", color: "#fff",
            fontSize: "15px", width: "100px",
            outline: "none", transition: "border-color .5s ease"
          }}
        />
        <button onClick={search} style={{
          padding: "12px 28px", borderRadius: "10px", border: "none",
          background: pageAccent, color: "#0a0e1a", fontWeight: 700,
          fontSize: "15px", cursor: "pointer", transition: "background .5s ease",
          letterSpacing: "0.03em"
        }}>
          Rechercher
        </button>
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: pageAccent, fontSize: "15px" }}>
          Chargement du profil...
        </p>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "#f87171", fontSize: "14px" }}>{error}</p>
      )}

      {player && (
        <div style={{ maxWidth: "660px", margin: "0 auto" }}>

          {/* Pills de navigation */}
          <div style={{
            display: "flex", gap: "8px", marginBottom: "16px",
            justifyContent: "center", flexWrap: "wrap"
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: `1.5px solid ${activeTab === tab.id ? pageAccent : "#2a2a3a"}`,
                  background: activeTab === tab.id ? pageAccent : "transparent",
                  color: activeTab === tab.id ? "#0a0e1a" : "#5c6470",
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  fontSize: "13px", cursor: "pointer",
                  transition: "all .2s ease",
                  letterSpacing: "0.02em"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu de l'onglet actif */}
          <div style={{
            background: "#0d1117",
            borderRadius: "16px",
            border: `1.5px solid ${pageAccent}`,
            overflow: "hidden"
          }}>
            {activeTab === "profile" && <PlayerCard player={player} embedded />}
            {activeTab !== "profile" && (
              loadingTab
                ? <p style={{
                    textAlign: "center", padding: "3rem",
                    color: pageAccent, fontSize: "14px"
                  }}>
                    Chargement des 20 dernières parties... (3-4 sec)
                  </p>
                : statsCache[activeTab]
                  ? <StatsCard
                      stats={statsCache[activeTab]}
                      theme={{ accent: pageAccent, bg: pageBg }}
                    />
                  : null
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default App;