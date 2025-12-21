
export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  name: string;
  pos: Position;
  type: 'npc' | 'item' | 'portal';
  sprite: string;
  dialogue?: string;
  role?: string;
}

export interface GameState {
  playerPos: Position;
  playerStats: {
    hp: number;
    maxHp: number;
    level: number;
    exp: number;
    gold: number;
  };
  inventory: string[];
  currentQuest: string | null;
  worldEntities: Entity[];
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}
