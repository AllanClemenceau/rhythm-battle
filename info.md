# 🎮 [PROJECT_NAME] - Rhythm Battle Game

## Architecture & Instructions pour Pair Programming IA

---

## 📋 Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Stack technique](#stack-technique)
3. [Architecture globale](#architecture-globale)
4. [Structure des dossiers](#structure-des-dossiers)
5. [Phases de développement](#phases-de-développement)
6. [Instructions détaillées par phase](#instructions-détaillées-par-phase)
7. [Schémas d'architecture](#schémas-darchitecture)
8. [Spécifications techniques détaillées](#spécifications-techniques-détaillées)
9. [API et contrats de données](#api-et-contrats-de-données)
10. [Guide de déploiement](#guide-de-déploiement)

---

## Vue d'ensemble du projet

### Concept
Jeu de rythme multijoueur en temps réel où deux joueurs s'affrontent sur une musique soumise via YouTube. Les joueurs doivent appuyer sur les bonnes touches au bon timing. Le système de combo augmente dynamiquement la difficulté et les dégâts infligés à l'adversaire.

### Caractéristiques principales (MVP)
- **Duel 1v1 temps réel** synchronisé via WebSocket
- **4 touches directionnelles** (↑↓←→) personnalisables
- **Génération de beatmap** automatique via analyse audio (BPM + onset detection)
- **Durée de match** : 60 secondes (meilleur passage détecté ou choisi par le joueur)
- **Système de combo** : densité de notes dynamique selon le combo
- **Système de scoring** : Perfect/Good/Miss avec différenciation
- **Comeback mechanic** : facilité de combo quand HP bas
- **Matchmaking** : lobby privé (code/lien) + matchmaking public
- **Responsive** : Desktop (clavier) + Mobile (4 zones tactiles)

### Features post-MVP
- Pouvoirs/jokers (items aléatoires spawn, 1 slot, raccourci activation)
- Ultimate (combo x50, effet dévastateur + vidéo épique)
- Face swap sur vidéos meme par catégorie de profil
- Profils thématiques (MMA, manga, basket...)

---

## Stack technique

### Frontend
| Technologie | Usage | Justification |
|-------------|-------|---------------|
| **Next.js 14+** | Framework React | SSR, App Router, excellent DX, déploiement Vercel gratuit |
| **TypeScript** | Typage | Sécurité, autocomplétion, maintenabilité |
| **Tailwind CSS** | Styling | Rapidité, responsive, utility-first |
| **Zustand** | State management | Léger, simple, performant pour le game state |
| **Essentia.js** | Analyse audio | BPM detection, onset detection côté client |

### Backend / Temps réel
| Technologie | Usage | Justification |
|-------------|-------|---------------|
| **PartyKit** | WebSocket temps réel | Free tier généreux, conçu pour jeux multijoueur, edge computing |
| **Cloudflare Workers** | Audio processing | Extraction YouTube, free tier suffisant pour MVP |
| **yt-dlp** | Extraction audio | Fiable, maintenu, extraction audio YouTube |

### Base de données / Storage
| Technologie | Usage | Justification |
|-------------|-------|---------------|
| **Supabase** | BDD + Auth + Storage | Free tier complet, Postgres, prêt pour post-MVP |

### Déploiement
| Service | Usage | Coût |
|---------|-------|------|
| **Vercel** | Frontend Next.js | Gratuit (hobby) |
| **PartyKit** | WebSocket servers | Gratuit (free tier) |
| **Cloudflare** | Workers + R2 storage | Gratuit (free tier) |
| **Supabase** | Database + Storage | Gratuit (free tier) |

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
│  ┌─────────────────────┐              ┌─────────────────────┐               │
│  │   Player 1 (Web)    │              │   Player 2 (Web)    │               │
│  │  - Next.js App      │              │  - Next.js App      │               │
│  │  - Game Canvas      │              │  - Game Canvas      │               │
│  │  - Audio Context    │              │  - Audio Context    │               │
│  │  - Input Handler    │              │  - Input Handler    │               │
│  └──────────┬──────────┘              └──────────┬──────────┘               │
│             │                                    │                          │
│             │ WebSocket                          │ WebSocket                │
│             │                                    │                          │
└─────────────┼────────────────────────────────────┼──────────────────────────┘
              │                                    │
              ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PARTYKIT SERVER                                   │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         Game Room                                  │     │
│  │  - State synchronization                                           │     │
│  │  - Input validation                                                │     │
│  │  - Damage calculation                                              │     │
│  │  - Combo tracking                                                  │     │
│  │  - Game clock (60s timer)                                          │     │
│  │  - Victory detection                                               │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
              │
              │ HTTP API
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE WORKERS                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐                         │
│  │  Audio Processor    │    │   Beatmap Cache     │                         │
│  │  - yt-dlp extract   │    │   - R2 Storage      │                         │
│  │  - Audio analysis   │    │   - Beatmap JSON    │                         │
│  │  - Segment select   │    │   - Audio chunks    │                         │
│  └─────────────────────┘    └─────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
              │
              │ Storage
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                         │
│  │     PostgreSQL      │    │      Storage        │                         │
│  │  - Matchmaking queue│    │  - Profile photos   │                         │
│  │  - Leaderboards     │    │  - Meme videos      │                         │
│  │  (post-MVP)         │    │  (post-MVP)         │                         │
│  └─────────────────────┘    └─────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Structure des dossiers

```
project-name/
├── apps/
│   └── web/                          # Application Next.js
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Landing page
│       │   ├── lobby/
│       │   │   ├── page.tsx          # Lobby création/join
│       │   │   └── [roomId]/
│       │   │       └── page.tsx      # Waiting room
│       │   ├── game/
│       │   │   └── [roomId]/
│       │   │       └── page.tsx      # Game view
│       │   └── api/
│       │       ├── audio/
│       │       │   └── process/
│       │       │       └── route.ts  # Proxy vers Cloudflare Worker
│       │       └── matchmaking/
│       │           └── route.ts      # Queue matchmaking
│       ├── components/
│       │   ├── ui/                   # Composants UI génériques
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── HealthBar.tsx
│       │   │   └── ComboCounter.tsx
│       │   ├── game/                 # Composants spécifiques au jeu
│       │   │   ├── GameCanvas.tsx    # Canvas principal du jeu
│       │   │   ├── NoteTrack.tsx     # Piste de notes (×4)
│       │   │   ├── Note.tsx          # Note individuelle
│       │   │   ├── HitZone.tsx       # Zone de hit en bas
│       │   │   ├── HitFeedback.tsx   # Perfect/Good/Miss feedback
│       │   │   ├── PlayerHUD.tsx     # HP + Combo du joueur
│       │   │   └── OpponentHUD.tsx   # HP + Combo adversaire
│       │   └── lobby/
│       │       ├── RoomCreator.tsx
│       │       ├── RoomJoiner.tsx
│       │       ├── YouTubeInput.tsx
│       │       └── PlayerReady.tsx
│       ├── hooks/
│       │   ├── useGameState.ts       # State Zustand du jeu
│       │   ├── usePartySocket.ts     # Connection PartyKit
│       │   ├── useAudioContext.ts    # Gestion Web Audio API
│       │   ├── useInputHandler.ts    # Clavier + tactile
│       │   ├── useBeatmapSync.ts     # Sync notes avec audio
│       │   └── useGameLoop.ts        # requestAnimationFrame loop
│       ├── lib/
│       │   ├── audio/
│       │   │   ├── analyzer.ts       # Essentia.js wrapper
│       │   │   ├── beatmap.ts        # Génération beatmap
│       │   │   └── sync.ts           # Synchronisation audio
│       │   ├── game/
│       │   │   ├── scoring.ts        # Perfect/Good/Miss logic
│       │   │   ├── damage.ts         # Calcul dégâts
│       │   │   ├── combo.ts          # Gestion combo + comeback
│       │   │   └── difficulty.ts     # Densité notes dynamique
│       │   ├── input/
│       │   │   ├── keyboard.ts       # Mapping clavier
│       │   │   └── touch.ts          # Zones tactiles mobile
│       │   └── utils/
│       │       ├── timing.ts         # Helpers timing
│       │       └── constants.ts      # Constantes du jeu
│       ├── stores/
│       │   └── gameStore.ts          # Zustand store
│       ├── types/
│       │   ├── game.ts               # Types du jeu
│       │   ├── beatmap.ts            # Types beatmap
│       │   └── network.ts            # Types messages WebSocket
│       └── public/
│           └── sounds/               # SFX (hit sounds, etc.)
│
├── packages/
│   └── shared/                       # Code partagé client/serveur
│       ├── types/
│       │   ├── game.ts
│       │   ├── messages.ts
│       │   └── beatmap.ts
│       ├── constants/
│       │   └── game.ts               # Constantes partagées
│       └── validation/
│           └── input.ts              # Validation inputs
│
├── party/                            # PartyKit server
│   ├── index.ts                      # Entry point
│   ├── room.ts                       # Game room logic
│   ├── state.ts                      # Server game state
│   ├── handlers/
│   │   ├── connection.ts             # Join/leave
│   │   ├── input.ts                  # Player inputs
│   │   ├── ready.ts                  # Ready state
│   │   └── sync.ts                   # State sync
│   └── utils/
│       ├── timing.ts                 # Server timing
│       └── validation.ts             # Input validation
│
├── workers/                          # Cloudflare Workers
│   └── audio-processor/
│       ├── src/
│       │   ├── index.ts              # Worker entry
│       │   ├── youtube.ts            # yt-dlp extraction
│       │   ├── analyzer.ts           # Audio analysis
│       │   └── segment.ts            # Best 60s selection
│       └── wrangler.toml             # Cloudflare config
│
├── package.json
├── turbo.json                        # Turborepo config
└── README.md
```

---

## Phases de développement

### Phase 1 : Setup & Infrastructure (Semaine 1)
- [ ] Initialisation monorepo (Turborepo)
- [ ] Setup Next.js avec TypeScript + Tailwind
- [ ] Configuration PartyKit basique
- [ ] Configuration Cloudflare Worker
- [ ] Structure de base des dossiers

### Phase 2 : Gameplay Core Solo (Semaine 2)
- [ ] Game canvas avec notes qui descendent
- [ ] 4 pistes verticales (←↓↑→)
- [ ] Input handler (clavier + tactile)
- [ ] Système de scoring (Perfect/Good/Miss)
- [ ] Beatmap statique de test
- [ ] Feedback visuel des hits

### Phase 3 : Audio & Beatmap Generation (Semaine 3)
- [ ] Extraction audio YouTube (Cloudflare Worker)
- [ ] Intégration Essentia.js
- [ ] Détection BPM + onsets
- [ ] Génération beatmap procédurale
- [ ] Sélection meilleur segment 60s
- [ ] Option timestamp manuel

### Phase 4 : Multijoueur Temps Réel (Semaine 4)
- [ ] PartyKit game rooms
- [ ] Synchronisation état de jeu
- [ ] Système de lobby (création/join)
- [ ] Countdown synchronisé
- [ ] Sync audio entre joueurs

### Phase 5 : Combat System (Semaine 5)
- [ ] Barre de vie
- [ ] Système de combo avec multiplicateur
- [ ] Dégâts proportionnels au combo adverse
- [ ] Densité dynamique selon combo
- [ ] Comeback mechanic
- [ ] Condition de victoire

### Phase 6 : Matchmaking & Polish (Semaine 6)
- [ ] Lobby privé avec code/lien
- [ ] File d'attente matchmaking public
- [ ] UI/UX polish
- [ ] Responsive mobile
- [ ] Sound effects
- [ ] Animations

---

## Instructions détaillées par phase

### Phase 1 : Setup & Infrastructure

#### 1.1 Initialisation du monorepo

```bash
# Créer le projet avec Turborepo
npx create-turbo@latest project-name
cd project-name

# Structure de base
mkdir -p apps/web packages/shared party workers/audio-processor
```

#### 1.2 Configuration Next.js

```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false
```

**Fichier : `apps/web/next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@project/shared"],
}

module.exports = nextConfig
```

#### 1.3 Configuration PartyKit

```bash
# À la racine
npm install partykit partysocket
npx partykit init
```

**Fichier : `party/index.ts`**
```typescript
import type * as Party from "partykit/server";

export default class GameRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Logique de connexion
  }

  onMessage(message: string, sender: Party.Connection) {
    // Logique de messages
  }

  onClose(conn: Party.Connection) {
    // Logique de déconnexion
  }
}
```

**Fichier : `partykit.json`**
```json
{
  "name": "project-name",
  "main": "party/index.ts"
}
```

#### 1.4 Configuration Cloudflare Worker

```bash
cd workers/audio-processor
npm init -y
npm install wrangler
npx wrangler init
```

**Fichier : `workers/audio-processor/wrangler.toml`**
```toml
name = "audio-processor"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "development"

[[r2_buckets]]
binding = "AUDIO_CACHE"
bucket_name = "audio-cache"
```

#### 1.5 Package shared

**Fichier : `packages/shared/package.json`**
```json
{
  "name": "@project/shared",
  "version": "0.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts",
    "./types": "./types/index.ts",
    "./constants": "./constants/index.ts"
  }
}
```

---

### Phase 2 : Gameplay Core Solo

#### 2.1 Types de base

**Fichier : `packages/shared/types/game.ts`**
```typescript
export type Direction = 'left' | 'down' | 'up' | 'right';

export type HitResult = 'perfect' | 'good' | 'miss';

export interface Note {
  id: string;
  direction: Direction;
  targetTime: number; // ms depuis début de la chanson
  isHit: boolean;
  hitResult?: HitResult;
}

export interface Beatmap {
  id: string;
  youtubeUrl: string;
  bpm: number;
  startTime: number; // timestamp début du segment 60s
  duration: number;  // toujours 60000ms
  notes: Note[];
}

export interface PlayerState {
  id: string;
  hp: number;          // 0-100
  combo: number;
  maxCombo: number;
  score: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
}

export interface GameState {
  roomId: string;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  players: [PlayerState, PlayerState] | [PlayerState];
  beatmap: Beatmap | null;
  currentTime: number;
  winner?: string;
}
```

#### 2.2 Constantes du jeu

**Fichier : `packages/shared/constants/game.ts`**
```typescript
// Timing windows (en ms)
export const TIMING = {
  PERFECT: 50,   // ±50ms = Perfect
  GOOD: 100,     // ±100ms = Good
  MISS: 150,     // >150ms = Miss
} as const;

// Scoring
export const SCORE = {
  PERFECT: 100,
  GOOD: 50,
  MISS: 0,
} as const;

// Gameplay
export const GAME = {
  DURATION: 60000,           // 60 secondes
  INITIAL_HP: 100,
  BASE_DAMAGE: 5,            // Dégâts de base sur miss
  COMBO_DAMAGE_MULTIPLIER: 0.5, // +0.5 dégâts par combo adverse
  COMEBACK_HP_THRESHOLD: 30, // En dessous, comeback mechanic actif
  COMEBACK_TIMING_BONUS: 20, // +20ms de fenêtre timing
  NOTE_TRAVEL_TIME: 2000,    // Temps pour qu'une note descende
  COUNTDOWN_DURATION: 3000,  // 3 secondes de countdown
} as const;

// Combo thresholds pour densité
export const COMBO_DENSITY = {
  0: 1,      // Base: 1 note par beat
  10: 1.5,   // x10 combo: 1.5 notes par beat
  25: 2,     // x25 combo: 2 notes par beat
  50: 3,     // x50 combo: 3 notes par beat (Ultimate unlock)
} as const;

// Input mapping par défaut
export const DEFAULT_KEYS: Record<Direction, string> = {
  left: 'ArrowLeft',
  down: 'ArrowDown',
  up: 'ArrowUp',
  right: 'ArrowRight',
};
```

#### 2.3 Game Canvas Component

**Fichier : `apps/web/components/game/GameCanvas.tsx`**
```typescript
'use client';

import { useRef, useEffect } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameState } from '@/hooks/useGameState';
import NoteTrack from './NoteTrack';
import HitZone from './HitZone';
import PlayerHUD from './PlayerHUD';
import OpponentHUD from './OpponentHUD';
import type { Direction } from '@project/shared/types';

const TRACK_ORDER: Direction[] = ['left', 'down', 'up', 'right'];

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameState, currentTime } = useGameState();
  
  useGameLoop(); // Active la boucle de jeu

  if (!gameState) return <div>Loading...</div>;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-gray-900 overflow-hidden"
    >
      {/* HUD Joueurs */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <PlayerHUD player={gameState.players[0]} />
        {gameState.players[1] && (
          <OpponentHUD player={gameState.players[1]} />
        )}
      </div>

      {/* Zone de jeu centrale */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="relative flex gap-2">
          {TRACK_ORDER.map((direction, index) => (
            <NoteTrack
              key={direction}
              direction={direction}
              notes={gameState.beatmap?.notes.filter(n => n.direction === direction) || []}
              currentTime={currentTime}
            />
          ))}
        </div>
      </div>

      {/* Hit Zone (en bas) */}
      <HitZone />
    </div>
  );
}
```

#### 2.4 Note Track Component

**Fichier : `apps/web/components/game/NoteTrack.tsx`**
```typescript
'use client';

import { useMemo } from 'react';
import Note from './Note';
import { GAME } from '@project/shared/constants';
import type { Note as NoteType, Direction } from '@project/shared/types';

interface NoteTrackProps {
  direction: Direction;
  notes: NoteType[];
  currentTime: number;
}

const TRACK_HEIGHT = 600; // px
const HIT_ZONE_Y = TRACK_HEIGHT - 80; // Position de la zone de hit

export default function NoteTrack({ direction, notes, currentTime }: NoteTrackProps) {
  // Filtrer les notes visibles (dans la fenêtre de temps)
  const visibleNotes = useMemo(() => {
    return notes.filter(note => {
      const timeUntilHit = note.targetTime - currentTime;
      // Note visible si elle doit arriver dans les prochaines 2s
      // et n'est pas déjà passée de plus de 200ms
      return timeUntilHit <= GAME.NOTE_TRAVEL_TIME && timeUntilHit > -200;
    });
  }, [notes, currentTime]);

  // Calculer la position Y de chaque note
  const getYPosition = (note: NoteType) => {
    const timeUntilHit = note.targetTime - currentTime;
    const progress = 1 - (timeUntilHit / GAME.NOTE_TRAVEL_TIME);
    return progress * HIT_ZONE_Y;
  };

  const directionColors: Record<Direction, string> = {
    left: 'bg-pink-500',
    down: 'bg-blue-500',
    up: 'bg-green-500',
    right: 'bg-yellow-500',
  };

  return (
    <div 
      className="relative w-20 bg-gray-800/50 rounded-lg overflow-hidden"
      style={{ height: TRACK_HEIGHT }}
    >
      {/* Ligne de la piste */}
      <div className="absolute inset-0 border-l border-r border-gray-700" />
      
      {/* Notes */}
      {visibleNotes.map(note => (
        <Note
          key={note.id}
          note={note}
          yPosition={getYPosition(note)}
          color={directionColors[direction]}
        />
      ))}

      {/* Indicateur de direction en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center">
        <DirectionArrow direction={direction} />
      </div>
    </div>
  );
}

function DirectionArrow({ direction }: { direction: Direction }) {
  const rotation: Record<Direction, string> = {
    left: 'rotate-90',
    down: 'rotate-180',
    up: 'rotate-0',
    right: '-rotate-90',
  };

  return (
    <div className={`w-12 h-12 ${rotation[direction]} text-white/30`}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l-8 8h5v8h6v-8h5z" />
      </svg>
    </div>
  );
}
```

#### 2.5 Input Handler Hook

**Fichier : `apps/web/hooks/useInputHandler.ts`**
```typescript
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameState } from './useGameState';
import { DEFAULT_KEYS, TIMING } from '@project/shared/constants';
import type { Direction, HitResult } from '@project/shared/types';

export function useInputHandler() {
  const { 
    gameState, 
    currentTime, 
    registerHit, 
    registerMiss 
  } = useGameState();
  
  const lastInputTime = useRef<Record<Direction, number>>({
    left: 0, down: 0, up: 0, right: 0
  });

  // Trouver la note la plus proche pour une direction
  const findClosestNote = useCallback((direction: Direction) => {
    if (!gameState?.beatmap) return null;

    const availableNotes = gameState.beatmap.notes.filter(
      note => note.direction === direction && !note.isHit
    );

    let closestNote = null;
    let closestDelta = Infinity;

    for (const note of availableNotes) {
      const delta = Math.abs(note.targetTime - currentTime);
      if (delta < closestDelta && delta <= TIMING.MISS) {
        closestDelta = delta;
        closestNote = note;
      }
    }

    return closestNote ? { note: closestNote, delta: closestDelta } : null;
  }, [gameState?.beatmap, currentTime]);

  // Évaluer le résultat du hit
  const evaluateHit = useCallback((delta: number): HitResult => {
    if (delta <= TIMING.PERFECT) return 'perfect';
    if (delta <= TIMING.GOOD) return 'good';
    return 'miss';
  }, []);

  // Handler pour une direction
  const handleInput = useCallback((direction: Direction) => {
    // Anti-spam: minimum 50ms entre inputs
    const now = performance.now();
    if (now - lastInputTime.current[direction] < 50) return;
    lastInputTime.current[direction] = now;

    const result = findClosestNote(direction);
    
    if (result) {
      const hitResult = evaluateHit(result.delta);
      registerHit(result.note.id, hitResult);
    } else {
      // Appui sans note = miss
      registerMiss(direction);
    }
  }, [findClosestNote, evaluateHit, registerHit, registerMiss]);

  // Keyboard listeners
  useEffect(() => {
    const keyToDirection: Record<string, Direction> = {
      [DEFAULT_KEYS.left]: 'left',
      [DEFAULT_KEYS.down]: 'down',
      [DEFAULT_KEYS.up]: 'up',
      [DEFAULT_KEYS.right]: 'right',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = keyToDirection[e.code];
      if (direction && gameState?.status === 'playing') {
        e.preventDefault();
        handleInput(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, gameState?.status]);

  // Touch handlers pour mobile
  const createTouchHandler = useCallback((direction: Direction) => {
    return (e: React.TouchEvent) => {
      e.preventDefault();
      if (gameState?.status === 'playing') {
        handleInput(direction);
      }
    };
  }, [handleInput, gameState?.status]);

  return {
    handleInput,
    createTouchHandler,
  };
}
```

#### 2.6 Scoring Logic

**Fichier : `apps/web/lib/game/scoring.ts`**
```typescript
import { SCORE, GAME, COMBO_DENSITY } from '@project/shared/constants';
import type { HitResult, PlayerState } from '@project/shared/types';

export function calculateScore(result: HitResult): number {
  return SCORE[result.toUpperCase() as keyof typeof SCORE];
}

export function updatePlayerAfterHit(
  player: PlayerState, 
  result: HitResult
): PlayerState {
  const newPlayer = { ...player };

  if (result === 'miss') {
    newPlayer.combo = 0;
    newPlayer.missCount++;
  } else {
    newPlayer.combo++;
    newPlayer.maxCombo = Math.max(newPlayer.maxCombo, newPlayer.combo);
    newPlayer.score += calculateScore(result) * (1 + Math.floor(newPlayer.combo / 10) * 0.1);
    
    if (result === 'perfect') {
      newPlayer.perfectCount++;
    } else {
      newPlayer.goodCount++;
    }
  }

  return newPlayer;
}

export function calculateDamage(
  attackerCombo: number,
  defenderHp: number
): number {
  const baseDamage = GAME.BASE_DAMAGE;
  const comboDamage = attackerCombo * GAME.COMBO_DAMAGE_MULTIPLIER;
  return Math.ceil(baseDamage + comboDamage);
}

export function applyDamage(
  player: PlayerState,
  damage: number
): PlayerState {
  return {
    ...player,
    hp: Math.max(0, player.hp - damage),
  };
}

export function getNoteDensityMultiplier(combo: number): number {
  const thresholds = Object.keys(COMBO_DENSITY)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (combo >= threshold) {
      return COMBO_DENSITY[threshold as keyof typeof COMBO_DENSITY];
    }
  }
  return 1;
}

export function isComeback(hp: number): boolean {
  return hp <= GAME.COMEBACK_HP_THRESHOLD;
}

export function getTimingWindow(hp: number): { perfect: number; good: number } {
  if (isComeback(hp)) {
    return {
      perfect: TIMING.PERFECT + GAME.COMEBACK_TIMING_BONUS,
      good: TIMING.GOOD + GAME.COMEBACK_TIMING_BONUS,
    };
  }
  return {
    perfect: TIMING.PERFECT,
    good: TIMING.GOOD,
  };
}
```

---

### Phase 3 : Audio & Beatmap Generation

#### 3.1 Cloudflare Worker - Audio Extraction

**Fichier : `workers/audio-processor/src/index.ts`**
```typescript
import { extractAudio } from './youtube';
import { analyzeAudio } from './analyzer';
import { selectBestSegment } from './segment';

export interface Env {
  AUDIO_CACHE: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/process' && request.method === 'POST') {
      try {
        const { youtubeUrl, startTime } = await request.json();
        
        // Générer un ID unique pour cette chanson
        const songId = btoa(youtubeUrl).replace(/[^a-zA-Z0-9]/g, '');
        
        // Vérifier le cache
        const cached = await env.AUDIO_CACHE.get(`${songId}.json`);
        if (cached) {
          const data = await cached.json();
          return Response.json(data);
        }
        
        // Extraire l'audio
        const audioBuffer = await extractAudio(youtubeUrl);
        
        // Analyser l'audio
        const analysis = await analyzeAudio(audioBuffer);
        
        // Sélectionner le meilleur segment de 60s
        const segment = selectBestSegment(analysis, startTime);
        
        // Générer la beatmap
        const beatmap = {
          id: songId,
          youtubeUrl,
          bpm: analysis.bpm,
          startTime: segment.startTime,
          duration: 60000,
          notes: segment.notes,
        };
        
        // Cacher le résultat
        await env.AUDIO_CACHE.put(
          `${songId}.json`,
          JSON.stringify(beatmap),
          { expirationTtl: 86400 * 7 } // 7 jours
        );
        
        // Cacher l'audio (segment de 60s)
        await env.AUDIO_CACHE.put(
          `${songId}.mp3`,
          segment.audioBuffer,
          { expirationTtl: 86400 * 7 }
        );
        
        return Response.json(beatmap);
      } catch (error) {
        return Response.json(
          { error: 'Failed to process audio' },
          { status: 500 }
        );
      }
    }
    
    if (url.pathname.startsWith('/api/audio/') && request.method === 'GET') {
      const songId = url.pathname.split('/').pop();
      const audio = await env.AUDIO_CACHE.get(`${songId}.mp3`);
      
      if (!audio) {
        return Response.json({ error: 'Audio not found' }, { status: 404 });
      }
      
      return new Response(audio.body, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=604800',
        },
      });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
```

#### 3.2 Essentia.js Integration (Client-side fallback)

**Fichier : `apps/web/lib/audio/analyzer.ts`**
```typescript
import { Essentia, EssentiaWASM } from 'essentia.js';

let essentia: Essentia | null = null;

async function getEssentia(): Promise<Essentia> {
  if (!essentia) {
    const wasmModule = await EssentiaWASM();
    essentia = new Essentia(wasmModule);
  }
  return essentia;
}

export interface AudioAnalysis {
  bpm: number;
  beats: number[]; // Timestamps des beats en ms
  onsets: number[]; // Timestamps des onsets en ms
  energy: number[]; // Courbe d'énergie
}

export async function analyzeAudioBuffer(
  audioBuffer: AudioBuffer
): Promise<AudioAnalysis> {
  const es = await getEssentia();
  
  // Convertir en mono
  const channelData = audioBuffer.getChannelData(0);
  const signal = es.arrayToVector(channelData);
  
  // Détection du BPM
  const rhythmExtractor = es.RhythmExtractor2013(signal);
  const bpm = rhythmExtractor.bpm;
  const beats = es.vectorToArray(rhythmExtractor.ticks).map(t => t * 1000);
  
  // Détection des onsets
  const onsetDetection = es.OnsetDetection(signal, audioBuffer.sampleRate);
  const onsets = es.vectorToArray(onsetDetection.onsets).map(t => t * 1000);
  
  // Courbe d'énergie
  const frameSize = 2048;
  const hopSize = 1024;
  const energy: number[] = [];
  
  for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
    const frame = channelData.slice(i, i + frameSize);
    const frameEnergy = frame.reduce((sum, s) => sum + s * s, 0) / frameSize;
    energy.push(frameEnergy);
  }
  
  return { bpm, beats, onsets, energy };
}

export function findBestSegment(
  analysis: AudioAnalysis,
  duration: number = 60000,
  preferredStart?: number
): { startTime: number; endTime: number; score: number } {
  if (preferredStart !== undefined) {
    return {
      startTime: preferredStart,
      endTime: preferredStart + duration,
      score: 1,
    };
  }
  
  // Trouver le segment avec le plus d'énergie moyenne
  const segmentSamples = Math.floor(duration / 1000 * analysis.energy.length / (analysis.beats.length > 0 ? analysis.beats[analysis.beats.length - 1] / 1000 : 180));
  
  let bestStart = 0;
  let bestScore = 0;
  
  for (let i = 0; i < analysis.energy.length - segmentSamples; i++) {
    const segment = analysis.energy.slice(i, i + segmentSamples);
    const avgEnergy = segment.reduce((a, b) => a + b, 0) / segment.length;
    const onsetCount = analysis.onsets.filter(o => {
      const timeMs = (i / analysis.energy.length) * (analysis.beats[analysis.beats.length - 1] || 180000);
      return o >= timeMs && o <= timeMs + duration;
    }).length;
    
    const score = avgEnergy * 0.5 + (onsetCount / 100) * 0.5;
    
    if (score > bestScore) {
      bestScore = score;
      bestStart = (i / analysis.energy.length) * (analysis.beats[analysis.beats.length - 1] || 180000);
    }
  }
  
  return {
    startTime: Math.floor(bestStart),
    endTime: Math.floor(bestStart + duration),
    score: bestScore,
  };
}
```

#### 3.3 Beatmap Generation

**Fichier : `apps/web/lib/audio/beatmap.ts`**
```typescript
import { v4 as uuid } from 'uuid';
import type { Note, Direction, Beatmap } from '@project/shared/types';
import type { AudioAnalysis } from './analyzer';

const DIRECTIONS: Direction[] = ['left', 'down', 'up', 'right'];

export function generateBeatmap(
  analysis: AudioAnalysis,
  startTime: number,
  duration: number = 60000,
  baseDifficulty: number = 1
): Note[] {
  const notes: Note[] = [];
  const endTime = startTime + duration;
  
  // Filtrer les beats dans notre segment
  const segmentBeats = analysis.beats.filter(
    b => b >= startTime && b <= endTime
  );
  
  // Filtrer les onsets dans notre segment
  const segmentOnsets = analysis.onsets.filter(
    o => o >= startTime && o <= endTime
  );
  
  // Créer des notes sur les beats principaux
  let lastDirection: Direction | null = null;
  
  for (const beat of segmentBeats) {
    // Choisir une direction différente de la précédente
    const availableDirections = DIRECTIONS.filter(d => d !== lastDirection);
    const direction = availableDirections[
      Math.floor(Math.random() * availableDirections.length)
    ];
    lastDirection = direction;
    
    notes.push({
      id: uuid(),
      direction,
      targetTime: beat - startTime, // Relatif au début du segment
      isHit: false,
    });
  }
  
  // Ajouter des notes supplémentaires sur les onsets forts
  // (en évitant les doublons proches)
  for (const onset of segmentOnsets) {
    const relativeTime = onset - startTime;
    const hasNearbyNote = notes.some(
      n => Math.abs(n.targetTime - relativeTime) < 100
    );
    
    if (!hasNearbyNote && Math.random() < baseDifficulty * 0.3) {
      const direction = DIRECTIONS[Math.floor(Math.random() * 4)];
      notes.push({
        id: uuid(),
        direction,
        targetTime: relativeTime,
        isHit: false,
      });
    }
  }
  
  // Trier par temps
  notes.sort((a, b) => a.targetTime - b.targetTime);
  
  return notes;
}

export function adjustBeatmapDensity(
  notes: Note[],
  densityMultiplier: number,
  currentTime: number
): Note[] {
  if (densityMultiplier <= 1) return notes;
  
  const futureNotes = notes.filter(n => n.targetTime > currentTime);
  const additionalNotes: Note[] = [];
  
  for (let i = 0; i < futureNotes.length - 1; i++) {
    const current = futureNotes[i];
    const next = futureNotes[i + 1];
    const gap = next.targetTime - current.targetTime;
    
    // Si le gap est assez grand, ajouter des notes intermédiaires
    if (gap > 200) {
      const notesToAdd = Math.floor((densityMultiplier - 1) * (gap / 500));
      
      for (let j = 1; j <= notesToAdd; j++) {
        const insertTime = current.targetTime + (gap / (notesToAdd + 1)) * j;
        const availableDirections = DIRECTIONS.filter(
          d => d !== current.direction && d !== next.direction
        );
        
        additionalNotes.push({
          id: uuid(),
          direction: availableDirections[
            Math.floor(Math.random() * availableDirections.length)
          ],
          targetTime: insertTime,
          isHit: false,
        });
      }
    }
  }
  
  return [...notes, ...additionalNotes].sort((a, b) => a.targetTime - b.targetTime);
}
```

---

### Phase 4 : Multijoueur Temps Réel

#### 4.1 Messages WebSocket

**Fichier : `packages/shared/types/messages.ts`**
```typescript
import type { GameState, PlayerState, HitResult, Direction } from './game';
import type { Beatmap } from './beatmap';

// Client -> Server
export type ClientMessage =
  | { type: 'join'; payload: { playerName: string } }
  | { type: 'ready'; payload: { ready: boolean } }
  | { type: 'submit_song'; payload: { youtubeUrl: string; startTime?: number } }
  | { type: 'input'; payload: { noteId: string; result: HitResult; timestamp: number } }
  | { type: 'miss'; payload: { direction: Direction; timestamp: number } };

// Server -> Client
export type ServerMessage =
  | { type: 'room_state'; payload: RoomState }
  | { type: 'player_joined'; payload: { player: PlayerState } }
  | { type: 'player_left'; payload: { playerId: string } }
  | { type: 'player_ready'; payload: { playerId: string; ready: boolean } }
  | { type: 'countdown_start'; payload: { startAt: number } }
  | { type: 'game_start'; payload: { beatmap: Beatmap; audioUrl: string } }
  | { type: 'game_update'; payload: GameState }
  | { type: 'hit_registered'; payload: { playerId: string; noteId: string; result: HitResult } }
  | { type: 'damage_dealt'; payload: { fromId: string; toId: string; damage: number } }
  | { type: 'game_end'; payload: { winner: string; finalState: GameState } }
  | { type: 'error'; payload: { message: string } };

export interface RoomState {
  roomId: string;
  players: Array<{
    id: string;
    name: string;
    ready: boolean;
  }>;
  songSubmitted: boolean;
  youtubeUrl?: string;
}
```

#### 4.2 PartyKit Game Room

**Fichier : `party/room.ts`**
```typescript
import type * as Party from "partykit/server";
import type { 
  ClientMessage, 
  ServerMessage, 
  RoomState 
} from "@project/shared/types/messages";
import type { 
  GameState, 
  PlayerState, 
  Beatmap 
} from "@project/shared/types/game";
import { GAME } from "@project/shared/constants";

interface Player {
  id: string;
  name: string;
  conn: Party.Connection;
  ready: boolean;
  state: PlayerState;
}

export default class GameRoom implements Party.Server {
  players: Map<string, Player> = new Map();
  gameState: GameState | null = null;
  beatmap: Beatmap | null = null;
  youtubeUrl: string | null = null;
  gameStartTime: number | null = null;
  gameInterval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {}

  // Broadcast à tous les joueurs
  broadcast(message: ServerMessage, exclude?: string) {
    const data = JSON.stringify(message);
    for (const player of this.players.values()) {
      if (player.id !== exclude) {
        player.conn.send(data);
      }
    }
  }

  // Envoyer à un joueur spécifique
  send(playerId: string, message: ServerMessage) {
    const player = this.players.get(playerId);
    if (player) {
      player.conn.send(JSON.stringify(message));
    }
  }

  getRoomState(): RoomState {
    return {
      roomId: this.room.id,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
      })),
      songSubmitted: this.youtubeUrl !== null,
      youtubeUrl: this.youtubeUrl || undefined,
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Envoyer l'état actuel de la room
    conn.send(JSON.stringify({
      type: 'room_state',
      payload: this.getRoomState(),
    } as ServerMessage));
  }

  async onMessage(message: string, sender: Party.Connection) {
    const msg: ClientMessage = JSON.parse(message);

    switch (msg.type) {
      case 'join':
        this.handleJoin(sender, msg.payload.playerName);
        break;
      case 'ready':
        this.handleReady(sender.id, msg.payload.ready);
        break;
      case 'submit_song':
        await this.handleSubmitSong(msg.payload.youtubeUrl, msg.payload.startTime);
        break;
      case 'input':
        this.handleInput(sender.id, msg.payload);
        break;
      case 'miss':
        this.handleMiss(sender.id, msg.payload);
        break;
    }
  }

  handleJoin(conn: Party.Connection, playerName: string) {
    if (this.players.size >= 2) {
      this.send(conn.id, { type: 'error', payload: { message: 'Room is full' } });
      return;
    }

    const player: Player = {
      id: conn.id,
      name: playerName,
      conn,
      ready: false,
      state: {
        id: conn.id,
        hp: GAME.INITIAL_HP,
        combo: 0,
        maxCombo: 0,
        score: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0,
      },
    };

    this.players.set(conn.id, player);
    this.broadcast({ type: 'player_joined', payload: { player: player.state } });
    this.broadcast({ type: 'room_state', payload: this.getRoomState() });
  }

  handleReady(playerId: string, ready: boolean) {
    const player = this.players.get(playerId);
    if (!player) return;

    player.ready = ready;
    this.broadcast({ type: 'player_ready', payload: { playerId, ready } });

    // Vérifier si on peut démarrer
    if (this.players.size === 2 && 
        Array.from(this.players.values()).every(p => p.ready) &&
        this.beatmap) {
      this.startCountdown();
    }
  }

  async handleSubmitSong(youtubeUrl: string, startTime?: number) {
    this.youtubeUrl = youtubeUrl;
    
    // Appeler le worker pour traiter l'audio
    try {
      const response = await fetch(`${process.env.WORKER_URL}/api/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl, startTime }),
      });
      
      this.beatmap = await response.json();
      this.broadcast({ type: 'room_state', payload: this.getRoomState() });
    } catch (error) {
      this.broadcast({ 
        type: 'error', 
        payload: { message: 'Failed to process song' } 
      });
    }
  }

  startCountdown() {
    const startAt = Date.now() + GAME.COUNTDOWN_DURATION;
    this.broadcast({ type: 'countdown_start', payload: { startAt } });

    setTimeout(() => {
      this.startGame();
    }, GAME.COUNTDOWN_DURATION);
  }

  startGame() {
    if (!this.beatmap) return;

    const players = Array.from(this.players.values());
    
    this.gameState = {
      roomId: this.room.id,
      status: 'playing',
      players: players.map(p => p.state) as [PlayerState, PlayerState],
      beatmap: this.beatmap,
      currentTime: 0,
    };

    this.gameStartTime = Date.now();

    this.broadcast({
      type: 'game_start',
      payload: {
        beatmap: this.beatmap,
        audioUrl: `${process.env.WORKER_URL}/api/audio/${this.beatmap.id}`,
      },
    });

    // Game loop côté serveur (60 fps)
    this.gameInterval = setInterval(() => {
      this.updateGame();
    }, 1000 / 60);
  }

  updateGame() {
    if (!this.gameState || !this.gameStartTime) return;

    this.gameState.currentTime = Date.now() - this.gameStartTime;

    // Vérifier fin de partie
    if (this.gameState.currentTime >= GAME.DURATION) {
      this.endGame();
      return;
    }

    // Vérifier si un joueur a 0 HP
    for (const player of this.gameState.players) {
      if (player.hp <= 0) {
        this.endGame();
        return;
      }
    }

    // Broadcast état actuel
    this.broadcast({ type: 'game_update', payload: this.gameState });
  }

  handleInput(playerId: string, payload: { noteId: string; result: HitResult; timestamp: number }) {
    if (!this.gameState) return;

    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = this.gameState.players[playerIndex];
    const opponent = this.gameState.players[1 - playerIndex];

    // Mettre à jour l'état du joueur
    if (payload.result === 'miss') {
      // Miss = perte de combo + dégâts basés sur le combo adverse
      player.combo = 0;
      player.missCount++;
      
      const damage = GAME.BASE_DAMAGE + opponent.combo * GAME.COMBO_DAMAGE_MULTIPLIER;
      player.hp = Math.max(0, player.hp - damage);

      this.broadcast({
        type: 'damage_dealt',
        payload: { fromId: opponent.id, toId: player.id, damage },
      });
    } else {
      player.combo++;
      player.maxCombo = Math.max(player.maxCombo, player.combo);
      
      if (payload.result === 'perfect') {
        player.perfectCount++;
        player.score += 100 * (1 + player.combo * 0.01);
      } else {
        player.goodCount++;
        player.score += 50 * (1 + player.combo * 0.01);
      }
    }

    this.broadcast({
      type: 'hit_registered',
      payload: { playerId, noteId: payload.noteId, result: payload.result },
    });
  }

  handleMiss(playerId: string, payload: { direction: Direction; timestamp: number }) {
    this.handleInput(playerId, {
      noteId: 'empty',
      result: 'miss',
      timestamp: payload.timestamp,
    });
  }

  endGame() {
    if (!this.gameState) return;

    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }

    this.gameState.status = 'finished';

    // Déterminer le gagnant
    const [p1, p2] = this.gameState.players;
    let winner: string;

    if (p1.hp <= 0) {
      winner = p2.id;
    } else if (p2.hp <= 0) {
      winner = p1.id;
    } else {
      // Fin du temps - celui avec le plus de HP gagne
      winner = p1.hp >= p2.hp ? p1.id : p2.id;
    }

    this.gameState.winner = winner;

    this.broadcast({
      type: 'game_end',
      payload: { winner, finalState: this.gameState },
    });
  }

  onClose(conn: Party.Connection) {
    const player = this.players.get(conn.id);
    if (player) {
      this.players.delete(conn.id);
      this.broadcast({ type: 'player_left', payload: { playerId: conn.id } });
      
      // Si en jeu, l'autre joueur gagne
      if (this.gameState?.status === 'playing') {
        this.endGame();
      }
    }
  }
}
```

#### 4.3 Client WebSocket Hook

**Fichier : `apps/web/hooks/usePartySocket.ts`**
```typescript
'use client';

