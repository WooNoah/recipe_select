# UniApp Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the existing recipe selector project to UniApp so that one codebase can be compiled to both H5 (for GitHub Pages) and WeChat Mini Program, while keeping GitHub Pages deployment working.

**Architecture:** Create a new UniApp project in a sibling directory `../Recipe Select Uni App/`. All business logic (menu parsing, weighted drawing, seasonal rules) is reused from the original project with minimal changes. UI is rewritten using Vue 3 + UniApp syntax. Build output for H5 is deployable to GitHub Pages.

**Tech Stack:**
- UniApp CLI (Vite based)
- Vue 3 Composition API
- WeChat Mini Program compilation target
- Original pure JS business logic fully reused

---

### Task 1: Create UniApp project with Vite

**Files:**
- Create: `../Recipe Select Uni App/` (sibling directory to current project)
- Create: UniApp base project structure via CLI

**Step 1: Run the UniApp creation command**

```bash
cd /Users/noah/Desktop/AI_projects
npx degit dcloudio/uniapp-vite-vue3 "Recipe Select Uni App"
```

Expected: Creates the base UniApp project structure.

**Step 2: Install dependencies**

```bash
cd "/Users/noah/Desktop/AI_projects/Recipe Select Uni App"
npm install
```

Expected: All dependencies installed successfully.

**Step 3: Commit the base project**

```bash
cd "/Users/noah/Desktop/AI_projects/Recipe Select Uni App"
git init
git add .
git commit -m "chore: initialize UniApp base project"
```

---

### Task 2: Copy and adapt core business logic

**Files:**
- Create: `src/utils/menuLogic.js` (from original `recipe_select/src/menuLogic.mjs`)
- Create: `src/utils/menuConfig.js` (from original `recipe_select/src/menuConfig.mjs`)

**Step 1: Copy files from original project**

Copy `menuLogic.mjs` → `src/utils/menuLogic.js`, change module exports from ES6 `export function` to CommonJS `module.exports =` for UniApp compatibility (or keep ES6, UniApp supports it).

**Step 2: Verify no changes needed to core logic**

All the core logic (markdown parsing, weighted drawing, 5-click cooldown, seasonal rules) is pure JavaScript with zero browser dependencies → works as-is in UniApp.

**Step 3: Commit**

```bash
git add src/utils/menuLogic.js src/utils/menuConfig.js
git commit -m "feat: copy core business logic from original project"
```

---

### Task 3: Add recipe data conversion script

**Files:**
- Create: `scripts/convert-menu.js`
- Create: `src/data/recipeMenu.json` (generated)

**Step 1: Write conversion script that reads `recipe_menu.md` and outputs JSON**

```javascript
// scripts/convert-menu.js
const fs = require('fs');
const path = require('path');
const { parseRecipeMarkdown } = require('../src/utils/menuLogic');

const mdPath = path.join(__dirname, '../../recipe_select/recipe_menu.md');
const outputPath = path.join(__dirname, '../src/data/recipeMenu.json');

const markdown = fs.readFileSync(mdPath, 'utf-8');
const menu = parseRecipeMarkdown(markdown);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(menu, null, 2));

console.log('Converted recipe_menu.md to recipeMenu.json successfully');
console.log(`Sections: ${menu.sections.length}`);
```

**Step 2: Run conversion script**

```bash
cd "/Users/noah/Desktop/AI_projects/Recipe Select Uni App"
node scripts/convert-menu.js
```

Expected: Outputs `src/data/recipeMenu.json` with parsed menu data.

**Step 3: Commit**

```bash
git add scripts/convert-menu.js src/data/recipeMenu.json
git commit -m "feat: add menu conversion script and recipe data"
```

---

### Task 4: Create index page UI and logic

**Files:**
- Modify: `src/pages/index/index.vue`

**Step 1: Write the template**

Convert original `index.html` structure to Vue template for UniApp:
- Status text area
- Error message area
- Draw button
- Result grid with dish cards
- Uses `wx:for` or v-for for list rendering

**Step 2: Write the script**

- Import menu data from `src/data/recipeMenu.json`
- Import `buildSectionCandidates`, `drawMenuSections` from utils
- Implement `drawMenu()` method
- Implements same logic as original `app.mjs` but adapted to UniApp data binding

**Step 3: Convert styles from `styles.css` to scoped CSS**

Most CSS rules work directly. Convert:
- `:root` variables → to component data or SCSS variables
- Flexbox grid layouts work unchanged
- Animations work unchanged

**Step 4: Test H5 development server**

```bash
npm run dev:h5
```

Expected: Dev server starts at `http://localhost:5173/`, page loads correctly, draw button works.

**Step 5: Commit**

```bash
git add src/pages/index/index.vue
git commit -m "feat: implement index page with full functionality"
```

---

### Task 5: Configure GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Write GitHub Actions workflow that builds H5 and deploys to GitHub Pages**

```yaml
name: Deploy H5 to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Copy latest recipe from original repo
        run: |
          git clone https://github.com/${{ github.repository_owner }}/recipe_select.git temp-recipe
          cp temp-recipe/recipe_menu.md .
          rm -rf temp-recipe
      - name: Install dependencies
        run: npm ci
      - name: Convert menu data
        run: node scripts/convert-menu.js
      - name: Build H5
        run: npm run build:h5
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: dist/build/h5
```

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: add GitHub Pages deployment workflow"
```

---

### Task 6: Configure WeChat Mini Program

**Files:**
- Modify: `manifest.json`
- Verify: `project.config.json`

**Step 1: Configure app name and appid in `manifest.json`**

User needs to fill in their own WeChat Mini Program appId.

**Step 2: Build WeChat Mini Program output**

```bash
npm run build:mp-weixin
```

Expected: Output to `dist/build/mp-weixin/`, which can be opened in WeChat Developer Tools.

**Step 3: Add build output to .gitignore**

Ensure `dist/` is ignored.

**Step 4: Commit configuration**

```bash
git add manifest.json project.config.json .gitignore
git commit -m "chore: configure WeChat Mini Program build"
```

---

### Task 7: Verify full build and test

**Files:** None, just run builds

**Step 1: Clean convert and build H5**

```bash
rm -f src/data/recipeMenu.json
node scripts/convert-menu.js
npm run build:h5
```

Expected: Build succeeds, output in `dist/build/h5`.

**Step 2: Build mp-weixin**

```bash
npm run build:mp-weixin
```

Expected: Build succeeds, output in `dist/build/mp-weixin`.

**Step 3: Final commit any cleanups**

```bash
git add .
git status
# If any changes, commit
```

---

## Post-Migration Steps for User

After the project is built:

1. For **GitHub Pages**: Enable GitHub Pages in repo settings with source from `gh-pages` branch
2. For **WeChat Mini Program**: Open `dist/build/mp-weixin` in WeChat Developer Tools, upload for review

## Syncing Recipe Updates from Original

When you update `recipe_menu.md` in the original repo:
1. Run `node scripts/convert-menu.js`
2. Rebuild and redeploy → both H5 and Mini Program get updated

