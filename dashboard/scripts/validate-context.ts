#!/usr/bin/env node
/**
 * Context JSON Validator
 * Validates context.json against the TypeScript schema defined in src/types/game.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Type definitions (mirroring src/types/game.ts)
interface GameMetadata {
  title: string;
  currentTurn: number;
  totalTurns: number;
  startDate: string;
  currentPeriod: string;
  status: 'active' | 'completed' | 'paused';
}

interface Party {
  id: string;
  name: string;
  leader: string;
  mandates: number;
  color: string;
  isPlayerParty: boolean;
}

interface Metrics {
  coalitionSeats: number;
  votesAgainst: number;
  ministerPosts: number;
  policyDemandsMet: number;
  publicSupport: number;
  extravalRisk: number;
}

interface TurnCalendar {
  turn: number;
  startDate: string;
  endDate: string;
  periodRu: string;
  status: 'completed' | 'active' | 'upcoming';
  keyEvents: string[];
}

interface Decision {
  turn: number;
  date: string;
  actor: string;
  action: string;
  impact: string;
  description: string;
}

interface NewspaperArticle {
  id: string;
  turn: number;
  source: string;
  headline: string;
  summary: string;
  sentiment: 'negative' | 'neutral' | 'positive';
  publishedAt: string;
}

interface SocialMediaPost {
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

interface GameState {
  game: GameMetadata;
  parties: Party[];
  metrics: Metrics;
  turnCalendar: TurnCalendar[];
  decisions: Decision[];
  newspapers: NewspaperArticle[];
  socialMedia: SocialMediaPost[];
}

// Validation errors collector
const errors: string[] = [];
const warnings: string[] = [];

// Helper functions
function assertType(value: any, expectedType: string, path: string): void {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    errors.push(`${path}: Expected ${expectedType}, got ${actualType}`);
  }
}

function assertArray(value: any, path: string): void {
  if (!Array.isArray(value)) {
    errors.push(`${path}: Expected array, got ${typeof value}`);
  }
}

function assertOneOf(value: any, allowedValues: any[], path: string): void {
  if (!allowedValues.includes(value)) {
    errors.push(`${path}: Value "${value}" not in allowed values [${allowedValues.join(', ')}]`);
  }
}

function assertRange(value: number, min: number, max: number, path: string): void {
  if (value < min || value > max) {
    warnings.push(`${path}: Value ${value} outside recommended range [${min}-${max}]`);
  }
}

// Validators
function validateGameMetadata(game: any): void {
  const path = 'game';
  assertType(game, 'object', path);
  
  if (typeof game !== 'object') return;
  
  assertType(game.title, 'string', `${path}.title`);
  assertType(game.currentTurn, 'number', `${path}.currentTurn`);
  assertType(game.totalTurns, 'number', `${path}.totalTurns`);
  assertType(game.startDate, 'string', `${path}.startDate`);
  assertType(game.currentPeriod, 'string', `${path}.currentPeriod`);
  assertOneOf(game.status, ['active', 'completed', 'paused'], `${path}.status`);
  
  // Business logic checks
  if (game.currentTurn > game.totalTurns) {
    warnings.push(`${path}.currentTurn (${game.currentTurn}) exceeds totalTurns (${game.totalTurns})`);
  }
}

function validateParties(parties: any): void {
  const path = 'parties';
  assertArray(parties, path);
  
  if (!Array.isArray(parties)) return;
  
  if (parties.length === 0) {
    warnings.push(`${path}: Empty parties array`);
  }
  
  let totalMandates = 0;
  let playerPartyCount = 0;
  
  parties.forEach((party: any, index: number) => {
    const partyPath = `${path}[${index}]`;
    assertType(party, 'object', partyPath);
    
    if (typeof party !== 'object') return;
    
    assertType(party.id, 'string', `${partyPath}.id`);
    assertType(party.name, 'string', `${partyPath}.name`);
    assertType(party.leader, 'string', `${partyPath}.leader`);
    assertType(party.mandates, 'number', `${partyPath}.mandates`);
    assertType(party.color, 'string', `${partyPath}.color`);
    assertType(party.isPlayerParty, 'boolean', `${partyPath}.isPlayerParty`);
    
    // Validate color format (hex)
    if (party.color && !/^#[0-9A-Fa-f]{6}$/.test(party.color)) {
      warnings.push(`${partyPath}.color: "${party.color}" is not a valid hex color`);
    }
    
    // Count mandates and player parties
    if (typeof party.mandates === 'number') {
      totalMandates += party.mandates;
      assertRange(party.mandates, 0, 349, `${partyPath}.mandates`);
    }
    
    if (party.isPlayerParty === true) {
      playerPartyCount++;
    }
  });
  
  // Swedish Riksdag has exactly 349 seats
  if (totalMandates !== 349) {
    warnings.push(`${path}: Total mandates sum to ${totalMandates}, expected 349 (Swedish Riksdag)`);
  }
  
  if (playerPartyCount === 0) {
    warnings.push(`${path}: No party marked as player party`);
  } else if (playerPartyCount > 1) {
    warnings.push(`${path}: Multiple parties marked as player party (${playerPartyCount})`);
  }
}

function validateMetrics(metrics: any): void {
  const path = 'metrics';
  assertType(metrics, 'object', path);
  
  if (typeof metrics !== 'object') return;
  
  assertType(metrics.coalitionSeats, 'number', `${path}.coalitionSeats`);
  assertType(metrics.votesAgainst, 'number', `${path}.votesAgainst`);
  assertType(metrics.ministerPosts, 'number', `${path}.ministerPosts`);
  assertType(metrics.policyDemandsMet, 'number', `${path}.policyDemandsMet`);
  assertType(metrics.publicSupport, 'number', `${path}.publicSupport`);
  assertType(metrics.extravalRisk, 'number', `${path}.extravalRisk`);
  
  // Range validations
  if (typeof metrics.coalitionSeats === 'number') {
    assertRange(metrics.coalitionSeats, 0, 349, `${path}.coalitionSeats`);
  }
  if (typeof metrics.votesAgainst === 'number') {
    assertRange(metrics.votesAgainst, 0, 349, `${path}.votesAgainst`);
  }
  if (typeof metrics.ministerPosts === 'number') {
    assertRange(metrics.ministerPosts, 0, 24, `${path}.ministerPosts`);
  }
  if (typeof metrics.policyDemandsMet === 'number') {
    assertRange(metrics.policyDemandsMet, 0, 100, `${path}.policyDemandsMet`);
  }
  if (typeof metrics.publicSupport === 'number') {
    assertRange(metrics.publicSupport, 0, 100, `${path}.publicSupport`);
  }
  if (typeof metrics.extravalRisk === 'number') {
    assertRange(metrics.extravalRisk, 0, 100, `${path}.extravalRisk`);
  }
  
  // Business logic: negative parliamentarianism threshold
  if (typeof metrics.votesAgainst === 'number' && metrics.votesAgainst >= 175) {
    warnings.push(`${path}.votesAgainst: ${metrics.votesAgainst} >= 175 means candidate would be rejected`);
  }
}

function validateTurnCalendar(turnCalendar: any): void {
  const path = 'turnCalendar';
  assertArray(turnCalendar, path);
  
  if (!Array.isArray(turnCalendar)) return;
  
  turnCalendar.forEach((turn: any, index: number) => {
    const turnPath = `${path}[${index}]`;
    assertType(turn, 'object', turnPath);
    
    if (typeof turn !== 'object') return;
    
    assertType(turn.turn, 'number', `${turnPath}.turn`);
    assertType(turn.startDate, 'string', `${turnPath}.startDate`);
    assertType(turn.endDate, 'string', `${turnPath}.endDate`);
    assertType(turn.periodRu, 'string', `${turnPath}.periodRu`);
    assertOneOf(turn.status, ['completed', 'active', 'upcoming'], `${turnPath}.status`);
    assertArray(turn.keyEvents, `${turnPath}.keyEvents`);
    
    // Date validation
    if (turn.startDate && turn.endDate) {
      const start = new Date(turn.startDate);
      const end = new Date(turn.endDate);
      if (start > end) {
        errors.push(`${turnPath}: startDate (${turn.startDate}) is after endDate (${turn.endDate})`);
      }
    }
  });
}

function validateDecisions(decisions: any): void {
  const path = 'decisions';
  assertArray(decisions, path);
  
  if (!Array.isArray(decisions)) return;
  
  decisions.forEach((decision: any, index: number) => {
    const decisionPath = `${path}[${index}]`;
    assertType(decision, 'object', decisionPath);
    
    if (typeof decision !== 'object') return;
    
    assertType(decision.turn, 'number', `${decisionPath}.turn`);
    assertType(decision.date, 'string', `${decisionPath}.date`);
    assertType(decision.actor, 'string', `${decisionPath}.actor`);
    assertType(decision.action, 'string', `${decisionPath}.action`);
    assertType(decision.impact, 'string', `${decisionPath}.impact`);
    assertType(decision.description, 'string', `${decisionPath}.description`);
  });
}

function validateNewspapers(newspapers: any): void {
  const path = 'newspapers';
  assertArray(newspapers, path);
  
  if (!Array.isArray(newspapers)) return;
  
  newspapers.forEach((article: any, index: number) => {
    const articlePath = `${path}[${index}]`;
    assertType(article, 'object', articlePath);
    
    if (typeof article !== 'object') return;
    
    assertType(article.id, 'string', `${articlePath}.id`);
    assertType(article.turn, 'number', `${articlePath}.turn`);
    assertType(article.source, 'string', `${articlePath}.source`);
    assertType(article.headline, 'string', `${articlePath}.headline`);
    assertType(article.summary, 'string', `${articlePath}.summary`);
    assertOneOf(article.sentiment, ['negative', 'neutral', 'positive'], `${articlePath}.sentiment`);
    assertType(article.publishedAt, 'string', `${articlePath}.publishedAt`);
    
    // ISO date validation
    if (article.publishedAt && isNaN(Date.parse(article.publishedAt))) {
      errors.push(`${articlePath}.publishedAt: Invalid ISO date format`);
    }
  });
}

function validateSocialMedia(socialMedia: any): void {
  const path = 'socialMedia';
  assertArray(socialMedia, path);
  
  if (!Array.isArray(socialMedia)) return;
  
  socialMedia.forEach((post: any, index: number) => {
    const postPath = `${path}[${index}]`;
    assertType(post, 'object', postPath);
    
    if (typeof post !== 'object') return;
    
    assertType(post.id, 'string', `${postPath}.id`);
    assertType(post.turn, 'number', `${postPath}.turn`);
    assertType(post.author, 'string', `${postPath}.author`);
    assertType(post.handle, 'string', `${postPath}.handle`);
    if (post.avatar !== undefined) {
      assertType(post.avatar, 'string', `${postPath}.avatar`);
    }
    assertType(post.content, 'string', `${postPath}.content`);
    assertType(post.likes, 'number', `${postPath}.likes`);
    assertType(post.retweets, 'number', `${postPath}.retweets`);
    assertType(post.timestamp, 'string', `${postPath}.timestamp`);
    assertArray(post.hashtags, `${postPath}.hashtags`);
    
    // Non-negative numbers
    if (typeof post.likes === 'number' && post.likes < 0) {
      errors.push(`${postPath}.likes: Cannot be negative`);
    }
    if (typeof post.retweets === 'number' && post.retweets < 0) {
      errors.push(`${postPath}.retweets: Cannot be negative`);
    }
    
    // ISO date validation
    if (post.timestamp && isNaN(Date.parse(post.timestamp))) {
      errors.push(`${postPath}.timestamp: Invalid ISO date format`);
    }
  });
}

// Main validation function
function validateContext(filePath: string): void {
  console.log('🔍 Validating context.json...\n');
  
  let data: any;
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    data = JSON.parse(fileContent);
    console.log('✅ File loaded and parsed successfully\n');
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
  
  // Validate each section
  console.log('📋 Running validations...\n');
  
  if (data.game) {
    validateGameMetadata(data.game);
  } else {
    errors.push('Missing required field: game');
  }
  
  if (data.parties) {
    validateParties(data.parties);
  } else {
    errors.push('Missing required field: parties');
  }
  
  if (data.metrics) {
    validateMetrics(data.metrics);
  } else {
    errors.push('Missing required field: metrics');
  }
  
  if (data.turnCalendar) {
    validateTurnCalendar(data.turnCalendar);
  } else {
    errors.push('Missing required field: turnCalendar');
  }
  
  if (data.decisions) {
    validateDecisions(data.decisions);
  } else {
    errors.push('Missing required field: decisions');
  }
  
  if (data.newspapers) {
    validateNewspapers(data.newspapers);
  } else {
    errors.push('Missing required field: newspapers');
  }
  
  if (data.socialMedia) {
    validateSocialMedia(data.socialMedia);
  } else {
    errors.push('Missing required field: socialMedia');
  }
  
  // Report results
  console.log('═══════════════════════════════════════════════════\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Validation passed! No errors or warnings.\n');
  } else {
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} error(s):\n`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  Found ${warnings.length} warning(s):\n`);
      warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
      });
      console.log('');
    }
  }
  
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`Summary: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Run validation
const contextPath = resolve(__dirname, '../public/context.json');
validateContext(contextPath);
