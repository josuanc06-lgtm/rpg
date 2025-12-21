
import { Entity } from './types';

export const WORLD_SIZE = 2000;
export const PLAYER_SPEED = 5;
export const INTERACTION_RANGE = 60;

export const INITIAL_ENTITIES: Entity[] = [
  {
    id: 'npc-1',
    name: 'Anciano Elara',
    type: 'npc',
    pos: { x: 300, y: 300 },
    sprite: '🧙‍♂️',
    role: 'Sabio de la aldea que conoce los secretos del cristal',
    dialogue: 'Bienvenido, joven. El destino te ha traído aquí.'
  },
  {
    id: 'npc-2',
    name: 'Kaelen el Herrero',
    type: 'npc',
    pos: { x: 600, y: 450 },
    sprite: '⚒️',
    role: 'Un rudo herrero que busca materiales raros',
    dialogue: '¿Buscas acero o solo vienes a estorbar?'
  },
  {
    id: 'item-1',
    name: 'Espada de Hierro',
    type: 'item',
    pos: { x: 450, y: 200 },
    sprite: '🗡️'
  },
  {
    id: 'npc-3',
    name: 'Luna la Exploradora',
    type: 'npc',
    pos: { x: 1200, y: 800 },
    sprite: '🏹',
    role: 'Una cazadora que vigila los límites del bosque',
    dialogue: 'Ten cuidado, las bestias están inquietas hoy.'
  }
];

export const MAP_TILES = [
  { x: 0, y: 0, type: 'grass' },
  // Podríamos generar miles, pero usaremos un patrón visual en el render
];
