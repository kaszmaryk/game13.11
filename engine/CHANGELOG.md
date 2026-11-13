# Changelog

All notable changes to the NHS Doctors Strike Game data and engine.

## [1.0.0] - 2026-05-27 (Game Start)

### Added

#### Engine Folder Structure
- Created `/game13.11/engine/` directory for game configuration and documentation
- Established clear separation between engine config and dashboard runtime data

#### Core Configuration Files
- **`engine/game_config.json`** - Complete game configuration including:
  - 6 playable organs with detailed goals, red lines, and weights
  - 3 non-playable AI-controlled agents (DDRB, BMA members, media)
  - Key numbers reference (81,000 doctors, salaries, dates)
  - Glossary of 13 essential terms
  - Game metadata and structure

- **`dashboard/public/context.json`** - Runtime game state initialized with:
  - Game metadata (title, subtitle, dates, turns)
  - 3 sample organs (RDC, DHSC, HMT) for initial testing
  - Starting metrics (strike days, pay increase, unity, etc.)
  - Turn calendar with 5 rounds and phases
  - Sample decisions from May 27 start
  - Generated newspaper articles (The Guardian, BBC News)
  - Social media posts (Twitter/X style reactions)

#### Documentation
- **`engine/README.md`** - Technical documentation covering:
  - Game concept and overview
  - File structure and purpose
  - Data flow from engine to dashboard
  - Integration notes for developers
  - Key dates reference table
  - Development guidelines

- **`engine/GAME_DATA_SUMMARY.md`** - Comprehensive reference guide including:
  - Quick reference section
  - Complete context and background
  - Detailed organ descriptions (all 6 playable + 3 AI)
  - Key numbers reference table
  - Timeline phases breakdown
  - Victory conditions explanation
  - Legal strike requirements
  - Three "locks" framework
  - Hidden metrics description
  - Full glossary (25 terms)
  - Sources and citations

- **`engine/QUICK_START.md`** - User-friendly getting started guide with:
  - File structure overview
  - Dashboard setup instructions
  - Game objective summary
  - Organ selection guide
  - Key metrics explanation
  - Critical dates timeline
  - Game flow description
  - Strategy tips for each organ type
  - Common mistakes to avoid
  - Sample first moves for RDC and DHSC
  - State update instructions
  - Help references

### Changed

#### Updated Existing Files
- **`dashboard/public/context.json`** - Replaced Sweden political simulation data with NHS doctors strike data:
  - Changed from Swedish coalition negotiations to UK healthcare dispute
  - Updated all metrics to NHS-specific values
  - Replaced political parties with stakeholder organs
  - Updated timeline from Sep-Nov 2026 to May-Jul 2026
  - Added healthcare-specific events and decisions
  - Included medical/professional social media content

### Game Data Highlights

#### Starting Conditions (May 27, 2026)
- Strike announced: June 15-19 (4 days)
- March offer rejected: avg 4.9%, FY1 +6.2%, FY2 +7.1%
- Accelerated 1,000 training places already lost ("burnt")
- New Health Secretary James Murray (ex-Treasury) refuses to increase offer
- Real pay ~20% below 2008 levels
- Mandate valid until August 2026

#### Six Playable Organs
1. **RDC** - Resident Doctors Committee (strike committee)
2. **BMA Council** - Union leadership council
3. **DHSC** - Department of Health + NHS Employers
4. **HMT** - HM Treasury + Downing Street
5. **Providers** - NHS hospital trusts
6. **AoMRC** - Academy of Medical Royal Colleges

#### Key Metrics Tracked
- Strike days scheduled
- Average pay increase (%)
- Training places offered
- Exam fees compensated
- Pay restoration gap (%)
- Base unity (%)
- Public support (%)
- Government stability (0-100)
- Waiting list impact (thousands)
- Months to mandate expiry
- Referendum projection (%)
- Re-ballot risk (0-100)

### Technical Notes

#### Data Structure Compatibility
- Maintained compatibility with existing dashboard TypeScript types
- Used same JSON structure pattern as previous game
- Ensured all required fields present for dashboard rendering

#### Language Support
- All text in Russian (as per player handout)
- Cyrillic font support maintained
- Date formatting ready for Russian locale

#### File Sizes
- `engine/game_config.json`: ~10.5 KB
- `dashboard/public/context.json`: ~6.9 KB
- `engine/GAME_DATA_SUMMARY.md`: ~11.7 KB
- `engine/README.md`: ~4.7 KB
- `engine/QUICK_START.md`: ~8.2 KB

### Sources
All factual information based on sources up to May 27, 2026:
- BMA announcements and press releases
- DHSC blog posts
- gov.uk official publications
- BMJ (British Medical Journal) articles
- News media coverage (The Guardian, BBC, etc.)

Game rules, metrics, weights, and timer are design elements created by the game master based on the player handout document.

---

## Future Updates

### Planned Features
- [ ] Scenario files for different starting conditions
- [ ] Detailed rules documentation with calculation formulas
- [ ] Complete organ relationship matrix
- [ ] Historical decision examples
- [ ] Advanced strategy guides per organ
- [ ] Tutorial scenarios for new players

### Dashboard Enhancements
- [ ] NewspaperSection component implementation
- [ ] SocialMediaFeed component implementation
- [ ] CoalitionStatus component (optional)
- [ ] Filtering and sorting capabilities
- [ ] Sentiment badges and engagement metrics
- [ ] Dark mode toggle

---

## Version History

- **1.0.0** (2026-05-27) - Initial release with NHS Doctors Strike game data
  - Based on player handout "раздатка_игрокам.md"
  - Complete engine configuration
  - Dashboard context updated
  - Comprehensive documentation

---

*For questions or issues with the game data, refer to:*
- *Technical docs: `engine/README.md`*
- *Quick start: `engine/QUICK_START.md`*
- *Complete reference: `engine/GAME_DATA_SUMMARY.md`*
