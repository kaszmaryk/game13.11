# Game Engine - NHS Doctors Strike Simulation

## Overview

This folder contains the core game data and configuration files for the "Врачи против правительства: Англия, май 2026" (Doctors vs Government: England, May 2026) simulation game.

## Game Concept

A business simulation game about a strike, offer, and referendum involving NHS resident doctors in England, starting on May 27, 2026. Players represent different stakeholder organs and negotiate around pay restoration, training places, and exam fees.

## Files

### `game_config.json`
Main game configuration containing:
- Game metadata (title, dates, turns)
- Playable organs with goals and red lines
- Non-playable agents (DDRB, BMA members, media)
- Key numbers and reference data
- Glossary of terms

### `scenarios/` (future)
Pre-built scenario files for different starting conditions.

### `rules/` (future)
Detailed game rules, mechanics documentation, and calculation formulas.

## Game Structure

### Timeline
- **Total Turns**: 5 rounds × 8 days each
- **Start Date**: May 27, 2026
- **End Date**: July 5, 2026
- **Strike Window**: June 15-19, 2026 (4 days)
- **Mandate Expiry**: August 2026

### Playable Organs (6)
1. **RDC** - Resident Doctors Committee (strike committee)
2. **BMA Council** - Union leadership council
3. **DHSC** - Department of Health + NHS Employers
4. **HMT** - HM Treasury + Downing Street
5. **Providers** - NHS hospital trusts
6. **AoMRC** - Academy of Medical Royal Colleges

### Key Metrics
- `strikeDaysScheduled` - Days of strike planned
- `averagePayIncrease` - Average pay increase in offer (%)
- `trainingPlacesOffered` - New training places offered
- `examFeesCompensated` - Exam fees compensation (boolean)
- `payRestorationGap` - Gap from 2008 pay levels (%)
- `baseUnity` - BMA member unity (%)
- `publicSupport` - Public support for strike (%)
- `governmentStability` - Government stability (0-100)
- `waitingListImpact` - Cancelled appointments (thousands)
- `monthsToMandateExpiry` - Months until mandate expires
- `referendumProjection` - Projected referendum result (%)
- `reballotRisk` - Risk of needing re-ballot (0-100)

### Victory Conditions
- **≥ 70%** of organ goal weights completed = Victory
- **40-69%** = Partial success
- **< 40%** = Defeat (even if deal is accepted)

## Data Flow

```
engine/game_config.json
    ↓ (provides structure)
dashboard/public/context.json
    ↓ (runtime game state)
dashboard/src/ components
    ↓ (displays to user)
Web Browser
```

## Integration with Dashboard

The dashboard reads from `../dashboard/public/context.json`, which should follow the structure defined in this engine's configuration. The context.json file contains:
- Current game state (turn, date, metrics)
- Timeline of events
- Decision history
- Generated media content (newspapers, social media)

## Key Dates Reference

| Date | Event |
|------|-------|
| 2023-2024 | 11 rounds of junior doctor strikes |
| Sep 2024 | Deal reached, renamed to "resident doctors" |
| May 2025 | Consultant dispute begins (parallel) |
| Dec 2025 - Feb 2026 | Re-ballot: 93% yes, 52.5% turnout |
| Mar 25, 2026 | DDRB recommends 3.5% |
| Mar 2026 | March offer presented and rejected |
| May 14, 2026 | James Murray becomes Health Secretary |
| **May 27, 2026** | **GAME START** |
| Jun 15-19, 2026 | Scheduled strike (4 days) |
| Aug 2026 | Mandate expires (needs re-ballot) |

## Important Notes

### Starting Conditions (May 27, 2026)
- Strike announced: June 15-19 (4 days)
- March offer rejected: avg 4.9%, FY1 +6.2%, FY2 +7.1%
- Accelerated 1,000 training places already lost ("burnt")
- New minister Murray (ex-Treasury) refuses to increase offer
- Real pay ~20% below 2008 levels
- Mandate valid until August 2026

### Legal Strike Requirements
- Postal ballot: ≥ 50% turnout required
- Important public services: ≥ 40% of all eligible members must vote "yes"
- 14 days notice before strike
- Mandate valid for 6 months (extendable to 9)
- Referendum requires simple majority of those voting

### Three "Locks" in Any Deal
1. **Strike Lock** - mandate, notice, calendar, cost per day
2. **Ratification Lock** - member referendum, simple majority
3. **Fiscal Anchor** - DDRB 3.5% + Treasury limit

## Development

When updating game data:
1. Modify `game_config.json` for structural changes
2. Update `dashboard/public/context.json` for runtime state
3. Ensure TypeScript types in `dashboard/src/types/game.ts` match
4. Test dashboard rendering with new data

## Sources

All factual information based on sources up to May 27, 2026:
- BMA announcements
- DHSC blog posts
- gov.uk publications
- BMJ articles
- News media coverage

Game rules, metrics, and timer are design elements created by the game master.