import { useEffect, useCallback, useRef } from 'react';
import PartySocket from 'partysocket';
import { useGameState } from './useGameState';
import type { ClientMessage, ServerMessage } from '@project/shared/types/messages';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

export function usePartySocket(roomId: string) {
  const socketRef = useRef<PartySocket | null>(null);
  const { 
    setRoomState, 
    setGameState, 
    setBeatmap, 
    setAudioUrl,
    handleServerHit,
    handleDamage,
    setGameEnd,
  } = useGameState();

  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
    });

    socket.addEventListener('message', (event) => {
      const message: ServerMessage = JSON.parse(event.data);
      handleMessage(message);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [roomId]);

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'room_state':
        setRoomState(message.payload);
        break;
      case 'game_start':
        setBeatmap(message.payload.beatmap);
        setAudioUrl(message.payload.audioUrl);
        break;
      case 'game_update':
        setGameState(message.payload);
        break;
      case 'hit_registered':
        handleServerHit(message.payload);
        break;
      case 'damage_dealt':
        handleDamage(message.payload);
        break;
      case 'game_end':
        setGameEnd(message.payload);
        break;
    }
  }, []);

  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinRoom = useCallback((playerName: string) => {
    send({ type: 'join', payload: { playerName } });
  }, [send]);

  const setReady = useCallback((ready: boolean) => {
    send({ type: 'ready', payload: { ready } });
  }, [send]);

  const submitSong = useCallback((youtubeUrl: string, startTime?: number) => {
    send({ type: 'submit_song', payload: { youtubeUrl, startTime } });
  }, [send]);

  const sendInput = useCallback((noteId: string, result: HitResult, timestamp: number) => {
    send({ type: 'input', payload: { noteId, result, timestamp } });
  }, [send]);

  const sendMiss = useCallback((direction: Direction, timestamp: number) => {
    send({ type: 'miss', payload: { direction, timestamp } });
  }, [send]);

  return {
    joinRoom,
    setReady,
    submitSong,
    sendInput,
    sendMiss,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
  };
}
```

---

### Phase 5 : Combat System

Déjà couvert dans les phases précédentes. Les éléments clés :

1. **Barre de vie** : Intégrée dans `PlayerHUD` et `OpponentHUD`
2. **Système de combo** : Géré dans `scoring.ts` et `room.ts`
3. **Dégâts** : Calculés dans `room.ts` lors des miss
4. **Densité dynamique** : Implémentée dans `beatmap.ts` avec `adjustBeatmapDensity`
5. **Comeback mechanic** : Dans `scoring.ts` avec `getTimingWindow`

---

### Phase 6 : Matchmaking & Polish

#### 6.1 Lobby Page

**Fichier : `apps/web/app/lobby/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

