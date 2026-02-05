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
src/
├── api/
│   ├── cache.ts          # In-memory Map-based cache
│   ├── client.ts         # Fetch wrapper with timeout and error handling
│   └── leagues.ts        # League and badge API functions
├── components/
│   ├── BadgeModal.vue    # Modal with badge image and loading states
│   ├── LeagueCard.vue    # Table row (clickable, keyboard accessible)
│   ├── LeagueFilters.vue # Search input + sport dropdown
│   └── LeagueList.vue    # Table with pagination
├── composables/
│   └── useLeagues.ts     # Data fetching, filtering, pagination state
├── constants/
│   └── api.ts            # API endpoints and configuration
├── types/
│   └── league.ts         # TypeScript interfaces
├── styles/
│   └── _variables.scss   # Design tokens
├── utils/
│   └── debounce.ts       # Debounce utility with cancel support
├── App.vue               # Root component
└── main.ts               # Entry point
```

**Design Decisions:**
- Composition API composable (`useLeagues`) for state management — no Pinia needed
- `shallowRef` for large arrays to avoid deep reactivity overhead
- Debounced search input to prevent excessive filtering
- API caching at client level (transparent to components)
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
npm run dev
```

Dev server runs at: `http://localhost:5173`

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

- **Bundle size**: ~90KB total (~33KB gzipped) — no UI framework dependencies
- **Debounced search**: 250ms delay prevents re-filtering on every keystroke
- **Shallow reactivity**: Large arrays use `shallowRef()` to avoid deep tracking
- **API caching**: Responses cached in memory; repeat requests return instantly
- **Computed properties**: Filtering uses Vue's `computed()` for automatic memoization
- **Lazy badge loading**: Badge API called only when modal opens, then cached

## Security Notes

- No `v-html` usage (XSS prevention)
- Image URLs from API validated via `@error` handler with SVG fallback
- No sensitive data stored or transmitted
- API key is public free-tier key (no secrets)

## Trade-offs & Assumptions

- **No Pinia**: Local composable state sufficient for single-view app
- **No Vue Router**: Single page, no navigation requirements
- **Client-side pagination**: Simpler than virtual scrolling for this dataset size
- **Session-only cache**: No TTL invalidation (acceptable for demo scope)
- **Most recent badge**: Displays last season's badge (API returns chronological array)

## API Note

This app uses TheSportsDB free tier API (key "3"). The `all_leagues.php` endpoint returns **10 Soccer leagues** on the free tier vs **3000+ leagues across all sports** on premium. The sport dropdown will only show "Soccer" with free tier access. The code architecture correctly derives dropdown options from the full API response and would display all sports with premium access.

## Known Limitations

- Badge modal doesn't preload images
- No virtual scrolling (pagination handles large datasets instead)

## Future Improvements

- Add skeleton loading states instead of spinners
- Add badge image preloading on hover
- Virtual scrolling for premium tier (3000+ leagues)
- E2E tests with Playwright
- Visual regression testing
