import React from 'react';
import PropTypes from 'prop-types';

export default function LeaderboardTable({ leaderboardData }) {
  return (
    <div className="glass-panel overflow-hidden border border-theme-neon/15 shadow-neon-sm rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-theme-neon/10 text-[10px] font-black tracking-widest text-theme-muted uppercase">
              <th className="py-4 px-6 text-center w-20">RANGO</th>
              <th className="py-4 px-6">JUGADOR</th>
              <th className="py-4 px-6 text-center">VICTORIAS</th>
              <th className="py-4 px-6 text-center">DERROTAS</th>
              <th className="py-4 px-6">WIN RATE</th>
              <th className="py-4 px-6 text-right">PUNTUACIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {leaderboardData.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-theme-muted italic">
                  No se encontraron usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              leaderboardData.map((player) => {
                const totalGames = player.wins + player.losses;
                const winRate = ((player.wins / totalGames) * 100).toFixed(1);
                
                // Stylized Rank tags
                const getRankBadge = (rank) => {
                  if (rank === 1) return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded font-black shadow-[0_0_8px_rgba(245,158,11,0.2)]">#01</span>;
                  if (rank === 2) return <span className="bg-slate-300/20 text-slate-300 border border-slate-300/30 px-2 py-1 rounded font-black">#02</span>;
                  if (rank === 3) return <span className="bg-amber-700/20 text-amber-600 border border-amber-700/30 px-2 py-1 rounded font-black">#03</span>;
                  return <span className="text-theme-muted font-mono">{rank < 10 ? `0${rank}` : rank}</span>;
                };

                return (
                  <tr key={player.rank} className="hover:bg-theme-neon/5 transition-colors group cursor-pointer">
                    {/* Rank Column */}
                    <td className="py-4 px-6 text-center font-bold">
                      {getRankBadge(player.rank)}
                    </td>
                    
                    {/* Name/Avatar Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black/40 border border-theme-neon/20 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-theme-neon/50 transition-colors">
                          {player.avatar === 'none' ? (
                            <span className="text-xs font-bold text-theme-neon font-display">{player.name.substring(0, 2).toUpperCase()}</span>
                          ) : (
                            <img src={player.avatar} alt="avatar" className="w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-theme-neon transition-colors">{player.name}</span>
                          <span className="text-[10px] text-theme-muted/50 font-mono mt-0.5">{player.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Wins Column */}
                    <td className="py-4 px-6 text-center font-bold text-white">
                      {player.wins}
                    </td>

                    {/* Losses Column */}
                    <td className="py-4 px-6 text-center text-theme-muted">
                      {player.losses}
                    </td>

                    {/* Win rate Bar Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 w-32 md:w-44">
                        <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-theme-neon shadow-neon-sm" 
                            style={{ width: `${winRate}%`, boxShadow: '0 0 5px var(--theme-neon)' }}
                          ></div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-theme-neon">{winRate}%</span>
                      </div>
                    </td>

                    {/* Score Column */}
                    <td className="py-4 px-6 text-right font-black text-white text-sm font-mono tracking-wide group-hover:text-theme-neon transition-colors">
                      {player.score.toLocaleString()} <span className="text-[10px] font-normal text-theme-muted">EP</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

LeaderboardTable.propTypes = {
  leaderboardData: PropTypes.arrayOf(PropTypes.object).isRequired
};
