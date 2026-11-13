// Organ score at game end
export interface OrganScore {
  goalsMet: string[];
  score: number;
}

// Game metadata
export interface GameMetadata {
  title: string;
  subtitle: string;
  currentTurn: number;
  totalTurns: number;
  startDate: string;
  currentPeriod: string;
  status: 'active' | 'completed' | 'paused';
  /** True when the game has ended and final results are available. */
  isGameOver?: boolean;
  /** Multi-line narrative summary shown when the game ends. */
  gameOverMessage?: string;
  /** Final scores per organ, keyed by organ id. */
  organScores?: Record<string, OrganScore>;
}

// Organ (game entity) information
export interface Organ {
  id: string;
  name: string;
  leader: string;
  role: string;
  /** Beginner-friendly explanation: brief history, position in the conflict, and why this organ matters. */
  description?: string;
  color: string;
  isPlayerOrgan: boolean;
  /** Things this organ is obligated to do — non-negotiable duties and constraints. */
  mustDo?: string[];
  /** Actions this organ can take — available moves and strategic options. */
  canDo?: string[];
  goals?: OrganGoal[];
  redLines?: string[];
  levers?: string[];
}

export interface OrganGoal {
  description: string;
  weight: number;
}

// Current metrics
export interface Metrics {
  strikeDaysScheduled: number;
  averagePayIncrease: number;
  trainingPlacesOffered: number;
  examFeesCompensated: number;
  payRestorationGap: number;
  baseUnity: number;
  publicSupport: number;
  governmentStability: number;
  waitingListImpact: number;
  monthsToMandateExpiry: number;
  referendumProjection: number;
  reballotRisk: number;
}

// Turn timeline
export interface TurnCalendar {
  turn: number;
  startDate: string;
  endDate: string;
  periodRu: string;
  phase: string;
  status: 'completed' | 'active' | 'upcoming';
  keyEvents: string[];
  /** Brief summary of the turn outcome (2-4 sentences), displayed in the timeline alongside key events. */
  roundSummary?: string;
}

// Decision history
export interface Decision {
  turn: number;
  date: string;
  actor: string;
  action: string;
  impact: string;
  description: string;
}

// Newspaper articles
export interface NewspaperArticle {
  id: string;
  turn: number;
  source: string;
  headline: string;
  /** Short summary (1-2 sentences), expandable via showMore */
  summary: string;
  /** Full article text, expandable via showMore */
  text?: string;
  sentiment: 'negative' | 'neutral' | 'positive';
  publishedAt: string;
}

// Social media posts
export interface SocialMediaPost {
  id: string;
  turn: number;
  author: string;
  handle: string;
  avatar?: string;
  content: string;
  likes: number;
  retweets: number;
  timestamp: string;
  hashtags: string[];
}

// Key numbers reference
export interface KeyNumbers {
  label: string;
  value: string;
  description?: string;
}

// Glossary term
export interface GlossaryTerm {
  term: string;
  definition: string;
}

// FAQ item
export interface FAQItem {
  question: string;
  answer: string;
}

// Complete game state
export interface GameState {
  game: GameMetadata;
  organs: Organ[];
  metrics: Metrics;
  turnCalendar: TurnCalendar[];
  decisions: Decision[];
  newspapers: NewspaperArticle[];
  socialMedia: SocialMediaPost[];
  keyNumbers?: KeyNumbers[];
  glossary?: GlossaryTerm[];
  faq?: FAQItem[];
  /** ISO-8601 timestamp of when this context was published/pushed. Falls back to fetch time if absent. */
  lastUpdated?: string;
}
