import { motion } from 'framer-motion';

interface MainMenuProps {
  onStart: () => void;
  onLeaderboard: () => void;
}

export default function MainMenu({ onStart, onLeaderboard }: MainMenuProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-darker z-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyber-darker pointer-events-none"></div>

      <motion.h1 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-7xl md:text-9xl mb-12 text-center text-neon-blue font-bold tracking-widest glow-text uppercase"
      >
        Cyber<br/>
        <span className="text-neon-pink glow-text-pink">Runner</span>
      </motion.h1>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-6 w-64"
      >
        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-transparent border-2 border-neon-cyan text-neon-cyan font-bold text-xl uppercase tracking-wider overflow-hidden hover:bg-neon-blue hover:text-cyber-dark hover:shadow-[0_0_20px_#00f3ff] transition-all duration-300"
        >
          <span className="relative z-10">Start Protocol</span>
        </button>

        <button 
          onClick={onLeaderboard}
          className="group relative px-8 py-4 bg-transparent border-2 border-neon-purple text-neon-purple font-bold text-xl uppercase tracking-wider overflow-hidden hover:bg-neon-purple hover:text-white hover:shadow-[0_0_20px_#b026ff] transition-all duration-300"
        >
          <span className="relative z-10">Neural Net Ranks</span>
        </button>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-gray-400 font-inter text-sm"
      >
        A/D to move &nbsp;|&nbsp; W or SPACE to double-jump
      </motion.p>
    </motion.div>
  );
}
