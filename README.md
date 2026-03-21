# Recipe Menu Pages

This folder is a standalone GitHub Pages site for the recipe menu picker.

The page reads `recipe_menu.md` at runtime, builds menu categories from Markdown sections, and randomly draws one dish per available category. `经典肉类` and `汤品` use configurable protein-pair weights so unreasonable combinations can be avoided.

## Files

- `index.html`: page entry
- `styles.css`: visual styling
- `recipe_menu.md`: menu source data
- `src/app.mjs`: browser-side loading and rendering
- `src/menuLogic.mjs`: markdown parsing, candidate building, and draw rules
- `src/menuConfig.mjs`: pairing weight configuration
- `tests/menuLogic.test.mjs`: logic tests
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow

## Local preview

Do not open `index.html` directly in the browser. The page fetches `recipe_menu.md`, and most browsers block that request on the `file:` protocol.

Run a local static server in this directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Menu format

Each `##` section in `recipe_menu.md` is treated as a menu category. If a new section is added later, the UI will automatically render a new result card for that category.

Current commonly used sections:

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
- `protein` is used for pairing logic only; it is not intended to be a full ingredient list
- `素菜类` can use `| veg=<group>` for future weighting support
- Unknown sections are allowed and will still be drawn independently
- Group naming rules are documented in `docs/ingredient-groups.md`
- Metadata values are maintained in Chinese to keep menu editing and config tuning in one language

## Pairing rules

Protein pairing weights live in `src/menuConfig.mjs`.

Rules currently in effect:

- `经典肉类` is drawn first
- `汤品` is drawn second using the `proteinPairWeights` matrix
- Weight `0` means the pairing is forbidden
- Higher weights make a pairing more likely
- `素菜类` and other non-soup sections are currently drawn independently

Examples of current blocked soup pairings:

- `鱼类 + 鱼类`
- `鱼类 + 甲壳海鲜`
- `甲壳海鲜 + 甲壳海鲜`

## Seasonal rules

- `羊排汤（冬日限定）` only participates from December 1 through March 31

## Update flow

1. Edit `recipe_menu.md` or `src/menuConfig.mjs`
2. Preview locally with `python3 -m http.server 8000`
3. Run tests with `node --test`
4. Commit the changed files
5. Push to the `master` branch
6. GitHub Actions deploys the updated site to GitHub Pages

## First-time setup

1. Create a new GitHub repository for this folder
2. Push this folder's contents to that repository's `master` branch
3. In GitHub repository settings, enable GitHub Pages with **GitHub Actions** as the source
