# 🍺 Academy

Academy is an interactive web-based drinking card game designed for lively game nights. It tracks player turns, sip counts in base 14, chug stopwatches for Aces, personal best records, real-time leaderboards (King & Jester), and multi-device shared remote control.

---

## 🎯 Game Rules & Mechanics

- **The Deck**: 13 rounds of cards per player (ranks 2 through 14/Ace) using custom suits:
  - ♠ Spades
  - ♣ Clubs
  - ♥ Hearts
  - ♦ Diamonds
  - ☘ Carls
  - 🟊 Heineken
- **Base 14 Sips**: Sips are displayed in base 14 (notated with $_{14}$), representing 14 sips per standard beer.
- **Chug Stopwatch (Ace / 14)**: Drawing an Ace triggers a Chug. A live stopwatch tracks the drinking time, records personal bests, and plays hype sounds and killstreak banners.
- **King & Jester**:
  - 👑 **King (Crown)**: The player who has taken the most sips.
  - 🃏 **Jester**: The player who has taken the fewest sips.
- **Game Modes**:
  - **Online**: Official ranked games submitted to the Academy backend, including photos, location tags, and player stats.
  - **Offline**: Unranked party games playable without an active internet connection or backend account.
- **Shared Remote Control**:
  - The host can generate a QR code or shareable link.
  - Connected mobile clients can view live standings, draw cards, toggle DNF status, and control chug timers over WebSockets.
- **Hidden Terminal**:
  - Press the backquote key (\`) on desktop to access an interactive terminal with commands like `game draw`, `sound play`, `help`, and Easter eggs.

---

## 🛠️ Tech Stack & Architecture

- **Framework & Language**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **UI Components & Theming**: [Material UI (MUI)](https://mui.com/), `@emotion/react`, `@emotion/styled`, with full Dark / Light / System mode support
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistence and reactive metrics calculation:
  - `game`: Core game state (players, deck draws, timestamps, DNF status)
  - `metrics`: Derived statistics (total sips, beers, round progress, min/max possible sips, leaderboards)
  - `settings`: User preferences (theme mode, card display, audio toggles, remote control tokens)
  - `location`: Geolocation store for official game submission
  - `gamesPlayed`: Local counter for games played
- **Audio Engine**: [Howler.js](https://howlerjs.com/) for sound effects and lobby music
- **Animations & Visuals**: [Framer Motion](https://www.framer.com/motion/), [React Confetti](https://github.com/alampros/react-confetti)
- **Testing**: [Vitest](https://vitest.dev/) and [@testing-library/react](https://testing-library.com/)
- **Quality & Linting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html), [Knip](https://knip.dev/), [Prettier](https://prettier.io/)

---

## 📁 Project Structure

```
new-game/
├── public/                 # Static assets, sounds (.mp3, .ogg), cards, SVG icons
├── src/
│   ├── api/                # Axios client, interceptors, endpoints, and WebSocket client
│   │   ├── client/         # Configured Axios instance
│   │   ├── endpoints/      # Game, authentication, stats, and time endpoints
│   │   ├── interceptors/   # Request and authentication token interceptors
│   │   ├── models/         # API data contract models
│   │   └── websocket/      # useWebSocket hook
│   ├── components/         # Shared presentation & feature components
│   │   ├── Base14Sips/     # Formats numbers to base 14 with subscript
│   │   ├── Bottle/         # Scalable SVG beer bottle indicator
│   │   ├── Bubbles/        # Background bubbly floating animation
│   │   ├── CardFlash/      # Splash dialog animation for drawn cards
│   │   ├── Conditional/    # Utility wrapper for conditional rendering
│   │   ├── ConfirmDialog/  # Accessible confirmation modal
│   │   ├── Hats/           # Crown and Jester badges
│   │   ├── MemeDialog/     # Giphy-powered meme modal
│   │   ├── SettingsDialog/ # Application configuration modal
│   │   ├── Terminal/       # In-game cheat code & diagnostic CLI
│   │   └── TextFlash/      # Animated banners for killstreaks and announcements
│   ├── contexts/           # React Contexts (SharedControl context & provider)
│   ├── hooks/              # Custom React hooks (sounds, camera, preloader, idleTimer)
│   ├── models/             # Domain models (Card, Player, Game, Location)
│   ├── routes/             # Route definitions and GameGuard access control
│   ├── stores/             # Zustand stores (game, metrics, settings, gamesPlayed, location)
│   ├── theme/              # Dark and Light MUI theme definitions and provider
│   ├── utilities/          # Pure helper utilities (deck shuffle, time formatters, base14)
│   └── views/              # Page views:
│       ├── Game/           # Main game board, table, charts, inventory, mobile menu
│       ├── Login/          # Setup view, new game configuration, and game resumption
│       └── SharedControl/  # Remote controller client view
└── vitest.config.ts        # Vitest test configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [pnpm](https://pnpm.io/) package manager (`corepack enable` or `npm i -g pnpm`)

### Installation

```bash
# Clone the repository and navigate into the folder
cd new-game

# Install project dependencies
pnpm install
```

### Development

```bash
# Start standard local development server (HTTP)
pnpm dev

# Start local development server with self-signed HTTPS (required for camera testing on local network)
pnpm dev:https
```

### Production Build

```bash
# Typecheck and compile production bundle
pnpm build
```

---

## 🧪 Testing & Code Quality

```bash
# Run unit and component tests with Vitest
pnpm test --run

# Run Vitest in interactive watch mode with UI
pnpm test:ui

# Fast linting using oxlint
pnpm lint

# Check for unused dependencies and dead code using Knip
pnpm knip

# Format codebase with Prettier
pnpm format
```

---

## 🐳 Docker Deployment

The application includes a `Dockerfile` and `docker-compose.yaml` configured with an Nginx reverse proxy:

```bash
# Build and start the containerized application
docker compose up -d --build
```
