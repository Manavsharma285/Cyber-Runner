import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameState } from '../game/GameEngine';

interface GameCanvasProps {
  initialState: GameState;
  onStateUpdate: (state: GameState) => void;
}

export default function GameCanvas({ initialState, onStateUpdate }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const onStateUpdateRef = useRef(onStateUpdate);
  onStateUpdateRef.current = onStateUpdate;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Make canvas fill screen or container
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();

    // Init engine
    engineRef.current = new GameEngine(canvasRef.current, initialState);
    
    // Bind state callback
    engineRef.current.onStateChange = (state) => {
      onStateUpdateRef.current({ ...state }); 
    };

    // Keyboard bindings
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engineRef.current) engineRef.current.keys[e.code] = true;
      if (engineRef.current) engineRef.current.keys[e.key] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) engineRef.current.keys[e.code] = false;
      if (engineRef.current) engineRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start
    engineRef.current.start();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engineRef.current?.stop();
    };
  }, [initialState]);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full bg-cyber-darker touch-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
