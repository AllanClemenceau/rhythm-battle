import type * as Party from "partykit/server";
import type {
  ClientMessage,
  ServerMessage,
  RoomState
} from "../packages/shared/types/messages";
import type {
  GameState,
  PlayerState,
  Beatmap
} from "../packages/shared/types/game";
import { GAME } from "../packages/shared/constants";

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
      songSubmitted: this.beatmap !== null,
      youtubeUrl: this.youtubeUrl || undefined,
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`[${this.room.id}] Player ${conn.id} connected`);

    // Envoyer l'état actuel de la room
    conn.send(JSON.stringify({
      type: 'room_state',
      payload: this.getRoomState(),
    } as ServerMessage));
  }

  async onMessage(message: string, sender: Party.Connection) {
    const msg: any = JSON.parse(message);

    switch (msg.type) {
      case 'join':
        this.handleJoin(sender, msg.payload.playerName);
        break;
      case 'ready':
        this.handleReady(sender.id, msg.payload.ready);
        break;
      case 'submit_song':
        this.handleSubmitSong(msg.payload.youtubeUrl, msg.payload.startTime);
        break;
      case 'set_beatmap':
        this.setBeatmap(msg.payload.beatmap);
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

    // Send player their own ID
    this.send(conn.id, { type: 'joined', payload: { playerId: conn.id } });

    this.broadcast({ type: 'player_joined', payload: { player: player.state } });
    this.broadcast({ type: 'room_state', payload: this.getRoomState() });
  }

  handleReady(playerId: string, ready: boolean) {
    const player = this.players.get(playerId);
    if (!player) return;

    player.ready = ready;
    this.broadcast({ type: 'player_ready', payload: { playerId, ready } });

    // Broadcast updated room state so clients can see ready status
    this.broadcast({ type: 'room_state', payload: this.getRoomState() });

    // Vérifier si on peut démarrer
    if (this.players.size === 2 &&
        Array.from(this.players.values()).every(p => p.ready) &&
        this.beatmap) {
      this.startCountdown();
    }
  }

  handleSubmitSong(youtubeUrl: string, startTime?: number) {
    // Pour l'instant on accepte juste l'URL
    // La beatmap sera envoyée directement par le client qui l'a générée
    this.youtubeUrl = youtubeUrl;
    this.broadcast({ type: 'room_state', payload: this.getRoomState() });
  }

  setBeatmap(beatmap: Beatmap) {
    this.beatmap = beatmap;
    console.log(`[${this.room.id}] Beatmap set:`, beatmap.id);

    // Broadcast beatmap to all players
    this.broadcast({
      type: 'beatmap_received',
      payload: { beatmap }
    });

    // Update room state
    this.broadcast({ type: 'room_state', payload: this.getRoomState() });
  }

  startCountdown() {
    const startAt = Date.now() + GAME.COUNTDOWN_DURATION;
    this.broadcast({ type: 'countdown_start', payload: { startAt } });

    setTimeout(() => {
      this.startGame();
    }, GAME.COUNTDOWN_DURATION);
  }

  startGame() {
    if (!this.beatmap) {
      console.log(`[${this.room.id}] Cannot start game - no beatmap`);
      return;
    }

    console.log(`[${this.room.id}] 🎮 Starting game!`);

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
        audioUrl: '', // Le client utilisera son propre audioBuffer
      },
    });

    console.log(`[${this.room.id}] Game started, starting game loop`);

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

    // Broadcast état actuel (sans la beatmap qui ne change jamais)
    // Create a fresh copy to ensure proper serialization
    const payload = {
      players: this.gameState.players.map(p => ({
        id: p.id,
        hp: p.hp,
        combo: p.combo,
        maxCombo: p.maxCombo,
        score: p.score,
        perfectCount: p.perfectCount,
        goodCount: p.goodCount,
        missCount: p.missCount,
      })),
      currentTime: this.gameState.currentTime,
      status: this.gameState.status,
    };

    this.broadcast({
      type: 'game_update',
      payload
    });
  }

  handleInput(playerId: string, payload: { noteId: string; result: any; timestamp: number }) {
    if (!this.gameState) {
      console.log(`[${this.room.id}] Input ignored - no game state`);
      return;
    }

    console.log(`[${this.room.id}] Input from ${playerId}:`, payload.result);

    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      console.log(`[${this.room.id}] Player not found in game state`);
      return;
    }

    const player = this.gameState.players[playerIndex];
    const opponent = this.gameState.players[1 - playerIndex];

    // Mettre à jour l'état du joueur
    if (payload.result === 'miss') {
      // Miss = perte de combo + dégâts basés sur le combo adverse
      player.combo = 0;
      player.missCount++;

      const damage = GAME.BASE_DAMAGE + opponent.combo * GAME.COMBO_DAMAGE_MULTIPLIER;
      player.hp = Math.max(0, player.hp - damage);

      console.log(`[${this.room.id}] Player ${playerId.slice(0, 8)} missed - new missCount: ${player.missCount}, hp: ${player.hp}`);

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

  handleMiss(playerId: string, payload: { direction: any; timestamp: number }) {
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

GameRoom satisfies Party.Worker;
