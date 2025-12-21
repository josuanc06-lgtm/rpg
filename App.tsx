
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Position, Entity, GameState } from './types';
import { WORLD_SIZE, PLAYER_SPEED, INITIAL_ENTITIES, INTERACTION_RANGE } from './constants';
import { generateDialogue, generateQuest } from './geminiService';

const App: React.FC = () => {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 500, y: 500 });
  const [stats, setStats] = useState({ hp: 100, maxHp: 100, level: 1, exp: 0, gold: 50 });
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeDialogue, setActiveDialogue] = useState<{ npc: Entity; text: string } | null>(null);
  const [currentQuest, setCurrentQuest] = useState<{ title: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  // Referencia para el bucle de animación para evitar cierres de estado antiguos
  const requestRef = useRef<number>();
  const playerPosRef = useRef(playerPos);

  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeysPressed(prev => new Set(prev).add(e.code));
    const handleKeyUp = (e: KeyboardEvent) => setKeysPressed(prev => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Bucle de movimiento
  const update = useCallback(() => {
    let dx = 0;
    let dy = 0;

    if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) dy -= PLAYER_SPEED;
    if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) dy += PLAYER_SPEED;
    if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) dx -= PLAYER_SPEED;
    if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) dx += PLAYER_SPEED;

    if (dx !== 0 || dy !== 0) {
      // Normalizar velocidad diagonal
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        dx *= factor;
        dy *= factor;
      }

      setPlayerPos(prev => {
        const nextX = Math.max(0, Math.min(WORLD_SIZE, prev.x + dx));
        const nextY = Math.max(0, Math.min(WORLD_SIZE, prev.y + dy));
        return { x: nextX, y: nextY };
      });
    }

    requestRef.current = requestAnimationFrame(update);
  }, [keysPressed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // Interacción
  const handleInteract = async () => {
    const nearby = entities.find(e => {
      const dist = Math.sqrt(Math.pow(e.pos.x - playerPos.x, 2) + Math.pow(e.pos.y - playerPos.y, 2));
      return dist < INTERACTION_RANGE;
    });

    if (nearby) {
      if (nearby.type === 'npc') {
        setIsLoading(true);
        const text = await generateDialogue(
          nearby.name, 
          nearby.role || 'Aldeano', 
          `El jugador está en nivel ${stats.level} y tiene ${stats.gold} monedas.`
        );
        setActiveDialogue({ npc: nearby, text });
        setIsLoading(false);

        // Si es el anciano, dar una misión si no hay una
        if (nearby.id === 'npc-1' && !currentQuest) {
          const quest = await generateQuest("Bosque Susurrante");
          setCurrentQuest(quest);
        }
      } else if (nearby.type === 'item') {
        setInventory(prev => [...prev, nearby.name]);
        setEntities(prev => prev.filter(e => e.id !== nearby.id));
      }
    }
  };

  useEffect(() => {
    const handleE = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') handleInteract();
    };
    window.addEventListener('keydown', handleE);
    return () => window.removeEventListener('keydown', handleE);
  }, [playerPos, entities, stats, currentQuest]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-emerald-900 select-none">
      {/* Mundo / Mapa */}
      <div 
        className="absolute transition-transform duration-75 ease-out"
        style={{ 
          transform: `translate(${window.innerWidth/2 - playerPos.x}px, ${window.innerHeight/2 - playerPos.y}px)`,
          width: WORLD_SIZE,
          height: WORLD_SIZE,
          background: 'radial-gradient(circle, #065f46 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      >
        {/* Decoraciones del suelo */}
        <div className="absolute top-10 left-10 text-4xl opacity-20">🌲</div>
        <div className="absolute top-400 left-800 text-4xl opacity-20">🌲</div>
        <div className="absolute top-1200 left-200 text-4xl opacity-20">🪨</div>
        <div className="absolute top-600 left-1500 text-4xl opacity-20">🌲</div>

        {/* Entidades */}
        {entities.map(entity => (
          <div 
            key={entity.id}
            className="absolute flex flex-col items-center"
            style={{ left: entity.pos.x, top: entity.pos.y, transform: 'translate(-50%, -50%)' }}
          >
            <div className="text-4xl mb-1">{entity.sprite}</div>
            <div className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded border border-white/20">
              {entity.name}
            </div>
          </div>
        ))}

        {/* Jugador */}
        <div 
          className="absolute flex flex-col items-center player-anim"
          style={{ left: playerPos.x, top: playerPos.y, transform: 'translate(-50%, -50%)' }}
        >
          <div className="text-5xl">🛡️</div>
          <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full border-2 border-white mt-1 shadow-lg">
            Héroe
          </div>
        </div>
      </div>

      {/* UI: HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-none">
        <div className="bg-gray-900/80 p-4 rounded-xl border-2 border-gray-700 backdrop-blur-md min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold">Nivel {stats.level}</span>
            <span className="text-yellow-400 font-bold">💰 {stats.gold}</span>
          </div>
          <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden border border-red-900">
            <div 
              className="bg-red-500 h-full transition-all duration-300" 
              style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-red-200 mt-1 uppercase tracking-wider text-center">Salud</div>
        </div>

        {currentQuest && (
          <div className="bg-blue-900/80 p-4 rounded-xl border-2 border-blue-700 backdrop-blur-md max-w-[250px]">
            <h3 className="text-blue-200 font-bold text-sm uppercase">Misión Activa</h3>
            <p className="text-white font-medium text-xs mt-1">{currentQuest.title}</p>
            <p className="text-blue-100/70 text-[10px] mt-1 italic">{currentQuest.description}</p>
          </div>
        )}
      </div>

      {/* UI: Inventario Rápido */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {inventory.length === 0 ? (
          <div className="bg-black/40 text-white/50 px-4 py-2 rounded-lg text-xs border border-white/10">Inventario Vacío</div>
        ) : (
          inventory.map((item, i) => (
            <div key={i} className="bg-gray-800/90 w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-600 text-xl shadow-lg" title={item}>
              {item.includes('Espada') ? '🗡️' : '📦'}
            </div>
          ))
        )}
      </div>

      {/* Mensaje de interacción */}
      {!activeDialogue && entities.some(e => Math.sqrt(Math.pow(e.pos.x - playerPos.x, 2) + Math.pow(e.pos.y - playerPos.y, 2)) < INTERACTION_RANGE) && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full font-bold shadow-2xl animate-pulse">
          Presiona [E] para Interactuar
        </div>
      )}

      {/* Controles para móviles / Referencia */}
      <div className="absolute bottom-4 right-4 text-white/30 text-[10px] text-right">
        WASD: Moverse<br/>
        E: Hablar/Recoger
      </div>

      {/* Diálogo IA */}
      {activeDialogue && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8 backdrop-blur-sm z-50">
          <div className="bg-gray-900 border-4 border-yellow-700 p-6 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-4 border-b border-gray-800 pb-4">
              <span className="text-4xl">{activeDialogue.npc.sprite}</span>
              <div>
                <h2 className="text-yellow-500 font-bold text-xl">{activeDialogue.npc.name}</h2>
                <p className="text-gray-500 text-xs italic">{activeDialogue.npc.role}</p>
              </div>
            </div>
            <p className="text-white text-lg leading-relaxed min-h-[80px]">
              {isLoading ? "Pensando..." : activeDialogue.text}
            </p>
            <button 
              onClick={() => setActiveDialogue(null)}
              className="mt-6 w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-colors border-b-4 border-yellow-900"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Pantalla de carga inicial si fuera necesaria */}
      {isLoading && !activeDialogue && (
        <div className="absolute top-4 right-4">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default App;
