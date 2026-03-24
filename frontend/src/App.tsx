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
      fontFamily: "sans-serif",
      padding: "2rem",
      transition: "background .5s ease"
    }}>
      <h1 style={{
        color: pageAccent, textAlign: "center",
        marginBottom: "2rem", transition: "color .5s ease"
      }}>
        LoL Advisor
      </h1>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "2rem" }}>
        <input
          placeholder="Pseudo"
          value={gameName}
          onChange={e => setGameName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{
            padding: "10px 16px", borderRadius: "6px",
            border: `1px solid ${pageAccent}`,
            background: "#0d1117", color: "#fff", fontSize: "16px", width: "200px",
            transition: "border-color .5s ease"
          }}
        />
        <input
          placeholder="TAG"
          value={tagLine}
          onChange={e => setTagLine(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{
            padding: "10px 16px", borderRadius: "6px",
            border: `1px solid ${pageAccent}`,
            background: "#0d1117", color: "#fff", fontSize: "16px", width: "100px",
            transition: "border-color .5s ease"
          }}
        />
        <button onClick={search} style={{
          padding: "10px 24px", borderRadius: "6px", border: "none",
          background: pageAccent, color: "#0a0e1a", fontWeight: "bold",
          fontSize: "16px", cursor: "pointer", transition: "background .5s ease"
        }}>
          Rechercher
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", color: pageAccent }}>Chargement...</p>}
      {error && <p style={{ textAlign: "center", color: "#e84057" }}>{error}</p>}

      {player && (
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "0" }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab)}
                style={{
                  flex: 1, padding: "10px 6px",
                  borderRadius: "8px 8px 0 0",
                  border: `1px solid ${activeTab === tab.id ? pageAccent : "#2a2a2a"}`,
                  borderBottom: activeTab === tab.id ? "none" : `1px solid ${pageAccent}`,
                  background: activeTab === tab.id ? pageBg : "#0d1117",
                  color: activeTab === tab.id ? pageAccent : "#5c6470",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: "12px", cursor: "pointer", transition: "all .2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div style={{
            border: `1px solid ${pageAccent}`,
            borderRadius: "0 0 16px 16px",
            overflow: "hidden"
          }}>
            {activeTab === "profile" && <PlayerCard player={player} embedded />}
            {activeTab !== "profile" && (
              loadingTab
                ? <p style={{ textAlign: "center", padding: "2rem", color: pageAccent }}>
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