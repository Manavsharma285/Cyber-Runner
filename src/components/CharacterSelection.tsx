import React from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle } from 'react-icons/hi';

export interface Character {
  id: string;
  name: string;
  description: string;
  color: string;
  glow: string;
}

export const CHARACTERS: Character[] = [
  { id: 'ninja', name: 'Cyber Ninja', description: 'Fast and agile with double jump.', color: '#00f3ff', glow: 'shadow-[0_0_20px_#00f3ff]' },
  { id: 'explorer', name: 'Space Explorer', description: 'Advanced suit with high durability.', color: '#ff00ff', glow: 'shadow-[0_0_20px_#ff00ff]' },
  { id: 'runner', name: 'Robot Runner', description: 'Industrial robot with steady speed.', color: '#ffff00', glow: 'shadow-[0_0_20px_#ffff00]' },
  { id: 'adventurer', name: 'Jungle Adventurer', description: 'Master of the wild terrain.', color: '#00ff00', glow: 'shadow-[0_0_20px_#00ff00]' },
];

interface CharacterSelectionProps {
  selectedId: string;
  onSelect: (character: Character) => void;
  onConfirm: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  selectedId, 
  onSelect, 
  onConfirm 
}) => {
  return (
    <div className="min-h-screen bg-cyber-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-black text-white mb-12 tracking-tighter uppercase glow-text-white italic"
      >
        Select Your Avatar
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {CHARACTERS.map((char, index) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(char)}
            className={`relative p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center
              ${selectedId === char.id ? `bg-white/10 ${char.glow} border-white scale-105` : 'bg-cyber-dark border-white/10 hover:border-white/30'}
            `}
          >
            {selectedId === char.id && (
              <div className="absolute -top-4 -right-4 text-4xl text-white">
                <HiCheckCircle />
              </div>
            )}
            
            {/* Character Placeholder / Preview */}
            <div 
              style={{ backgroundColor: char.color }}
              className={`w-24 h-32 rounded-lg mb-6 transition-all ${selectedId === char.id ? 'animate-bounce' : ''}`}
            />

            <h3 className="text-2xl font-bold text-white mb-2 uppercase">{char.name}</h3>
            <p className="text-white/60 text-sm leading-tight">{char.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onConfirm}
        className="mt-16 bg-white text-cyber-dark font-black px-12 py-4 rounded-xl uppercase tracking-tighter text-2xl hover:scale-105 transition-transform"
      >
        Synchronize Data
      </motion.button>
    </div>
  );
};

export default CharacterSelection;
