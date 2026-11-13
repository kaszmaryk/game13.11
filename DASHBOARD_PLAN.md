# Game Dashboard Plan — React + shadcn/ui on GitHub Pages

## Overview

Build a **read-only web dashboard** for your political simulation game that displays real-time game state, timeline events, decision history, and AI-generated media/social media reactions. The dashboard will be deployed to GitHub Pages and updated by pushing new JSON files to the repository.

---

## Architecture

```
game13.11/
├── .git/                          # Existing Git repo (linked to kaszmaryk/game13.11)
├── context.json                   # Game state data (updated each turn)
├── dashboard/                     # New React app directory
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameHeader.tsx           # Title, current turn, date range
│   │   │   ├── MetricsBoard.tsx         # Key metrics cards (coalition seats, votes against, etc.)
│   │   │   ├── TimelineView.tsx         # Turn calendar with active turn highlighted
│   │   │   ├── DecisionHistory.tsx      # Chronological list of player decisions
│   │   │   ├── NewspaperSection.tsx     # Generated newspaper articles and headlines
│   │   │   ├── SocialMediaFeed.tsx      # Tweet-style social media reactions
│   │   │   └── CoalitionStatus.tsx      # Visual party relationship matrix
│   │   ├── hooks/
│   │   │   └── useGameState.ts          # Fetch and parse context.json
│   │   ├── lib/
│   │   │   └── utils.ts                 # shadcn utility functions
│   │   ├── types/
│   │   │   └── game.ts                  # TypeScript interfaces for game data
│   │   ├── App.tsx                      # Main layout with sections
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Tailwind imports
│   ├── components.json                # shadcn/ui configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions CI/CD pipeline
└── DASHBOARD_PLAN.md                  # This file
```

---

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (for metric trends if needed)
- **Deployment**: GitHub Pages via GitHub Actions
- **Data Source**: `context.json` in repository root

---

## Data Structure Requirements

Your `context.json` should include these sections for the dashboard:

### 1. Game Metadata
```json
{
  "game": {
    "title": "Game Title",
    "currentTurn": 2,
    "totalTurns": 5,
    "startDate": "2026-09-14",
    "currentPeriod": "28 сентября 2026 — 11 октября 2026",
    "status": "active" | "completed" | "paused"
  }
}
```

### 2. Party Information
```json
{
  "parties": [
    {
      "id": "S",
      "name": "Социал-демократы",
      "leader": "Магдалена Андерссон",
      "mandates": 99,
      "color": "#E30613",
      "isPlayerParty": true
    }
  ]
}
```

### 3. Current Metrics
```json
{
  "metrics": {
    "coalitionSeats": 176,
    "votesAgainst": 173,
    "ministerPosts": 8,
    "policyDemandsMet": 65,
    "publicSupport": 58,
    "extravalRisk": 10
  }
}
```

### 4. Turn Timeline
```json
{
  "turnCalendar": [
    {
      "turn": 1,
      "startDate": "2026-09-14",
      "endDate": "2026-09-27",
      "periodRu": "14 сентября 2026 — 27 сентября 2026",
      "status": "completed" | "active" | "upcoming",
      "keyEvents": ["Event 1", "Event 2"]
    }
  ]
}
```

### 5. Decision History
```json
{
  "decisions": [
    {
      "turn": 1,
      "date": "2026-09-15",
      "actor": "C",
      "action": "Отказали в переговорах с M",
      "impact": "Повышен extravalRisk на 2",
      "description": "Партия центра закрыла дверь Кристерссону"
    }
  ]
}
```

### 6. Newspaper Articles
```json
{
  "newspapers": [
    {
      "id": "article-001",
      "turn": 1,
      "source": "Dagens Nyheter",
      "headline": "Центр отвергает правую коалицию",
      "summary": "Краткое содержание статьи...",
      "sentiment": "negative" | "neutral" | "positive",
      "publishedAt": "2026-09-15T10:30:00Z"
    }
  ]
}
```

### 7. Social Media Posts
```json
{
  "socialMedia": [
    {
      "id": "tweet-001",
      "turn": 1,
      "author": "@PoliticalAnalyst_SE",
      "handle": "PoliticalAnalyst_SE",
      "avatar": "url-to-avatar.jpg",
      "content": "Партия центра только что закрыла дверь для Кристерссона. Это меняет всё! #Швеция #Выборы2026",
      "likes": 1247,
      "retweets": 389,
      "timestamp": "2026-09-15T11:45:00Z",
      "hashtags": ["#Швеция", "#Выборы2026"]
    }
  ]
}
```

---

## Dashboard Sections

### Header Section
- Game title
- Current turn indicator (e.g., "Раунд 2 из 5")
- Current date range
- Game status badge

### Metrics Board
Display key metrics as cards:
- Coalition Seats (with progress bar toward 175)
- Votes Against (with warning threshold at 175)
- Minister Posts secured
- Policy Demands Met (%)
- Public Support rating
- Extraval Risk indicator

### Timeline View
- Horizontal or vertical timeline showing all turns
- Active turn highlighted
- Completed turns show summary
- Upcoming turns grayed out

