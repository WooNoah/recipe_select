# Chinese Category Values Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace English metadata group values with Chinese values across menu data, configuration, tests, and docs so future maintenance can be done in one language.

**Architecture:** Update `recipe_menu.md` metadata values and `src/menuConfig.mjs` keys to Chinese, then keep the existing draw logic intact by reading the new Chinese keys directly. Refresh tests and documentation so examples and group references stay consistent.

**Tech Stack:** Static HTML, browser ES modules, Markdown parsing with JavaScript string handling, Node built-in test runner

---

### Task 1: Write a failing test for Chinese metadata values

**Files:**
- Modify: `tests/menuLogic.test.mjs`

**Step 1: Write the failing test**

```js
test('drawMenuSections works with Chinese protein and veg group values', () => {
  // Expect metadata to keep Chinese values and weighted soup pairing to still work.
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/menuLogic.test.mjs`
Expected: FAIL because current config and fixtures still use English metadata keys.

**Step 3: Write minimal implementation**

```js
// Switch fixture metadata and config lookups to Chinese values.
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

### Task 2: Convert real menu data and config keys to Chinese

**Files:**
- Modify: `recipe_menu.md`
- Modify: `src/menuConfig.mjs`

**Step 1: Update menu metadata**

```md
1. 红烧肉 | protein=猪肉
1. 油焖笋 | veg=根茎类
```

**Step 2: Update config keys**

```js
export const proteinPairWeights = {
  猪肉: { 牛肉: 0.95 },
};
```

**Step 3: Run tests**

Run: `node --test tests/menuLogic.test.mjs`
Expected: PASS

### Task 3: Refresh documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/ingredient-groups.md`

**Step 1: Update examples and group dictionaries**

```md
| `猪肉` | 猪肉主导 |
| `根茎类` | 根茎类素菜 |
```

**Step 2: Verify**

Run: `node --test`
Expected: PASS
