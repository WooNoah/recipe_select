# Dynamic Menu Sections Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make menu categories data-driven so any section added to `recipe_menu.md` can be parsed, drawn, and shown in the UI automatically, while preserving weighted pairing between classic dishes and soups.

**Architecture:** Replace the current fixed two-section parsing with generic section parsing, then draw one dish per available section in order. Keep weighted soup selection only when a classic dish is present, and render result cards from the returned draw list instead of fixed HTML placeholders.

**Tech Stack:** Static HTML, browser ES modules, Markdown parsing with JavaScript regex/string handling, Node built-in test runner

---

### Task 1: Add failing tests for dynamic section parsing and drawing

**Files:**
- Modify: `tests/menuLogic.test.mjs`
- Modify: `src/menuLogic.mjs`

**Step 1: Write the failing test**

```js
test('parseRecipeMarkdown preserves optional sections when present', () => {
  // Expect classic, soup, vegetarian, and cold dish sections to be parsed from markdown.
});

test('drawMenuSections draws one dish per available section in markdown order', () => {
  // Expect extra sections to produce extra result cards automatically.
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL because parsing and drawing are still hard-coded to two sections.

**Step 3: Write minimal implementation**

```js
// Generalize parsing and add section-based drawing helpers.
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/menuLogic.test.mjs src/menuLogic.mjs
git commit -m "feat: support dynamic menu sections"
```

### Task 2: Extend config for future vegetarian weighting and preserve soup pairing rules

**Files:**
- Modify: `src/menuConfig.mjs`
- Modify: `tests/menuLogic.test.mjs`

**Step 1: Write the failing test**

```js
test('drawMenuSections still blocks forbidden fish and shellfish soup pairings', () => {
  // Expect protein pair weights to continue applying to soup draws.
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL until section-based drawing still consults protein weights.

**Step 3: Write minimal implementation**

```js
export const vegetablePairWeights = { /* reserved for future */ };
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add src/menuConfig.mjs tests/menuLogic.test.mjs
git commit -m "feat: reserve vegetarian weight config"
```

### Task 3: Replace fixed result cards with data-driven rendering

**Files:**
- Modify: `index.html`
- Modify: `src/app.mjs`
- Modify: `styles.css`

**Step 1: Write the failing test**

```js
// If extracted into pure helpers, verify result descriptors render only available sections.
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL or be blocked until render logic becomes data-driven.

**Step 3: Write minimal implementation**

```js
// Render cards from a template/container instead of querying two fixed cards.
```

**Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS

**Step 5: Commit**

```bash
git add index.html src/app.mjs styles.css
git commit -m "feat: render menu results from available sections"
```

### Task 4: Verify the full behavior

**Files:**
- Test: `tests/menuLogic.test.mjs`

**Step 1: Run the full test suite**

Run: `node --test`
Expected: PASS with all tests green.

**Step 2: Run a manual draw sanity check**

Run: `node --input-type=module`
Expected: A menu with extra sections returns extra drawn results in source order, and fish/shellfish soup pairings remain blocked.

**Step 3: Review changed files**

Run: `git diff -- src/menuLogic.mjs src/menuConfig.mjs src/app.mjs index.html styles.css recipe_menu.md tests/menuLogic.test.mjs`
Expected: Diff matches the approved design.

**Step 4: Commit**

```bash
git add .
git commit -m "docs: add dynamic menu section design and plan"
```
