import React, { useState, useEffect } from "react";
import { FiSearch, FiAward, FiTrendingUp } from "react-icons/fi";
import { useGame } from "../context/GameContext";
import LeaderboardTable from "../components/game/LeaderboardTable";

export default function Ranking() {
  const { gameInfo } = useGame();
  const [searchTerm, setSearchTerm] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const getApiUrl = (path) => {
          const base = (import.meta.env.VITE_API_URL || "/api").replace(
            /\/api$/,
            "",
          );
          return `${base}${path}`;
        };
        const res = await fetch(
          getApiUrl(`/api/game/${gameInfo.id}/leaderboard`),
        );
        const data = await res.json();
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          const mapped = data.leaderboard.map((p) => {
            // Convert string score to integer if it has commas
            const scoreVal =
              typeof p.score === "string"
                ? Number.parseInt(p.score.replaceAll(",", ""))
                : p.score;
            return {
              rank: p.rank,
              name: p.name,
              id: `${p.name}#DC`,
              wins: Math.floor(scoreVal * 0.08) + 12,
              losses: Math.floor(scoreVal * 0.03) + 5,
              score: scoreVal,
              avatar: p.avatar_url || "none",
            };
          });
          setLeaderboard(mapped);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameInfo.id]);

  const filteredLeaderboard = leaderboard.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in max-w-6xl mx-auto w-full transition-all duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-theme-neon/20 pb-6 mb-8 gap-4">
        <div>
          <h1
            className="font-display font-black text-4xl text-white tracking-wide uppercase flex items-center gap-3"
            style={{ textShadow: "0 0 12px var(--theme-neon-glow)" }}
          >
            <FiAward className="text-theme-neon" /> Clasificación Global
          </h1>
          <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
            Los 10 mejores usuarios activos en la red DeathCloud
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-neon"
            size={16}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full bg-black/40 border border-theme-neon/20 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-theme-neon transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-theme-neon">
          Cargando clasificación...
        </div>
      ) : (
        <>
          {/* Leaderboard Table Container */}
          {filteredLeaderboard.length > 0 ? (
            <LeaderboardTable leaderboardData={filteredLeaderboard} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-black/20 border border-white/5 rounded-2xl w-full">
              <FiTrendingUp className="text-4xl text-theme-muted mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                Aún no hay puntuaciones registradas
              </h3>
              <p className="text-sm text-theme-muted text-center max-w-md">
                La tabla de clasificación global está en pretemporada. Aún no
                hay usuarios con puntuación activa para este título.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
