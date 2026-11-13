# Context.json Validation Report

**Date**: November 12, 2026  
**File**: `dashboard/public/context.json`  
**Status**: ✅ **VALID** (with warnings)

## Validation Results

### ✅ Passed Checks

- [x] JSON parsing successful
- [x] All required sections present:
  - `game` metadata
  - `parties` array
  - `metrics` object
  - `turnCalendar` array
  - `decisions` array
  - `newspapers` array
  - `socialMedia` array

- [x] **Game Metadata**: All fields valid
  - Title: "Политическая симуляция Швеция 2026"
  - Current Turn: 2 / 5
  - Status: "active" ✓
  - Date format: Valid ISO dates

- [x] **Party Structure**: All party objects valid
  - Required fields present (id, name, leader, mandates, color, isPlayerParty)
  - Types correct for all fields
  - Color format: Valid hex colors (#RRGGBB)
  - Boolean types correct

- [x] **Metrics**: All metrics present and valid
  - coalitionSeats: 176 (range: 0-349) ✓
  - votesAgainst: 173 (range: 0-349) ✓
  - ministerPosts: 8 (range: 0-24) ✓
  - policyDemandsMet: 65 (range: 0-100) ✓
  - publicSupport: 58 (range: 0-100) ✓
  - extravalRisk: 10 (range: 0-100) ✓

- [x] **Turn Calendar**: Valid structure
  - 3 turns defined
  - Date ranges valid (start ≤ end)
  - Status values valid ("completed", "active", "upcoming")
  - Key events arrays present

- [x] **Decisions**: Valid structure
  - All required fields present
  - Types correct
  - Turn numbers valid

- [x] **Newspapers**: Valid structure
  - Sentiment values valid ("negative", "positive")
  - ISO date formats valid
  - All required fields present

- [x] **Social Media**: Valid structure
  - Engagement metrics non-negative
  - Hashtags arrays present
  - ISO timestamps valid
  - All required fields present

### ⚠️ Warnings

#### Warning 1: Incomplete Party Representation

```
parties: Total mandates sum to 218, expected 349 (Swedish Riksdag)
```

**Current Parties in context.json:**
- S (Социал-демократы): 99 mandates
- M (Умеренные): 68 mandates
- C (Партия центра): 24 mandates
- V (Левая партия): 27 mandates
- **Total: 218 mandates**

**Missing Parties (131 mandates needed):**
Based on the engine configuration, the following parties should be added:
- SD (Шведские демократы): ~62 mandates
- MP (Партия зелёных): ~22 mandates
- KD (Христианские демократы): ~22 mandates
- L (Либералы): ~19 mandates
- **Expected additional: ~125 mandates**

**Impact**: 
- Dashboard will show incomplete party list
- Coalition arithmetic may not add up correctly
- Game simulation won't match real Swedish parliament composition

**Recommendation**: Add remaining 4 parties from the engine to reach 349 total mandates.

### ℹ️ Informational Notes

1. **votesAgainst threshold**: Current value is 173, which is below the critical threshold of 175. This means the current candidate would pass validation.

2. **Single player party**: Only S (Социал-демократы) is marked as `isPlayerParty: true`, which is correct for single-player mode.

3. **Turn progression**: Turn 1 is "completed", Turn 2 is "active", Turn 3 is "upcoming" - logical progression.

## Schema Compliance

The context.json file **fully complies** with the TypeScript schema defined in `src/types/game.ts`:

```typescript
interface GameState {
  game: GameMetadata;           ✅ Valid
  parties: Party[];             ✅ Valid (structure)
  metrics: Metrics;             ✅ Valid
  turnCalendar: TurnCalendar[]; ✅ Valid
  decisions: Decision[];        ✅ Valid
  newspapers: NewspaperArticle[]; ✅ Valid
  socialMedia: SocialMediaPost[]; ✅ Valid
}
```

All type checks passed:
- String fields: ✅
- Number fields: ✅
- Boolean fields: ✅
- Array fields: ✅
- Enum values: ✅
- Optional fields: ✅

## File Location

✅ **Correct location**: `dashboard/public/context.json`
- Accessible at build time
- Will be served with the dashboard
- Path relative to dashboard root: `/context.json`

## Next Steps

### Recommended Actions

1. **Add Missing Parties** (High Priority)
   - Update context.json to include all 8 parties + Talman
   - Ensure total mandates = 349
   - Use data from `engine/agentPrompts/` for accurate party information

2. **Validate After Update** (Required)
   ```bash
   npm run validate
   ```

3. **Test Dashboard Display** (Recommended)
   ```bash
   npm run dev
   # Open http://localhost:5175/game13.11/
   # Verify all parties display correctly
   ```

4. **Automate Validation** (Optional)
   - Add validation to CI/CD pipeline
   - Run before each deployment
   - Block deployment if errors found

### Optional Enhancements

1. **Add More Sample Data**
   - More decisions across different turns
   - More newspaper articles with varied sentiment
   - More social media posts for richer feed

2. **Realistic Data Alignment**
   - Align keyEvents with actual Swedish political calendar
   - Use real party colors from official sources
   - Add more detailed decision descriptions

3. **Validation Improvements**
   - Add cross-field validation (e.g., turn numbers match between sections)
   - Check date ordering across turns
   - Validate party IDs match between decisions and parties array

## Validation Script Usage

```bash
# Run validation
npm run validate

# Manual execution
node scripts/validate-context.js
```

The script will:
- Parse and validate JSON structure
- Check all required fields
- Validate data types
- Check value ranges
- Report errors and warnings
- Exit with code 1 if errors found

## Conclusion

✅ **context.json is VALID** and ready for use with the dashboard.

The file structure perfectly matches the TypeScript schema. The only issue is incomplete party data (4 out of 8 parties present), which is a data completeness issue rather than a schema violation.

**Dashboard Compatibility**: ✅ FULLY COMPATIBLE  
**Schema Compliance**: ✅ 100% COMPLIANT  
**Data Completeness**: ⚠️ PARTIAL (missing 4 parties)  

---

**Validator Version**: 1.0.0  
**Schema Version**: Based on `src/types/game.ts`  
**Last Updated**: November 12, 2026
