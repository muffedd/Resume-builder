# Progress To Be Done

Last checked: 2026-03-08

## Verified as done

- PDF parsing fix is implemented in `server/services/resumeFileParsing.js`:
  - uses `PDFParse` from `pdf-parse`
  - uses `parser.getText()`
  - calls `parser.destroy()`
- `POST /api/resume-check` payload handling is fixed in `server/app.js`:
  - `parser` is set as `parser ?? undefined` before validation
- Role Guide cleanup in `src/App.jsx` remains done:
  - no `Role Guide` / `Role Guides` UI strings found
  - no `RoleGuidePage` block found
- `adminOverview` fallback issue is already fixed:
  - `const overview = adminData?.overview ?? adminStats;`

## Remaining work

1. Fix lint error in `src/App.jsx`
   - Current `npx eslint src/App.jsx` output:
     - `toSentenceCase` is defined but never used at line 71
   - Action:
     - remove `toSentenceCase` if unused, or use it where needed.

## Notes

- Older handoff lint issues (`useRef`, `trendingSkills`, `buildFallbackGuideFromRole`, missing `adminOverview`, etc.) are no longer present in current `src/App.jsx`.
