// scripts/convert-menu.js
const fs = require('fs');
const path = require('path');
const { parseRecipeMarkdown } = require('../src/utils/menuLogic');

const mdPath = path.join(__dirname, '../recipe_menu.md');
const outputPath = path.join(__dirname, '../src/data/recipeMenu.json');

// Check if recipe_menu.md exists
if (!fs.existsSync(mdPath)) {
  console.error('Error: recipe_menu.md not found at', mdPath);
  process.exit(1);
}

const markdown = fs.readFileSync(mdPath, 'utf-8');
const menu = parseRecipeMarkdown(markdown);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(menu, null, 2));

console.log('✅ Converted recipe_menu.md to recipeMenu.json successfully');
console.log(`   Found ${menu.sections.length} menu sections`);
console.log(`   Output: ${outputPath}`);
