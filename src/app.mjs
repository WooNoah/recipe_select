import {
  parseRecipeMarkdown,
  isWinterDate,
  buildSectionCandidates,
  drawMenuSections,
} from './menuLogic.mjs';

const state = {
  menu: null,
  loadedAt: null,
};

const statusEl = document.querySelector('[data-role="status"]');
const errorEl = document.querySelector('[data-role="error"]');
const drawButton = document.querySelector('[data-role="draw-button"]');
const resultSection = document.querySelector('[data-role="result-section"]');
const resultGridEl = document.querySelector('[data-role="dish-grid"]');
const dishTemplateEl = document.querySelector('[data-role="dish-template"]');

function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function setStatus(date) {
  const winterMode = isWinterDate(date);
  const seasonLabel = winterMode ? '冬日限定模式已开启' : '冬日限定模式未开启';
  statusEl.textContent = `今天是 ${formatDate(date)}，${seasonLabel}。`;
}

function setError(message) {
  errorEl.hidden = !message;
  errorEl.textContent = message ?? '';
}

function renderResult(draws) {
  resultGridEl.replaceChildren();

  // 给小炒类计数，第一道显示"小炒菜 1"，第二道显示"小炒菜 2"
  let stirFryCount = 0;

  draws.forEach((entry, index) => {
    const cardEl = dishTemplateEl.content.firstElementChild.cloneNode(true);
    cardEl.style.setProperty('--card-index', String(index));

    let categoryText;
    if (entry.sectionId === 'stirFry') {
      stirFryCount++;
      categoryText = `小炒菜 ${stirFryCount}`;
    } else if (entry.sectionId === 'coldDish') {
      categoryText = '凉拌菜';
    } else {
      // 其他分类：如果有 veg 元数据就显示 veg，否则显示分类名称
      categoryText = entry.dish.metadata.veg ?? entry.sectionTitle;
    }

    cardEl.querySelector('[data-role="dish-category"]').textContent = categoryText;
    cardEl.querySelector('[data-role="dish-name"]').textContent = entry.dish.name;
    cardEl.classList.add('dish-card--animate');
    resultGridEl.append(cardEl);
  });

  resultSection.hidden = draws.length === 0;
}

async function loadMenu() {
  const response = await fetch('./recipe_menu.md', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`读取 recipe_menu.md 失败：${response.status}`);
  }

  const markdown = await response.text();
  state.menu = parseRecipeMarkdown(markdown);
  state.loadedAt = new Date();
}

function drawMenu() {
  if (!state.menu) {
    return;
  }

  const today = new Date();
  setStatus(today);

  const sections = buildSectionCandidates(state.menu, today);
  const draws = drawMenuSections(sections);

  if (draws.length === 0) {
    throw new Error('当前没有可用菜谱可供抽取。');
  }

  renderResult(draws);
}

async function init() {
  const today = new Date();
  setStatus(today);
  setError(null);

  if (window.location.protocol === 'file:') {
    setError('当前是直接打开本地文件，浏览器通常会拦截读取 Markdown。请在此目录运行 `python3 -m http.server 8000`，再访问 http://localhost:8000/ 。');
    drawButton.disabled = true;
    return;
  }

  try {
    await loadMenu();
    drawButton.disabled = false;
    drawButton.textContent = '随机抽今日菜单';
  } catch (error) {
    setError(error instanceof Error ? error.message : '读取菜谱失败。');
    drawButton.disabled = true;
  }
}

drawButton.addEventListener('click', () => {
  setError(null);

  try {
    drawMenu();
  } catch (error) {
    resultSection.hidden = true;
    setError(error instanceof Error ? error.message : '随机抽取失败。');
  }
});

init();
