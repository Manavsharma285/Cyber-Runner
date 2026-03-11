import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { playerService } from '../services/playerService';
import type { PlayerData } from '../services/playerService';
import { HiUser, HiLockClosed, HiMail } from 'react-icons/hi';

interface AuthPageProps {
  onAuthSuccess: (player: PlayerData) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const playerData = await playerService.ensurePlayerData(
          userCredential.user.uid,
          userCredential.user.email || '',
          userCredential.user.displayName
        );
        onAuthSuccess(playerData);
      } else {
        if (!username) throw new Error("Username is required");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        const playerData = await playerService.createPlayer(userCredential.user.uid, username, email);
        onAuthSuccess(playerData);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Connection to grid failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cyber-darker p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-cyber-dark border border-neon-cyan/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple" />
        
        <h2 className="text-4xl font-bold text-center mb-8 text-white tracking-widest uppercase">
          {isLogin ? 'Login' : 'Signup'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                key="username"
                className="relative"
              >
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan" />
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-cyber-darker border border-neon-cyan/20 px-10 py-3 rounded-lg text-white placeholder-white/30 focus:border-neon-cyan outline-none transition-colors"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan" />
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cyber-darker border border-neon-cyan/20 px-10 py-3 rounded-lg text-white placeholder-white/30 focus:border-neon-cyan outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan" />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-darker border border-neon-cyan/20 px-10 py-3 rounded-lg text-white placeholder-white/30 focus:border-neon-cyan outline-none transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center font-bold tracking-tight">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-cyan hover:bg-white text-cyber-dark font-black py-3 rounded-lg uppercase tracking-tighter transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter The Grid' : 'Initialize Identity')}
          </button>
        </form>

        <p className="mt-8 text-center text-white/50 text-sm">
          {isLogin ? "DON'T HAVE AN ACCOUNT?" : "ALREADY ENROLLED?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-neon-cyan font-bold hover:underline"
          >
            {isLogin ? 'SIGNUP' : 'LOGIN'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
