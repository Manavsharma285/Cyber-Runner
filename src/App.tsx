import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import GameCanvas from './components/GameCanvas';
import type { GameState } from './game/GameEngine';
import { InfiniteGenerator } from './game/InfiniteGenerator';
import GameOver from './components/GameOver';
import Leaderboard from './components/Leaderboard';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import MissionIntel from './components/MissionIntel';
import CharacterSelection, { CHARACTERS, type Character } from './components/CharacterSelection';
import { playerService, type PlayerData } from './services/playerService';

type AppState = 'AUTH' | 'DASHBOARD' | 'CHARACTER_SELECT' | 'PLAYING' | 'GAMEOVER' | 'LEADERBOARD' | 'INSTRUCTIONS';

function App() {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [user, setUser] = useState<PlayerData | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [uiState, setUiState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Monitor Auth State
  useEffect(() => {
    // Safety timeout: transition to AUTH if initialization takes too long
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out. Proceeding to grid.");
        setLoading(false);
        setAppState('AUTH');
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setLoading(true);
      try {
        if (firebaseUser) {
          const playerData = await playerService.ensurePlayerData(
            firebaseUser.uid, 
            firebaseUser.email || '', 
            firebaseUser.displayName
          );
          setUser(playerData);
          const char = CHARACTERS.find(c => c.id === playerData.selectedCharacter) || CHARACTERS[0];
          setSelectedCharacter(char);
          setAppState('DASHBOARD');
        } else {
          setUser(null);
          setAppState('AUTH');
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        setErrorMessage(error.message?.includes('permission-denied') 
          ? "CRITICAL: Firestore permissions denied. Please enable 'Test Mode' in Firebase Console." 
          : "NEURAL LINK FAILURE: " + (error.message || "Unknown Error"));
        setAppState('AUTH');
      } finally {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const startGame = useCallback(() => {
    setAppState('PLAYING');
  }, []);

  const initialState = useMemo(() => {
    return InfiniteGenerator.generateInitialState(selectedCharacter.color);
  }, [appState === 'PLAYING', selectedCharacter]);

  const handleStateUpdate = useCallback((state: GameState) => {
    setUiState(state);
    if (state.isGameOver || state.isVictory) {
      setAppState('GAMEOVER');
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white font-orbitron bg-cyber-darker">
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-darker z-50">
            <div className="text-4xl font-black text-neon-cyan animate-pulse tracking-widest uppercase mb-4">
              Initializing...
            </div>
          </div>
        ) : errorMessage ? (
          <div key="error" className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-darker z-50 p-6 text-center">
            <div className="text-2xl font-black text-red-500 tracking-widest uppercase mb-4 glow-text-red">
              {errorMessage}
            </div>
            <p className="text-white/40 mb-8 max-w-md">
              Usually this means **Cloud Firestore** is not enabled in your Firebase Console, or database rules are set to "Locked Mode".
            </p>
            <button 
              onClick={() => { setErrorMessage(null); setAppState('AUTH'); }}
              className="bg-white text-cyber-dark px-8 py-3 font-black uppercase tracking-tighter hover:scale-105 transition-transform"
            >
              Back to Login
            </button>
          </div>
        ) : appState === 'AUTH' && (
          <AuthPage 
            key="auth" 
            onAuthSuccess={(player: PlayerData) => {
              setUser(player);
              const char = CHARACTERS.find(c => c.id === player.selectedCharacter) || CHARACTERS[0];
              setSelectedCharacter(char);
              setAppState('DASHBOARD');
            }} 
          />
        )}

        {appState === 'DASHBOARD' && user && (
          <Dashboard 
            key="dashboard"
            username={user.username}
            highScore={user.highScore}
            onStart={startGame}
            onCharacterSelect={() => setAppState('CHARACTER_SELECT')}
            onLeaderboard={() => setAppState('LEADERBOARD')}
            onInstructions={() => setAppState('INSTRUCTIONS')}
          />
        )}

        {appState === 'CHARACTER_SELECT' && (
          <CharacterSelection 
            key="char-select"
            selectedId={selectedCharacter.id}
            onSelect={setSelectedCharacter}
            onConfirm={async () => {
              if (user) {
                await playerService.updateSelectedCharacter(user.uid, selectedCharacter.id);
                setUser({ ...user, selectedCharacter: selectedCharacter.id });
              }
              setAppState('DASHBOARD');
            }}
          />
        )}

        {appState === 'PLAYING' && (
          <div key="game" className="absolute inset-0">
            <GameCanvas 
              initialState={initialState} 
              onStateUpdate={handleStateUpdate} 
            />
            
            {/* HUD Layer Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none z-10">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-bold text-white/50 tracking-[0.2em] uppercase italic">{user?.username}</div>
                <div className="text-2xl font-bold text-neon-pink glow-text-pink flex gap-2 items-center">
                  <span>HP:</span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-6 h-6 border-2 border-neon-pink ${i < (uiState?.player.hp ?? 3) ? 'bg-neon-pink shadow-[0_0_10px_#ff00ff]' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Distance Meter (Center) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-8 text-center">
                <div className="text-xs text-white/40 tracking-[0.5em] uppercase mb-1">Traversing Grid</div>
                <div className="text-3xl font-black text-white glow-text-white italic">
                  {Math.floor((uiState?.player.bounds.x ?? 0) / 10)}<span className="text-sm not-italic opacity-50 ml-1">M</span>
                </div>
                <div className="w-48 h-1 bg-white/10 mt-2 mx-auto overflow-hidden">
                  <motion.div 
                    className="h-full bg-neon-cyan"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-white/50 uppercase tracking-widest mb-1">
                  BEST: {user?.highScore ?? 0}
                </div>
                <div className="text-2xl font-bold text-neon-blue glow-text">
                  SCORE: {uiState?.player.score ?? 0}
                </div>
                {uiState?.player.powerupType && (
                  <div className="text-sm font-bold text-neon-cyan uppercase animate-pulse mt-2">
                    {uiState.player.powerupType} ACTIVATED
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {appState === 'GAMEOVER' && uiState && (
          <GameOver 
            key="gameover"
            score={uiState.player.score}
            isVictory={uiState.isVictory}
            onRestart={startGame}
            onMainMenu={() => setAppState('DASHBOARD')}
            username={user?.username || 'Player'}
          />
        )}

        {appState === 'LEADERBOARD' && (
          <Leaderboard 
            key="leaderboard"
            onBack={() => setAppState('DASHBOARD')}
          />
        )}

        {appState === 'INSTRUCTIONS' && (
          <MissionIntel 
            key="mission-intel"
            onBack={() => setAppState('DASHBOARD')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