### Decision History
- Chronological list of major decisions
- Filterable by party/actor
- Each decision shows: who, what, when, impact
- Expandable for details

### Newspaper Section
- Grid or list of generated articles
- Each article card shows: source, headline, summary, sentiment badge
- Sorted by publication date
- Sentiment color coding (red=negative, yellow=neutral, green=positive)

### Social Media Feed
- Twitter/X-style feed of posts
- Each post shows: avatar, author, content, engagement metrics
- Hashtags clickable (filter functionality)
- Real-time feel with timestamps ("2 часа назад")

### Coalition Status (Optional)
- Visual matrix showing party relationships
- Color-coded compatibility scores
- Current coalition composition visualization

---

## Implementation Steps

### Phase 1: Project Setup (Day 1)
1. Initialize React + Vite + TypeScript project in `dashboard/` folder
2. Install dependencies: React, shadcn/ui, Tailwind CSS, Lucide icons
3. Configure shadcn/ui with `npx shadcn-ui@latest init`
4. Set up basic project structure and routing
5. Create TypeScript types for game data

### Phase 2: Core Components (Days 2-3)
1. Build `useGameState` hook to fetch and parse `context.json`
2. Create `GameHeader` component
3. Implement `MetricsBoard` with shadcn Card components
4. Build `TimelineView` component
5. Create `DecisionHistory` with accordion/list layout

### Phase 3: Media Sections (Days 4-5)
1. Build `NewspaperSection` with article cards
2. Implement `SocialMediaFeed` with tweet-style components
3. Add filtering and sorting capabilities
4. Style with sentiment badges and engagement metrics

### Phase 4: Polish & Testing (Day 6)
1. Responsive design adjustments for mobile/tablet
2. Loading states and error handling
3. Add animations/transitions for smooth UX
4. Test with sample `context.json` data
5. Optimize bundle size

### Phase 5: Deployment Setup (Day 7)
1. Configure Vite for GitHub Pages deployment (base path)
2. Create GitHub Actions workflow for auto-deployment
3. Set up `.github/workflows/deploy.yml`
4. Test deployment pipeline
5. Verify live site at `https://kaszmaryk.github.io/game13.11/`

---

## GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Dashboard to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'dashboard/**'
      - 'context.json'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: dashboard/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: ./dashboard

      - name: Build
        run: npm run build
        working-directory: ./dashboard

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dashboard/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Update Workflow

### Manual Update Process:
1. Game engine generates new `context.json` with updated state
2. Commit and push to GitHub:
   ```bash
   git add context.json
   git commit -m "Update game state - Turn 2"
   git push origin main
   ```
3. GitHub Actions automatically rebuilds and deploys
4. Dashboard reflects new state within 2-3 minutes

### Alternative: Local Build & Push
If you prefer manual control:
```bash
cd dashboard
npm run build
# Deploy dist/ to gh-pages branch manually
```

---

## Design Guidelines

### Color Scheme
- Use shadcn/ui default theme with customizations
- Party colors from `context.json` for visual consistency
- Sentiment indicators: Red (negative), Yellow (neutral), Green (positive)
- Warning colors for high-risk metrics (extravalRisk > 15)

### Typography
- Clean, readable sans-serif (Inter or system fonts)
- Clear hierarchy: H1 for title, H2 for sections, body text for content
- Russian language support (ensure font includes Cyrillic glyphs)

### Layout
- Single-page scrollable layout
- Sticky navigation for quick section jumps
- Responsive grid system (1 col mobile, 2-3 cols desktop)
- Max-width container for readability (1200-1400px)

### Accessibility
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast ratios
- Screen reader friendly structure

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-accordion": "^1.1.0",
    "@radix-ui/react-card": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## Future Enhancements

Once the basic dashboard is working:

1. **Historical Comparison**: Toggle between different turns to see changes
2. **Export Functionality**: Download current state as PDF or image
3. **Dark Mode**: Theme toggle for comfortable viewing
4. **Real-time Updates**: WebSocket connection for live game sessions
5. **Multi-language Support**: Switch between Russian/English/Swedish
6. **Advanced Analytics**: Charts showing metric trends over time
7. **Party Profile Pages**: Detailed view for each party's status
8. **Coalition Simulator**: Interactive tool to test different coalition scenarios

---

## Success Criteria

✅ Dashboard loads and displays current game state from `context.json`  
✅ All seven sections render correctly with sample data  
✅ Responsive design works on mobile, tablet, and desktop  
✅ GitHub Actions successfully deploys to GitHub Pages  
✅ Site accessible at `https://kaszmaryk.github.io/game13.11/`  
✅ Update workflow tested: push new JSON → auto-deploy → verify changes  
✅ Russian text renders correctly with proper fonts  
✅ Performance: loads in under 3 seconds on average connection  

---

## Next Steps

1. **Confirm this plan** meets your requirements
2. **Prepare sample `context.json`** with all required sections (or I can help structure it based on your existing format)
3. **Start Phase 1**: Initialize the React project
4. **Iterate**: Review components as they're built and adjust as needed

Would you like me to proceed with implementation, or do you want to modify any aspects of this plan first?
