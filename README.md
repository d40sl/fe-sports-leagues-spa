# Sports Leagues

A single-page application that displays sports leagues from TheSportsDB API with search, filtering, and pagination.

## Key Features

- Fetch and display sports leagues (name, sport type, alternate name)
- Debounced search filtering (250ms delay to avoid excessive re-renders)
- Sport type dropdown filter dynamically populated from API data
- Client-side pagination with configurable page size
- Click any league to view its season badge in a modal
- In-memory API response caching (assignment requirement)
- Full loading/error/success state handling
- Responsive design (360px mobile baseline)
- Keyboard accessible (Tab, Enter, Space, Escape)

## Architecture Overview

```
├── api/                      # Serverless functions (Vercel)
│   ├── leagues.ts            # Proxy for all_leagues.php
│   └── seasons.ts            # Proxy for search_all_seasons.php
├── src/
│   ├── api/
│   │   ├── cache.ts          # In-memory cache with TTL and LRU eviction
│   │   ├── client.ts         # Fetch wrapper with timeout, abort, deduplication
│   │   └── leagues.ts        # League and badge API functions
│   ├── components/
│   │   ├── BadgeModal.vue    # Modal with badge image and loading states
│   │   ├── LeagueCard.vue    # Table row (clickable, keyboard accessible)
│   │   ├── LeagueFilters.vue # Search input + sport dropdown
│   │   └── LeagueList.vue    # Table with pagination
│   ├── composables/
│   │   ├── useBadges.ts      # Badge prefetching and store
│   │   └── useLeagues.ts     # Data fetching, filtering, pagination state
│   ├── constants/
│   │   └── api.ts            # API endpoints and configuration
│   ├── types/
│   │   └── league.ts         # TypeScript interfaces
│   ├── styles/
│   │   └── _variables.scss   # Design tokens
│   ├── utils/
│   │   └── debounce.ts       # Debounce utility with cancel support
│   ├── App.vue               # Root component
│   └── main.ts               # Entry point
└── .env                      # API key configuration (git-ignored)
```

**Design Decisions:**
- Composition API composables (`useLeagues`, `useBadges`) for state management — no Pinia needed
- `shallowRef` for large arrays to avoid deep reactivity overhead
- Debounced search input to prevent excessive filtering
- API proxy layer to keep API keys secure server-side
- LRU cache with TTL for API responses (transparent to components)
- Badge prefetching for instant modal display
- Teleport for modal (proper stacking context)

## Tech Stack

- Vue 3.5 (Composition API with `<script setup>`)
- Vite 6 (build tool)
- TypeScript (strict mode)
- Vitest (unit testing)
- SCSS with design tokens

Vue 3 was chosen as the assignment places no version restriction and it is the officially recommended version for all new development. Vue 2 reached EOL in December 2023.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup & Run

```bash
git clone <repo-url>
cd sports-leagues
npm install
cp .env.example .env    # Configure API key
npm run dev
```

Dev server runs at: `http://localhost:5173`

## API Key Configuration

The API key is stored securely on the server side and **never exposed to the frontend**.

1. Copy `.env.example` to `.env`
2. Set your API key:

```bash
# Free tier (limited to 10 Soccer leagues)
SPORTSDB_API_KEY=123

# Premium tier (3000+ leagues across all sports)
SPORTSDB_API_KEY=your_premium_key_here
```

**How it works:**
- Frontend calls `/api/leagues` and `/api/seasons?id=...`
- Vite dev server proxies requests, injecting the API key server-side
- In production (Vercel), serverless functions handle the proxy
- The key never appears in browser network requests, source code, or build artifacts

To upgrade: Get your premium key from [TheSportsDB profile](https://www.thesportsdb.com/) after upgrading, update `.env`, and restart the dev server.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Lint and auto-fix |

## Running Tests

```bash
npm run test:unit
```

Expected output: 40 tests passing across 5 test suites (cache, client, leagues, debounce, useLeagues).

## Performance Considerations

- **Bundle size**: ~82KB total (~32KB gzipped) — no UI framework dependencies
- **Debounced search**: 250ms delay prevents re-filtering on every keystroke
- **Pre-normalized search**: Search fields lowercased once at load time, not per-filter
- **Shallow reactivity**: Large arrays use `shallowRef()` to avoid deep tracking
- **API caching**: LRU cache with 5-minute TTL; in-flight request deduplication
- **Computed properties**: Filtering uses Vue's `computed()` for automatic memoization
- **Badge prefetching**: Badges fetched in background after leagues load; modal opens instantly

## Security Notes

- **API key protected**: Key stored in environment variable, proxied server-side, never exposed to frontend
- **Input validation**: League IDs validated as numeric before API calls (injection prevention)
- **No `v-html` usage**: XSS prevention
- **Image error handling**: API URLs validated via `@error` handler with SVG fallback

## Trade-offs & Assumptions

- **No Pinia**: Local composable state sufficient for single-view app
- **No Vue Router**: Single page, no navigation requirements
- **Client-side pagination**: Simpler than virtual scrolling for this dataset size
- **Session-only cache**: No TTL invalidation (acceptable for demo scope)
- **Most recent badge**: Displays last season's badge (API returns chronological array)

## API Note

This app uses TheSportsDB API. The free tier (key `123`) returns **10 Soccer leagues** while premium returns **3000+ leagues across all sports**. The sport dropdown will only show "Soccer" with free tier access. The architecture correctly derives dropdown options from the API response and displays all sports with premium access.

To unlock the full experience, configure a premium API key in `.env`.

## Known Limitations

- No virtual scrolling (pagination handles large datasets instead)

## Future Improvements

- Add skeleton loading states instead of spinners
- Virtual scrolling for premium tier (3000+ leagues)
- E2E tests with Playwright
- Visual regression testing
