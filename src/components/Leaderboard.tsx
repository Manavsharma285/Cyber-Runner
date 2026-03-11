import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playerService, type PlayerData } from '../services/playerService';
import { CHARACTERS } from './CharacterSelection';

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [scores, setScores] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const topScores = await playerService.getLeaderboard(10);
      setScores(topScores);
      setLoading(false);
    };
    fetchScores();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-darker z-50 p-4"
    >
      <div className="relative z-10 w-full max-w-3xl bg-cyber-dark border border-neon-cyan/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,243,255,0.1)] backdrop-blur-md overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple" />
        
        <h2 className="text-5xl font-black text-white text-center mb-12 tracking-tighter uppercase glow-text-white italic">
          Hall of Legends
        </h2>

        {loading ? (
          <div className="text-center text-neon-cyan animate-pulse py-20 text-2xl font-bold tracking-widest">
            SYNCHRONIZING WITH GRID...
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {scores.map((score, index) => {
              const charInfo = CHARACTERS.find(c => c.id === score.selectedCharacter);
              return (
                <motion.div 
                  key={score.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-4 bg-white/5 border border-white/5 hover:border-neon-cyan/50 hover:bg-white/10 transition-all rounded-lg group"
                >
                  <div className="flex gap-4 items-center">
                    <span className={`text-2xl font-black w-10 ${index < 3 ? 'text-neon-cyan scale-125' : 'text-white/30'}`}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-white uppercase group-hover:text-neon-cyan transition-colors">
                        {score.username}
                      </span>
                      <span className="text-xs text-white/40 uppercase tracking-widest font-bold">
                        {charInfo?.name || 'Unknown Agent'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-2xl text-neon-cyan font-black italic tracking-tighter">
                      {score.highScore.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button 
            onClick={onBack}
            className="px-12 py-4 bg-white text-cyber-dark font-black rounded-xl uppercase tracking-tighter text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Terminal Exit
          </button>
        </div>
      </div>
    </motion.div>
  );
}
