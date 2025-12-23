export interface Env {
  // R2 bucket sera ajouté plus tard
  // AUDIO_CACHE: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'rhythm-battle-audio-processor',
        timestamp: new Date().toISOString(),
      });
    }

    // Audio processing endpoint (implémenté en Phase 3)
    if (url.pathname === '/api/process' && request.method === 'POST') {
      return Response.json({
        error: 'Audio processing not yet implemented. Coming in Phase 3!',
      }, { status: 501 });
    }

    // Audio retrieval endpoint (implémenté en Phase 3)
    if (url.pathname.startsWith('/api/audio/') && request.method === 'GET') {
      return Response.json({
        error: 'Audio retrieval not yet implemented. Coming in Phase 3!',
      }, { status: 501 });
    }

    return Response.json({
      error: 'Not found',
      availableEndpoints: [
        'GET /health',
        'POST /api/process',
        'GET /api/audio/:songId',
      ],
    }, { status: 404 });
  },
};
