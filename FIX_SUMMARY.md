# 404 Error Fix Summary

## Problem
The dashboard was experiencing 404 errors when trying to load `context.json` due to:
1. A duplicate `@` directory in the dashboard root conflicting with Vite's path alias
2. Incorrect fetch path in `useGameState.ts` that didn't account for GitHub Pages base path

## Changes Made

### 1. Removed Duplicate @ Directory
- **Issue**: There was a physical `@` directory at `dashboard/@` that conflicted with Vite's `@` alias (which maps to `./src`)
- **Fix**: Removed the duplicate `dashboard/@` directory
- **Impact**: Path resolution now works correctly

### 2. Fixed context.json Fetch Path
- **File**: `dashboard/src/hooks/useGameState.ts`
- **Before**: `fetch('/context.json')` - absolute path that ignored base path
- **After**: `fetch('context.json')` - relative path that respects Vite's base configuration
- **Impact**: Now correctly fetches from `/game13.11/context.json` on GitHub Pages

### 3. Added context.json to Public Directory
- Copied `context.json` to `dashboard/public/context.json`
- This ensures it's included in the build output
- File appears in `dist/context.json` after build

## Verification
- ✅ Build succeeds without errors
- ✅ `context.json` is present in `dist/` directory
- ✅ Path resolution works correctly with base path `/game13.11/`

## Next Steps
1. Test locally: `npm run dev` and verify data loads
2. Commit and push changes to trigger GitHub Actions deployment
3. Verify live site at `https://kaszmaryk.github.io/game13.11/`

## Files Modified
- `dashboard/src/hooks/useGameState.ts` - Fixed fetch URL
- `dashboard/public/context.json` - Added (copy from repo root)
- Removed: `dashboard/@/` directory

## Technical Details
The issue stemmed from how Vite handles base paths:
- With `base: "/game13.11/"` in vite.config.ts
- Absolute paths like `/context.json` resolve to `http://domain/context.json`
- Relative paths like `context.json` resolve to `http://domain/game13.11/context.json`
- GitHub Pages serves from the subdirectory, so relative paths are required
