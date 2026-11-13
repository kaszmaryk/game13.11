# Quick Start Guide - NHS Doctors Strike Game

## 🎮 Getting Started

This game simulates the May 2026 NHS resident doctors dispute with the UK government. You'll play as one of six stakeholder organs negotiating around pay, training places, and working conditions.

---

## 📁 File Structure

```
game13.11/
├── engine/                          # Game configuration & data
│   ├── game_config.json            # Core game rules & organ definitions
│   ├── README.md                   # Engine documentation
│   ├── GAME_DATA_SUMMARY.md        # Complete game reference
│   └── QUICK_START.md              # This file
│
└── dashboard/                       # Web interface
    └── public/
        └── context.json            # Runtime game state (updated each turn)
```

---

## 🚀 Running the Dashboard

### Prerequisites
- Node.js installed
- Navigate to dashboard folder

### Commands
```bash
cd /Users/aleksejkudrickij/Desktop/игры/game13.11/dashboard

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dashboard will be available at: `http://localhost:5175/game13.11/`

---

## 🎯 Game Objective

**Goal**: Achieve your organ's objectives through negotiation over 5 rounds (May 27 - July 5, 2026).

**Victory**: Complete ≥70% of your organ's goal weights.

**Failure**: <40% completion = defeat, even if a deal is reached.

---

## 👥 Choose Your Organ

### For Union Side:
1. **RDC** - Lead negotiations, control strike calendar
2. **BMA Council** - Maintain union unity, manage strike fund

### For Government Side:
3. **DHSC** - Negotiate deal, end strikes
4. **HMT** - Control budget, prevent precedent

### For Operational Side:
5. **Providers** - Keep hospitals running, minimize damage
6. **AoMRC** - Protect training quality, manage exams

---

## 📊 Key Metrics to Watch

| Metric | What It Means | Target |
|--------|---------------|--------|
| `strikeDaysScheduled` | Days of strike planned | Lower = less disruption |
| `averagePayIncrease` | Average pay offer (%) | Higher = better for doctors |
| `trainingPlacesOffered` | New training places | More = better for ST grades |
| `baseUnity` | BMA member unity (%) | Higher = easier referendum |
| `publicSupport` | Public backing (%) | Higher = political pressure on gov |
| `governmentStability` | Gov stability (0-100) | Lower = more leverage for union |
| `referendumProjection` | Projected yes vote (%) | Need >50% to pass |
| `reballotRisk` | Risk of re-vote (0-100) | Lower = more time pressure |

---

## ⏰ Critical Dates

- **May 27, 2026**: Game starts
- **June 15-19**: Scheduled strike (4 days)
- **July 5, 2026**: Game ends (must have deal by then)
- **August 2026**: Mandate expires (needs re-ballot)

---

## 🔄 Game Flow

### Each Round (8 days of game time):

1. **Review situation** - Check metrics, read media
2. **Discuss with team** - Decide strategy
3. **Make decision** - Submit action via dashboard
4. **See consequences** - Metrics update, new events
5. **Repeat** for 5 rounds

### Decision Format:
```
1. Organ & Round number
2. Who we're talking to (public/private)
3. What we offer (specific: %, places, fees, deadlines)
4. What we demand (minimum acceptable)
5. Public statement (1-2 sentences)
6. Special fields (strike calendar, fiscal limit, etc.)
```

---

## 💡 Strategy Tips

### For RDC (Union Negotiators):
- Balance grade interests (FY1/FY2 want money, ST want places, LED want protection)
- Use strike threat credibly but don't overplay
- Must sell deal to divided base in referendum
- Remember: accelerated 1,000 places already lost

### For DHSC (Government Negotiators):
- Can't exceed Treasury limit without approval
- DDRB 3.5% is anchor - hard to go below
- Offer structure changes (nodal points) not just cash
- Every day of strike increases waiting list crisis

### For HMT (Treasury):
- Hold the line - precedent matters more than this deal
- Consultants watching - don't give too much
- Political cost of breakdown vs fiscal cost of deal
- Use structural reforms to give value without breaking limit

### For Providers (Hospitals):
- Data is your weapon - show real costs of strikes
- Locum expenses mounting - use this pressure
- Patient safety is red line - don't compromise
- Need predictable schedule, not slogans

---

## ⚠️ Common Mistakes

1. **Ignoring grade split** - FY1/FY2, ST, and LED have different priorities
2. **Forgetting re-ballot clock** - August deadline creates pressure from round 4
3. **Overlooking hidden metrics** - Treasury hardness, consultant contagion, media heat
4. **Not coordinating internally** - You're a collective organ, must agree as team
5. **Missing timer** - 15 min discussion + 3 min decision format; timeout = status quo

---

## 📖 Reference Materials

- **Full rules**: See player handout (`раздатка_игрокам.md`)
- **Game summary**: `engine/GAME_DATA_SUMMARY.md`
- **Engine docs**: `engine/README.md`
- **Glossary**: 25 key terms in handout section 10
- **FAQ**: Section 11 of handout for common questions

---

## 🎲 Sample First Move

### If playing RDC (Round 1):
```
Organ: RDC, Round 1
Talking to: DHSC (private), Media (public)
Offer: "Cancel June 15-19 strike if you provide:
  - 5,000 training places over 3 years (not 4,000)
  - Concrete timeline for pay restoration (e.g., 5-year trajectory to 2008 levels)
  - Full exam fee compensation"
Demand: "Minimum 4,500 places with 1,500 in year 1, plus nodal point reform"
Statement: "We remain committed to patient care, but our members cannot accept 
  vague promises. We need concrete commitments on places and a credible path 
  to pay restoration."
Special: Strike calendar - confirm June 15-19, warn of July dates if no progress
```

### If playing DHSC (Round 1):
```
Organ: DHSC, Round 1
Talking to: RDC (private), HMT (internal)
Offer: "March offer stands (avg 4.9%, FY1 +6.2%, FY2 +7.1%) IF you cancel strike.
  4,000-4,500 places over 3 years remains. Nodal point reform available.
  Exam fees compensated."
Demand: "Cancel June 15-19 strike immediately as precondition for any discussion"
Statement: "The offer on the table is fair and addresses both pay and jobs concerns.
  We urge the RDC to call off industrial action so we can implement these improvements."
Special: Fiscal limit - cannot exceed Treasury envelope without HMT approval
```

---

## 🔧 Updating Game State

After each round, update `dashboard/public/context.json`:

1. Increment `currentTurn`
2. Update `currentPeriod` dates
3. Add new decisions to `decisions` array
4. Update `metrics` based on outcomes
5. Add newspaper articles and social media posts
6. Mark turn calendar status

Example structure maintained - see existing context.json for format.

---

## 🆘 Need Help?

- **Game rules**: Check handout sections 7-9
- **Organ goals**: See section 8 cards
- **Key numbers**: Section 9 quick reference
- **Terms**: Section 10 glossary
- **Questions**: Section 11 FAQ

---

## 🎯 Winning the Game

Remember: Victory isn't just "making a deal." It's achieving YOUR ORGAN'S specific goals.

- A deal that passes referendum but destroys union unity = partial success for BMA Council
- Ending strikes but breaking Treasury limit = failure for HMT
- Getting places but compromising quality = failure for AoMRC

**Play your organ's interests, not what's "best for everyone."**

Good luck! The future of NHS resident doctors is in your hands. 🏥⚕️
