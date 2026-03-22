// scripts/convert-menu.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseRecipeMarkdown } from '../src/utils/menuLogic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mdPath = path.join(__dirname, '../recipe_menu.md');
const outputPath = path.join(__dirname, '../src/data/recipeMenu.json');

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
