# Recipe Menu Pages

This folder is a standalone GitHub Pages site for the recipe menu picker.

## Files

- `index.html`: page entry
- `styles.css`: visual styling
- `recipe_menu.md`: dish source data
- `src/app.mjs`: browser logic
- `src/menuLogic.mjs`: parsing and draw rules
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow

## Update flow

1. Edit `recipe_menu.md`
2. Commit the changed file
3. Push to the `master` branch
4. GitHub Actions deploys the updated site to GitHub Pages

## First-time setup

1. Create a new GitHub repository for this folder
2. Push this folder's contents to that repository's `master` branch
3. In GitHub repository settings, enable GitHub Pages with **GitHub Actions** as the source

## Notes

- The site reads `recipe_menu.md` at runtime, so menu updates only require committing the Markdown file
- Winter mode includes `羊排汤（冬日限定）` only from December 1 through March 31
