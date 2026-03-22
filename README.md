# Recipe Menu Pages

A recipe menu picker built with uni-app, deployable to both WeChat Mini Program and GitHub Pages (H5).

The app reads `recipe_menu.md` at build time (converted to JSON), builds menu categories from Markdown sections, and randomly draws one dish per available category. `经典肉类` and `汤品` use configurable protein-pair weights so unreasonable combinations can be avoided.

## Project structure

- `index.html`: uni-app H5 entry template
- `src/main.js`: uni-app app entry
- `src/App.vue`: root component
- `src/pages/index/index.vue`: main page (UI + styles)
- `src/manifest.json`: uni-app app config (appid, H5 publicPath, etc.)
- `src/pages.json`: uni-app page routing config
- `src/utils/menuLogic.js`: markdown parsing, candidate building, and draw rules
- `src/utils/menuConfig.js`: pairing weight configuration
- `src/data/recipeMenu.json`: converted menu data (generated, do not edit manually)
- `recipe_menu.md`: menu source data (edit this)
- `scripts/convert-menu.js`: converts `recipe_menu.md` to `recipeMenu.json`
- `tests/menuLogic.test.mjs`: logic tests
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow

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

- `经典肉类` is drawn first
- `汤品` is drawn second using the `proteinPairWeights` matrix
- Weight `0` means the pairing is forbidden
- Higher weights make a pairing more likely

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
