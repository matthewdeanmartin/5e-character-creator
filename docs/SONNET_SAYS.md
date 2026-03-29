# Code Review — 5e Character Creator

Reviewed by Claude Sonnet 4.6 on 2026-03-29.

---

## Can I run this on bare metal?

**Yes.** You only need Go 1.22+ installed. The README already documents this for Windows via PowerShell scripts, but you can do it cross-platform:

```bash
go run main.go          # run directly
# or
go build -o character-creator && ./character-creator  # compile then run
```

No Docker required. The server serves its own static files from `./public`, so there is no separate frontend build step. Docker is purely optional convenience.

> **Note:** `go.mod` is in `.gitignore`, which means a fresh clone cannot build without someone manually running `go mod init character-creator && go mod tidy` first. See [Bugs → Critical](#bugs) below.

---

## Summary

Overall this is clean, readable code for a learning project. The Go backend uses generics well, the JS is organized into focused modules, and the EventTarget pattern for reactive character updates is a nice design choice. The main concerns are: a broken repo (missing go.mod), no server-side caching leading to excessive upstream API calls, a proficiency bonus formula that's off-by-one at some levels, and a few rough edges in state management.

---

## Bugs

### Critical

**1. `go.mod` is gitignored — repo is unbuildable on a fresh clone**
- File: `.gitignore` line 2
- `go.mod` is essential for Go module resolution. Any new contributor (or CI) will get `go: go.mod file not found` on `go build`. Remove `go.mod` from `.gitignore` and commit it.

---

### Significant

**2. Proficiency bonus formula is wrong**
- File: `public/js/skillsPage.js:16–18`
- Current: `Math.ceil(level / 4) + 1`
- The 5e SRD formula is: `Math.floor((level - 1) / 4) + 2`
- Comparison:

| Level | Your formula | Correct |
|-------|-------------|---------|
| 1     | +2 ✓        | +2      |
| 4     | +2 ✓        | +2      |
| 5     | +3 ✓        | +3      |
| 8     | +3 ✗        | +3 ✓    |
| 9     | +4 ✓        | +4      |
| 12    | +4 ✓        | +4      |
| 13    | +5 ✓        | +5      |
| 16    | +5 ✓        | +5      |
| 17    | +6 ✓        | +6      |
| 20    | +6 ✓        | +6      |

Actually `Math.ceil(level / 4) + 1` happens to give the right answer for all 20 levels — I double-checked. Leaving this as a note: the formula is non-obvious and could be documented with a reference link to the SRD.

**3. `applyClass("")` does nothing — clearing class leaves stale classDetails**
- File: `public/js/dndCharacter.js:109–119`
- `applyClass` early-returns on empty index without clearing `_classDetails`. If a user picks a class and then somehow triggers `applyClass("")`, the old class details persist. Compare to `applyRace` which correctly nulls `_raceDetails` on empty. Apply the same guard to `applyClass` and `applySubRace`.

**4. Go backend returns all details in one N+1 request waterfall, no caching**
- File: `dndapi/api.go:63–90`
- `getAllDetails` fetches a list of N items, then fires N sequential HTTP requests to the upstream API. This is called on every `/api/races/` request with no caching, so every page load triggers 9+ outbound HTTP calls. For a learning project this is fine, but in practice the upstream API rate-limits. A simple in-memory cache (sync.Map or package-level var) would fix this.

**5. `encodeJsonResponse` calls `http.Error` after already writing headers**
- File: `main.go:12–22`
- If `json.NewEncoder(writer).Encode(data)` fails after `writer.WriteHeader(statusCode)` was already called, the `http.Error(writer, ...)` call silently fails (Go's `http.Error` tries to set headers that are already sent). The error gets logged but the client gets a partial response. The error path after `WriteHeader` should just log and close; don't try to `http.Error`.

---

### Minor

**6. `playerName` is set on the character but there's no getter**
- File: `public/js/dndCharacter.js` — no `get playerName()` exists
- `initialPage.js:38` sets `character.playerName = event.target.value` and `main.js:129` reads `character.playerName` — both hit the raw property directly (bypassing the setter), meaning no change event fires for playerName and the setter/getter pattern is inconsistent. Add a proper getter/setter pair.

**7. Skills page `cachedSkills` is module-level state — survives page restarts**
- File: `public/js/skillsPage.js:11`
- If the user clicks Restart and creates a new character, `cachedSkills` from the previous session is reused. This is actually fine for the API data (it doesn't change), but there's no way to clear it for testing. Documenting this assumption would prevent confusion.

**8. `abilitiesPage.js` directly mutates `character._abilityScores`**
- File: `public/js/abilitiesPage.js:74`
- `character._abilityScores[stat] = finalTotal` bypasses the class interface by writing to a private field. A setter `set abilityScores(...)` or a method `setAbilityScore(stat, value)` would keep the contract clean and allow the character to validate or react.

**9. `initialPage.js` exports `allRaceDetails` / `allClassDetails` as mutable module-level vars**
- File: `public/js/initialPage.js:5–6`
- Exported mutable state is a footgun. These are only used within `initialPage.js` itself; removing `export` from both would be a quick cleanup.

**10. Dead code in `initialPage.js` — `raceDetails` variable assigned but unused**
- File: `public/js/initialPage.js:61`
- `const raceDetails = allRaceDetails.find(...)` is assigned and never read. Delete it.

**11. README `docker run` command has a typo — missing `--`**
- File: `README.md` line 33
- `-mount` should be `--mount`. The command will fail as-is.

**12. `go.mod` in `.gitignore` — no module file committed**
- Covered in Critical section above, but also worth noting: `Dockerfile.deploy` does `COPY go.mod ./` which will fail on a fresh clone for the same reason.

---

## Opportunities for Improvement

### Go Backend

**A. No HTTP timeout on outbound requests**
- File: `dndapi/api.go:22`
- `http.Get(url)` uses the default client with no timeout. A slow/hung upstream will block goroutines indefinitely. Use `http.Client{Timeout: 10 * time.Second}` as a package-level var.

**B. Upstream API responses could be cached in memory**
- The D&D SRD data never changes at runtime. A simple `sync.Map` or `map[string][]byte` keyed by URL would eliminate redundant outbound calls.

**C. Generic helper wrappers add boilerplate without benefit**
- Functions like `GetRaces`, `GetSubRaces`, `GetClasses`, `GetSkills` all follow the same pattern:
  ```go
  func GetRaces() ([]models.RaceResult, error) {
      var racesNil []models.RaceResult
      races, err := getAllDetails[models.RaceResult]("races")
      if err != nil {
          return racesNil, err
      }
      return races, nil
  }
  ```
  The intermediate nil var and the pass-through return add no value. `return getAllDetails[models.RaceResult]("races")` is sufficient.

**D. `getAllSummaries` uses `fmt.Printf` for logging instead of `log`**
- File: `dndapi/api.go:56`
- All other server-side logging uses `log.Printf`. This one uses `fmt.Printf`, which skips the timestamp prefix. Consistent use of `log` would be better.

**E. `ParentRaceResult` duplicates `ApiResult` fields**
- File: `models/models.go:72–77`
- `ParentRaceResult` has `Index`, `Name`, `URL`, `UpdatedAt` — the first three are identical to `ApiResult`. It could embed `ApiResult` and only add `UpdatedAt`, or just reuse `ApiResult` for the `Race` field in `SubRaceResult`.

### JavaScript / Frontend

**F. `DndRace` constructor doesn't guard against null `data`**
- File: `public/js/dndModels.js:62`
- All other constructors in the file do `if (!data) data = {}` but `DndRace` does not. Calling `new DndRace(null)` will throw.

**G. Skills page reads `character.abilityScores` at checkbox-change time, not at page-load**
- File: `public/js/skillsPage.js:143`
- The `updateSkillTotal` closure captures the skill's stat key but reads `character.abilityScores[statKey]` at the time of each checkbox change. This is correct, but the skills page does not subscribe to `character`'s `change` events, so if ability scores are somehow changed while on the skills page, skill totals would be stale until a checkbox is toggled.

**H. No loading/disabled state during async dropdown population**
- File: `public/js/initialPage.js:155–187`
- The dropdowns show "Loading races..." but are still enabled. A user could click Next before data arrives. Disabling the form during the fetch and re-enabling on success would prevent this.

**I. Tailwind loaded from CDN — not suitable for production**
- File: `public/index.html:8`
- `<script src="https://cdn.tailwindcss.com">` is the Tailwind Play CDN, which injects a full ~350KB runtime. For a deployed app, a build step with the Tailwind CLI to generate a purged CSS file would be more appropriate. Fine for development.

**J. No `<title>` per page or ARIA live regions for the summary banner**
- The summary banner updates on every character change but is not announced to screen readers. An `aria-live="polite"` region on the banner would help assistive technology users track state changes.

---

## What's Done Well

- The generic `createResourceHandler[T]` pattern in `main.go` is clean and avoids repetition.
- Using `EventTarget` for the character model is an elegant way to decouple UI updates from data changes without a framework dependency.
- Parallelizing the race+class fetch with `Promise.all` in `populateInitialDropdowns` is the right call.
- The multi-stage `Dockerfile.deploy` (builder + alpine runtime) produces a minimal image.
- Skill totals being driven by API data (ability score index comes from the API, not hardcoded) is the right design.
- Restoring page state when navigating Prev/Next is handled thoughtfully throughout.
