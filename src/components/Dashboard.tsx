import React from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/firebase';
import { HiPlay, HiUsers, HiChartBar, HiInformationCircle, HiLogout } from 'react-icons/hi';

interface DashboardProps {
  username: string;
  highScore: number;
  onStart: () => void;
  onCharacterSelect: () => void;
  onLeaderboard: () => void;
  onInstructions: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  username, 
  highScore,
  onStart, 
  onCharacterSelect, 
  onLeaderboard, 
  onInstructions 
}) => {
  const handleLogout = () => {
    auth.signOut();
  };

  const menuItems = [
    { label: 'START OPERATION', icon: HiPlay, action: onStart, color: 'text-neon-cyan', border: 'border-neon-cyan/50' },
    { label: 'SELECT CHARACTER', icon: HiUsers, action: onCharacterSelect, color: 'text-neon-pink', border: 'border-neon-pink/50' },
    { label: 'GLOBAL RANKINGS', icon: HiChartBar, action: onLeaderboard, color: 'text-neon-purple', border: 'border-neon-purple/50' },
    { label: 'MISSION INTEL', icon: HiInformationCircle, action: onInstructions, color: 'text-white', border: 'border-white/20' },
  ];

  return (
    <div className="min-h-screen bg-cyber-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Visual Enhancements Layer */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="scanline" />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-neon-pink/10 rounded-full blur-[150px]" />
      </div>

      {/* Floating Particles Graphics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan/50 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.2
            }}
            animate={{ 
              y: [null, Math.random() * -100, Math.random() * 100],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>


      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="text-center z-10 mb-12"
      >
        <h2 className="text-xl font-bold text-neon-cyan mb-2 tracking-[0.3em] uppercase opacity-80 animate-pulse">Neural Link Active</h2>
        <h1 className="text-7xl font-black text-white tracking-tighter uppercase glow-text-white italic mb-4 leading-none">
          {username}
        </h1>
        <div className="text-neon-purple font-black text-2xl tracking-[0.2em] uppercase bg-neon-purple/5 px-6 py-2 rounded-full border border-neon-purple/20 inline-block">
          Neural Record: {highScore.toLocaleString()}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              damping: 12,
              stiffness: 100
            }}
            onClick={item.action}
            className={`flex items-center gap-6 p-6 bg-cyber-dark/80 backdrop-blur-md border-2 ${item.border} rounded-xl hover:bg-white/5 transition-all group relative overflow-hidden glitch-hover shadow-xl`}
          >
            <div className={`text-4xl ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon />
            </div>
            <span className="text-2xl font-bold text-white tracking-widest uppercase text-left leading-none">
              {item.label}
            </span>
            <div className={`absolute bottom-0 left-0 h-1 w-0 bg-current ${item.color} group-hover:w-full transition-all duration-300`} />
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleLogout}
        className="mt-12 flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-bold tracking-widest text-sm"
      >
        <HiLogout /> Terminate Session
      </motion.button>
    </div>
  );
};

export default Dashboard;
