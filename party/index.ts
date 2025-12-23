import type * as Party from "partykit/server";

export default class GameRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `[${this.room.id}] Player ${conn.id} connected from ${ctx.request.headers.get("x-forwarded-for") || "unknown"}`
    );

    // Envoyer un message de bienvenue
    conn.send(JSON.stringify({
      type: 'connected',
      payload: {
        roomId: this.room.id,
        playerId: conn.id,
        message: 'Welcome to RhythmBattle!',
      },
    }));
  }

  onMessage(message: string, sender: Party.Connection) {
    console.log(`[${this.room.id}] Message from ${sender.id}:`, message);

    // Pour l'instant, on broadcast tous les messages
    // La logique de jeu sera implémentée en Phase 4
    this.room.broadcast(message, [sender.id]);
  }

  onClose(conn: Party.Connection) {
    console.log(`[${this.room.id}] Player ${conn.id} disconnected`);
  }

  onError(conn: Party.Connection, error: Error) {
    console.error(`[${this.room.id}] Error for ${conn.id}:`, error);
  }
}

GameRoom satisfies Party.Worker;
