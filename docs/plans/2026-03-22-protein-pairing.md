# Protein Pairing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add protein-group pairing weights to the random menu draw so seafood-heavy pairings can be blocked while pork, beef, and chicken pairings remain more likely.

**Architecture:** Extend Markdown parsing so each dish includes a `proteinGroup`, move pairing rules into a dedicated config module with comments, and update the second-dish draw from uniform random selection to weighted random selection. Add Node built-in tests to cover parsing, seasonal filtering, and pairing constraints.

**Tech Stack:** Static HTML, browser ES modules, Markdown parsing with JavaScript regex/string handling, Node built-in test runner

---

### Task 1: Add failing tests for parsing and weighted pairing behavior

**Files:**
- Create: `tests/menuLogic.test.mjs`
- Modify: `src/menuLogic.mjs`

**Step 1: Write the failing test**

```js
test('parseRecipeMarkdown extracts protein groups from markdown lines', () => {
  // Expect parsed dishes to include proteinGroup metadata.
});

test('drawTwoDishes excludes fish and shellfish pairings with zero weight', () => {
  // Expect no result to include a forbidden pairing.
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL because menu items do not yet contain `proteinGroup` and weighted pairing logic does not exist.

**Step 3: Write minimal implementation**

```js
// Update parsing and draw logic only enough to satisfy the new tests.
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/menuLogic.test.mjs src/menuLogic.mjs src/menuConfig.mjs recipe_menu.md
git commit -m "feat: add weighted protein pairing rules"
```

### Task 2: Introduce config module with documented pair weights

**Files:**
- Create: `src/menuConfig.mjs`
- Modify: `src/menuLogic.mjs`

**Step 1: Write the failing test**

```js
test('drawTwoDishes uses config weights when selecting the second dish', () => {
  // Expect second-dish weighting to follow proteinPairWeights.
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL because no external config module exists.

**Step 3: Write minimal implementation**

```js
export const proteinPairWeights = { /* documented weight matrix */ };
export const defaultDishWeight = 1;
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add src/menuConfig.mjs src/menuLogic.mjs tests/menuLogic.test.mjs
git commit -m "feat: move protein pairing weights into config"
```

### Task 3: Update source Markdown and preserve existing seasonal/soup behavior

**Files:**
- Modify: `recipe_menu.md`
- Modify: `src/menuLogic.mjs`
- Test: `tests/menuLogic.test.mjs`

**Step 1: Write the failing test**

```js
test('buildCandidates keeps winter-only filtering with structured dishes', () => {
  // Expect winter dishes to remain seasonal after metadata parsing.
});

test('drawTwoDishes still prefers non-soup second dishes when first dish is soup', () => {
  // Expect soup avoidance to apply before weighted selection.
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL until parsing and candidate construction handle the richer dish objects correctly.

**Step 3: Write minimal implementation**

```js
// Update recipe_menu.md entries and keep candidate building compatible.
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add recipe_menu.md src/menuLogic.mjs tests/menuLogic.test.mjs
git commit -m "feat: preserve seasonal and soup rules with protein metadata"
```

### Task 4: Verify the full behavior

**Files:**
- Test: `tests/menuLogic.test.mjs`

**Step 1: Run the full test suite**

Run: `node --test`
Expected: PASS with all tests green.

**Step 2: Do a manual logic sanity check**

Run: `node --input-type=module`
Expected: Manual sampling shows fish/fish and fish/shellfish combinations do not appear.

**Step 3: Review changed files**

Run: `git diff -- src/menuLogic.mjs src/menuConfig.mjs recipe_menu.md tests/menuLogic.test.mjs docs/plans/2026-03-22-protein-pairing-design.md docs/plans/2026-03-22-protein-pairing.md`
Expected: Diff matches the approved design.

**Step 4: Commit**

```bash
git add .
git commit -m "docs: add protein pairing design and plan"
```
