import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { playerService } from '../services/playerService';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onMainMenu: () => void;
  isVictory?: boolean;
  username: string;
}

export default function GameOver({ 
  score, 
  onRestart, 
  onMainMenu, 
  isVictory = false,
  username
}: GameOverProps) {
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR'>('IDLE');

  useEffect(() => {
    const syncScore = async () => {
      const user = auth.currentUser;
      if (user) {
        setSyncStatus('SYNCING');
        try {
          await playerService.updateHighScore(user.uid, score);
          setSyncStatus('SYNCED');
        } catch (err) {
          console.error("Score sync failed:", err);
          setSyncStatus('ERROR');
        }
      }
    };
    syncScore();
  }, [score]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 pointer-events-auto"
    >
      <div className="text-center p-12 w-full max-w-2xl border-2 border-neon-pink shadow-[0_0_30px_#ff00ff] bg-cyber-dark/90">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl mb-4 font-bold text-neon-pink glow-text-pink uppercase"
        >
          NEURAL LINK SEVERED
        </motion.h1>
        
        <p className="text-gray-400 mb-8 font-inter uppercase tracking-widest">
          Mission Termination Logged
        </p>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="text-4xl mb-8 text-white font-bold"
        >
          FINAL SCORE: <span className="text-white drop-shadow-[0_0_10px_#b026ff]">{score.toLocaleString()}</span>
        </motion.div>

        <div className="mb-12">
          <div className={`w-full bg-black/50 border mb-4 ${isVictory ? 'border-neon-blue' : 'border-neon-pink'} text-white text-center text-xl p-3 uppercase font-orbitron`}>
            OPERATIVE: {username}
          </div>
          
          <div className="text-sm tracking-widest uppercase font-bold min-h-[1.5rem]">
            {syncStatus === 'SYNCING' && <span className="text-neon-cyan animate-pulse">Syncing with Neural Net...</span>}
            {syncStatus === 'SYNCED' && <span className="text-neon-cyan">Score data persistent</span>}
            {syncStatus === 'ERROR' && <span className="text-red-500">Sync protocols failed</span>}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={onRestart}
            className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black font-bold tracking-widest transition-colors uppercase"
          >
            Reboot Sequence
          </button>
          <button 
            onClick={onMainMenu}
            className="px-8 py-3 w-1/2 bg-neon-purple text-white hover:bg-white hover:text-neon-purple font-bold tracking-widest transition-colors uppercase shadow-[0_0_15px_#b026ff]"
          >
            Exit Node
          </button>
        </div>
      </div>
    </motion.div>
  );
}