export default function LobbyPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const createPrivateRoom = () => {
    const roomId = uuid().slice(0, 8);
    router.push(`/lobby/${roomId}`);
  };

  const joinPrivateRoom = () => {
    if (joinCode.trim()) {
      router.push(`/lobby/${joinCode.trim()}`);
    }
  };

  const startMatchmaking = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/matchmaking', {
        method: 'POST',
      });
      const { roomId } = await response.json();
      router.push(`/lobby/${roomId}`);
    } catch (error) {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 space-y-8">
        <h1 className="text-4xl font-bold text-center">[PROJECT_NAME]</h1>
        
        {/* Private Room */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Partie Privée</h2>
          
          <button
            onClick={createPrivateRoom}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
          >
            Créer une room
          </button>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Code de la room"
              className="flex-1 px-4 py-3 bg-gray-800 rounded-lg"
            />
            <button
              onClick={joinPrivateRoom}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Rejoindre
            </button>
          </div>
        </div>

        {/* Matchmaking */}
        <div className="space-y-4 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold">Matchmaking</h2>
          
          <button
            onClick={startMatchmaking}
            disabled={isSearching}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {isSearching ? 'Recherche en cours...' : 'Trouver un adversaire'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 6.2 Matchmaking API

**Fichier : `apps/web/app/api/matchmaking/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST() {
  // Chercher une room en attente
  const { data: waitingRoom, error } = await supabase
    .from('matchmaking_queue')
    .select('room_id')
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (waitingRoom) {
    // Rejoindre la room existante
    await supabase
      .from('matchmaking_queue')
      .update({ status: 'matched' })
      .eq('room_id', waitingRoom.room_id);

    return NextResponse.json({ roomId: waitingRoom.room_id });
  }

  // Créer une nouvelle room
  const roomId = uuid().slice(0, 8);
  
  await supabase
    .from('matchmaking_queue')
    .insert({ room_id: roomId, status: 'waiting' });

  return NextResponse.json({ roomId });
}
```

#### 6.3 Mobile Touch Controls

**Fichier : `apps/web/components/game/TouchControls.tsx`**
```typescript
'use client';

import { useInputHandler } from '@/hooks/useInputHandler';
import type { Direction } from '@project/shared/types';

const DIRECTIONS: Direction[] = ['left', 'down', 'up', 'right'];

const ICONS: Record<Direction, string> = {
  left: '←',
  down: '↓',
  up: '↑',
  right: '→',
};

const COLORS: Record<Direction, string> = {
  left: 'bg-pink-500 active:bg-pink-400',
  down: 'bg-blue-500 active:bg-blue-400',
  up: 'bg-green-500 active:bg-green-400',
  right: 'bg-yellow-500 active:bg-yellow-400',
};

export default function TouchControls() {
  const { createTouchHandler } = useInputHandler();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 flex justify-center items-center gap-2 p-4 bg-black/50 md:hidden">
      {DIRECTIONS.map((direction) => (
        <button
          key={direction}
          onTouchStart={createTouchHandler(direction)}
          className={`
            w-20 h-20 rounded-full ${COLORS[direction]}
            flex items-center justify-center
            text-3xl font-bold text-white
            select-none touch-none
          `}
        >
          {ICONS[direction]}
        </button>
      ))}
    </div>
  );
}
```

---

## Spécifications techniques détaillées

### Timing et synchronisation

```
Client A                  Server                  Client B
   │                         │                         │
   │─── Input (t=1000ms) ───>│                         │
   │                         │<─── Input (t=1002ms) ───│
   │                         │                         │
   │                    [Validate & Process]           │
   │                         │                         │
   │<── State Update ────────│───── State Update ─────>│
   │   (t=1050ms)            │       (t=1052ms)        │
```

- **Latence acceptable** : ~50-100ms
- **Input buffer** : Les inputs sont timestampés côté client et validés côté serveur
- **Reconciliation** : Le serveur est autoritaire, les clients ajustent leur état local

### Calcul des dégâts

```
Dégâts = BASE_DAMAGE + (COMBO_ADVERSAIRE × COMBO_DAMAGE_MULTIPLIER)
       = 5 + (combo × 0.5)

Exemples :
- Combo adversaire = 0  → 5 dégâts
- Combo adversaire = 10 → 10 dégâts  
- Combo adversaire = 50 → 30 dégâts
```

### Densité dynamique des notes

```
Combo 0-9   → ×1.0 (base)
Combo 10-24 → ×1.5
Combo 25-49 → ×2.0
Combo 50+   → ×3.0 (+ Ultimate disponible)
```

### Comeback mechanic

```
Si HP ≤ 30% :
  - Fenêtre Perfect : 50ms → 70ms (+20ms)
  - Fenêtre Good : 100ms → 120ms (+20ms)
```

---

## API et contrats de données

### REST Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/audio/process` | POST | Traitement audio YouTube |
| `/api/audio/{songId}` | GET | Récupérer l'audio processé |
| `/api/matchmaking` | POST | Rejoindre la queue de matchmaking |

### WebSocket Messages

Voir section [4.1 Messages WebSocket](#41-messages-websocket)

---

## Guide de déploiement

### 1. Vercel (Frontend)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd apps/web
vercel
```

Variables d'environnement à configurer :
- `NEXT_PUBLIC_PARTYKIT_HOST`
- `NEXT_PUBLIC_WORKER_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 2. PartyKit

```bash
# Déployer
npx partykit deploy
```

Variables d'environnement :
- `WORKER_URL`

### 3. Cloudflare Workers

```bash
cd workers/audio-processor
npx wrangler deploy
```

Créer le bucket R2 :
```bash
npx wrangler r2 bucket create audio-cache
```

### 4. Supabase

1. Créer un projet sur supabase.com
2. Exécuter les migrations :

```sql
-- Table matchmaking
CREATE TABLE matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(8) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_matchmaking_status ON matchmaking_queue(status, created_at);

-- Cleanup automatique (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_matchmaking()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM matchmaking_queue 
  WHERE created_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Checklist finale MVP

- [ ] Le joueur peut créer/rejoindre une room
- [ ] Le joueur peut soumettre un lien YouTube
- [ ] La beatmap est générée automatiquement
- [ ] Le joueur peut choisir le timestamp ou laisser auto
- [ ] Les notes descendent en rythme avec la musique
- [ ] Les 4 touches directionnelles fonctionnent (clavier)
- [ ] Les 4 zones tactiles fonctionnent (mobile)
- [ ] Perfect/Good/Miss sont détectés correctement
- [ ] Le combo s'incrémente et reset correctement
- [ ] Les dégâts sont infligés sur miss
- [ ] La densité augmente avec le combo
- [ ] La comeback mechanic fonctionne
- [ ] Le countdown synchronise les joueurs
- [ ] Les deux joueurs voient le même état
- [ ] La partie se termine à 0 HP ou après 60s
- [ ] Le gagnant est correctement déterminé
- [ ] Le matchmaking public fonctionne

---

## Notes pour le pair programming IA

1. **Toujours commencer par les types** : Définir les interfaces avant d'implémenter
2. **Tester en solo d'abord** : Valider le gameplay avant le multijoueur
3. **Logs détaillés** : Ajouter des logs pour debug la synchro
4. **Fallbacks** : Prévoir des fallbacks si l'audio processing échoue
5. **Mobile first** : Tester régulièrement sur mobile
6. **Performance** : Utiliser `requestAnimationFrame` pour le game loop client
7. **État serveur autoritaire** : Ne jamais faire confiance au client pour le scoring

Bonne chance et amuse-toi bien ! 🎮🎵