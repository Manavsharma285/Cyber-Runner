import React from 'react';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiOutlineLightningBolt, HiCursorClick, HiShieldCheck } from 'react-icons/hi';

interface MissionIntelProps {
  onBack: () => void;
}

const MissionIntel: React.FC<MissionIntelProps> = ({ onBack }) => {
  const intelSections = [
    {
      title: 'MOVEMENT PROTOCOLS',
      icon: HiOutlineLightningBolt,
      items: [
        'Use [SPACE] or [CLICK] to activate jump thrusters.',
        'Perform maneuvers mid-air to avoid obstacles.',
        'Maintain velocity to increase score multiplier.'
      ],
      color: 'text-neon-cyan',
      glow: 'glow-text-cyan'
    },
    {
      title: 'OBJECTIVE: SECTOR PURGE',
      icon: HiCursorClick,
      items: [
        'Infiltrate deep into the cyber forest.',
        'Avoid collision with static and moving barriers.',
        'Collecting power-ups will temporarily augment your abilities.'
      ],
      color: 'text-neon-pink',
      glow: 'glow-text-pink'
    },
    {
      title: 'DATA PERSISTENCE',
      icon: HiShieldCheck,
      items: [
        'All high scores are synced with the global neural net.',
        'Your selected character identity is stored in your profile.',
        'The leaderboard tracks the top 10 operatives globally.'
      ],
      color: 'text-neon-purple',
      glow: 'glow-text-purple'
    }
  ];

  return (
    <div className="min-h-screen bg-cyber-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-neon-cyan transition-colors uppercase font-bold tracking-[0.2em] mb-8"
        >
          <HiArrowLeft /> Return to Dashboard
        </button>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase glow-text-white italic">
          Mission Intel
        </h1>
        <div className="h-1 w-32 bg-neon-cyan mx-auto mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        {intelSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-cyber-dark/50 border border-white/10 rounded-2xl backdrop-blur-sm relative group hover:border-white/30 transition-all"
          >
            <div className={`text-4xl ${section.color} mb-6`}>
              <section.icon />
            </div>
            <h3 className={`text-xl font-black mb-6 tracking-widest uppercase ${section.color}`}>
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed font-bold">
                  <span className={section.color}>▸</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-white/20 font-orbitron text-[10px] tracking-[0.5em] uppercase"
      >
        Neural Simulation Version 2.0.4 // Grid Connection Stable
      </motion.div>
    </div>
  );
};

export default MissionIntel;
