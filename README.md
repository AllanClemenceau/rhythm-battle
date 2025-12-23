# RhythmBattle

A real-time multiplayer rhythm battle game where two players compete on a music track submitted via YouTube.

## Project Structure

```
rhythm-battle/
├── apps/
│   └── web/              # Next.js frontend application
├── packages/
│   └── shared/           # Shared types, constants, and utilities
├── party/                # PartyKit WebSocket server
├── workers/              # Cloudflare Workers
│   └── audio-processor/  # Audio extraction and beatmap generation
└── info.md              # Detailed project documentation
```

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, Zustand
- **Real-time**: PartyKit (WebSocket)
- **Audio Processing**: Cloudflare Workers, yt-dlp, Essentia.js
- **Database**: Supabase (PostgreSQL + Storage)
- **Deployment**: Vercel, PartyKit, Cloudflare

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.2.3

### Installation

```bash
# Install dependencies
npm install

# Run development servers
npm run dev
```

### Development Commands

```bash
# Run all dev servers
npm run dev

# Run specific apps
npm run web      # Next.js app only
npm run party    # PartyKit server
npm run worker   # Cloudflare Worker

# Build for production
npm run build

# Lint
npm run lint
```

## Development Phases

- [x] Phase 1: Setup & Infrastructure
- [ ] Phase 2: Gameplay Core Solo
- [ ] Phase 3: Audio & Beatmap Generation
- [ ] Phase 4: Multiplayer Real-time
- [ ] Phase 5: Combat System
- [ ] Phase 6: Matchmaking & Polish

## Documentation

See [info.md](./info.md) for detailed architecture, specifications, and implementation guide.

## License

MIT
