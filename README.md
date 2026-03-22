# Recipe Menu Pages

A recipe menu picker built with uni-app, deployable to both WeChat Mini Program and GitHub Pages (H5).

The app reads `recipe_menu.md` at build time (converted to JSON), builds menu categories from Markdown sections, and randomly draws one dish per available category. `经典肉类` and `汤品` use configurable protein-pair weights so unreasonable combinations can be avoided.

## Project structure

### Quick overview

- `index.html`: uni-app H5 entry template
- `src/main.js`: uni-app app entry
- `src/App.vue`: root component
- `src/pages/index/index.vue`: main page (UI + styles + interaction)
- `src/manifest.json`: uni-app app config (appid, H5 publicPath, etc.)
- `src/pages.json`: uni-app page routing config
- `src/utils/menuLogic.js`: core logic - markdown parsing, candidate building, draw rules
- `src/utils/menuConfig.js`: pairing weight configuration (adjust rules here)
- `src/data/recipeMenu.json`: converted menu data **(generated, do not edit manually)**
- `recipe_menu.md`: menu source data **(edit this to add/remove dishes)**
- `scripts/convert-menu.js`: converts `recipe_menu.md` to `recipeMenu.json`
- `tests/menuLogic.test.mjs`: logic tests
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow

### Full tree

```
.
├── README.md
├── index.html
├── recipe_menu.md
├── pages.json
├── manifest.json
├── project.config.json
├── vite.config.ts
├── package.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── manifest.json
│   ├── pages.json
│   ├── pages/
│   │   └── index/
│   │       └── index.vue
│   ├── data/
│   │   └── recipeMenu.json
│   └── utils/
│       ├── menuConfig.js
│       └── menuLogic.js
├── scripts/
│   └── convert-menu.js
├── tests/
│   └── menuLogic.test.mjs
├── docs/
│   └── plans/
│       └── ... (historical design docs)
└── dist/
    └── build/
        └── h5/ (built output)
```

### Data flow

```
Edit: recipe_menu.md (Markdown)
   ↓
Run: npm run convert:menu
   ↓
Script: scripts/convert-menu.js
   ↓
Parse: uses parseRecipeMarkdown() from menuLogic.js
   ↓
Output: src/data/recipeMenu.json (preprocessed JSON)
   ↓
App: imports preprocessed JSON and draws according to rules
```

### Core architecture layers

| File | Responsibility |
|------|----------------|
| `menuLogic.js` | **Algorithm core**<br>• Markdown parsing<br>• Candidate dish generation<br>• Seasonal filtering (winter only)<br>• Weighted random drawing<br>• Avoid recently drawn rule |
| `menuConfig.js` | **Configuration center**<br>• `proteinPairWeights` - main → soup pairing weight matrix<br>• `vegetablePairWeights` - reserved for vegetable pairing<br>• Default value configurations |
| `index.vue` | **Presentation layer**<br>• Vue component state management<br>• User interaction<br>• Result rendering<br>• Embedded complete styling |

## Local development

Requires Node.js v18 (use `.nvmrc`):

```bash
nvm use
```

Install dependencies (uses npmmirror for @dcloudio packages):

```bash
npm install --registry=https://registry.npmmirror.com
```

Convert menu data:

```bash
npm run convert:menu
```

Run H5 dev server:

```bash
npm run dev:h5
```

Then open `http://localhost:5173/`

## Build & deploy

Build H5:

```bash
npm run build:h5
```

Build WeChat Mini Program:

```bash
npm run build:mp-weixin
```

Push to `master` branch triggers GitHub Actions, which builds H5 and deploys to GitHub Pages automatically.

Live site: https://woonoah.github.io/recipe_select/

## Menu format

Each `##` section in `recipe_menu.md` is treated as a menu category. Adding a new section will automatically render a new result card.

Current sections:

- `## 1. 经典肉类`
- `## 2. 汤品`
- `## 3. 素菜类`
- `## 4. 凉拌菜类`

Example:

```md
# 菜谱

## 1. 经典肉类

1. 红烧肉 | protein=猪肉
2. 油焖鸡 | protein=鸡肉

## 2. 汤品

1. 虾仁豆腐汤 | protein=甲壳海鲜
2. 罗宋汤 | protein=牛肉

## 3. 素菜类

1. 清炒菠菜 | veg=叶菜类
```

## Metadata rules

- Dishes in `经典肉类` and `汤品` should include `| protein=<group>`
- `素菜类` can use `| veg=<group>` for future weighting support
- Unknown sections are allowed and will still be drawn independently
- Group naming rules are documented in `docs/ingredient-groups.md`

## Pairing rules

Protein pairing weights live in `src/utils/menuConfig.js`.

- `经典肉类` (daily main dish) is drawn first
- `汤品` (soup) is drawn second using the `proteinPairWeights` matrix
- Weight `0` means the pairing is forbidden
- Higher weights make a pairing more likely

## Drawing rules by category

| Category | id | Special Rule |
|----------|-----|--------------|
| 每日主菜 (Daily Main) | `classic` | Avoid the 5 most recently drawn dishes to prevent repetition |
| 汤品 (Soup) | `soup` | Weighted drawing based on the main dish's protein group |
| 小炒类 (Stir-fry) | `stirFry` | Draw 2 dishes, requires different vegetable groups |
| 凉拌菜类 (Cold Dish) | `coldDish` | Draw 1 dish, no special rules |

Adding a new category automatically works - the UI will render a new result card automatically.

**Detailed rules**:

1. **Daily Main Dish**:
   - Draw one randomly
   - Automatically avoids the 5 most recently drawn dishes
   - Records history to prevent short-term repetition

2. **Soup**:
   - After main dish is drawn, look up the weight table by main dish's `protein` group
   - Weight = 0 → this soup is forbidden for this main
   - Higher weight → higher probability of being drawn
   - Example: fish main dish ⇒ weight table forbids fish soup and crustacean seafood soup, so no duplicate types

3. **Stir-fry**:
   - Automatically draws two dishes
   - Requires the two dishes have different `veg` groups
   - Prevents: two eggplant dishes in the same meal

4. **Cold Dish**:
   - Draw one randomly

## Seasonal rules

- `羊排汤（冬日限定）` only participates from December 1 through March 31

## Update flow

1. Edit `recipe_menu.md`
2. Run `npm run convert:menu` to regenerate `src/data/recipeMenu.json`
3. Preview locally with `npm run dev:h5`
4. Commit and push to `master`
5. GitHub Actions builds and deploys to GitHub Pages automatically

## First-time setup

1. Push to a GitHub repository
2. In repository Settings → Pages, set Source to **GitHub Actions**
3. The workflow will run on the next push to `master`
