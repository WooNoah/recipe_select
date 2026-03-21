import {
  parseRecipeMarkdown,
  isWinterDate,
  buildCandidates,
  drawTwoDishes,
} from './menuLogic.mjs';

const state = {
  menu: null,
  loadedAt: null,
};

const statusEl = document.querySelector('[data-role="status"]');
const errorEl = document.querySelector('[data-role="error"]');
const drawButton = document.querySelector('[data-role="draw-button"]');
const resultSection = document.querySelector('[data-role="result-section"]');
const resultEls = Array.from(document.querySelectorAll('[data-role="dish"]'));

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

function renderResult(dishes) {
  dishes.forEach((dish, index) => {
    const el = resultEls[index];
    el.querySelector('[data-role="dish-category"]').textContent =
      dish.category === 'soup' ? '汤品' : '经典肉类';
    el.querySelector('[data-role="dish-name"]').textContent = dish.name;
    el.classList.remove('dish-card--animate');
    void el.offsetWidth;
    el.classList.add('dish-card--animate');
  });

  resultSection.hidden = false;
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

  const candidates = buildCandidates(state.menu, today);
  const dishes = drawTwoDishes(candidates);
  renderResult(dishes);
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
    drawButton.textContent = '随机抽两道菜';
  } catch (error) {
    setError(error instanceof Error ? error.message : '读取菜谱失败。');
    drawButton.disabled = true;
  }
}

drawButton.addEventListener('click', () => {
  setError(null);
  drawMenu();
});

init();
