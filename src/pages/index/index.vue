<script setup>
import { ref } from 'vue';
import menu from '@/data/recipeMenu.json';
import { buildSectionCandidates, drawMenuSections, isWinterDate } from '@/utils/menuLogic';

const statusText = ref('');
const errorText = ref('');
const hasError = ref(false);
const hasResult = ref(false);
const draws = ref([]);

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
  statusText.value = `今天是 ${formatDate(date)}，${seasonLabel}。`;
}

function setError(message) {
  hasError.value = !!message;
  errorText.value = message || '';
}

function renderResult(results) {
  draws.value = results;
  hasResult.value = results.length > 0;
}

function getCategoryText(entry) {
  if (entry.sectionId === 'stirFry') {
    const count = draws.value.filter(d => d.sectionId === 'stirFry').findIndex(d => d === entry) + 1;
    return `小炒菜 ${count}`;
  } else if (entry.sectionId === 'coldDish') {
    return '凉拌菜';
  } else {
    return entry.dish.metadata.veg || entry.sectionTitle;
  }
}

function drawMenu() {
  setError(null);
  try {
    const today = new Date();
    setStatus(today);
    const sections = buildSectionCandidates(menu, today);
    const results = drawMenuSections(sections);
    if (results.length === 0) {
      throw new Error('当前没有可用菜谱可供抽取。');
    }
    renderResult(results);
  } catch (err) {
    hasResult.value = false;
    setError(err instanceof Error ? err.message : '随机抽取失败。');
  }
}

(function init() {
  const today = new Date();
  setStatus(today);
})();
</script>

<template>
  <view class="page-shell">
    <view class="hero-panel">
      <text class="eyebrow">Daily Recipe Menu</text>
      <text class="h1">今天吃什么</text>
      <text class="intro">从你的菜单分类里随机抽取今日菜单。经典肉类和汤品会按主食材权重搭配，后续新增分类后页面也会自动展示。</text>
      <view class="toolbar">
        <button class="draw-button" @click="drawMenu">随机抽今日菜单</button>
        <text class="status-line">{{ statusText }}</text>
      </view>
      <view v-if="hasError" class="error-box">{{ errorText }}</view>
    </view>

    <view v-if="hasResult" class="result-panel">
      <view class="result-heading">
        <view>
          <text class="eyebrow">Today's Draw</text>
          <text class="h2">今日菜单</text>
        </view>
      </view>
      <view class="dish-grid">
        <view v-for="(entry, index) in draws" :key="index" class="dish-card dish-card--animate">
          <text class="dish-category">{{ getCategoryText(entry) }}</text>
          <text class="dish-name">{{ entry.dish.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
:root {
  --bg: #f6efe3;
  --panel: rgba(255, 251, 245, 0.9);
  --panel-strong: #fff9f0;
  --ink: #1f1b16;
  --muted: #6b6257;
  --accent: #b64a2b;
  --accent-dark: #812f18;
  --accent-soft: #e8c3a9;
  --line: rgba(71, 48, 35, 0.12);
  --shadow: 0 24px 60px rgba(84, 47, 23, 0.14);
}

page {
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(206, 106, 49, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(90, 122, 85, 0.16), transparent 24%),
    linear-gradient(135deg, #f5ecde 0%, #efe4d1 48%, #f8f4eb 100%);
  min-height: 100vh;
}

.page-shell {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0 72px;
  display: block;
}

.hero-panel,
.result-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 32px;
  box-shadow: var(--shadow);
  display: block;
}

.hero-panel {
  padding: 40px;
}

.eyebrow {
  display: block;
  margin: 0 0 12px;
  font-family: "Avenir Next Condensed", "Arial Narrow", sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent-dark);
}

.h1 {
  display: block;
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  font-weight: bold;
}

.intro {
  display: block;
  max-width: 42rem;
  margin-top: 20px;
  font-size: 1.08rem;
  line-height: 1.75;
  color: var(--muted);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  margin-top: 30px;
}

.draw-button {
  border: 0 !important;
  border-radius: 999px !important;
  padding: 16px 24px !important;
  min-width: 220px;
  font-size: 1rem;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif;
  color: #fff8f0 !important;
  background: linear-gradient(135deg, var(--accent) 0%, #d46f3d 100%) !important;
  box-shadow: 0 16px 30px rgba(160, 68, 36, 0.22) !important;
  cursor: pointer;
  line-height: 1.4;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.draw-button::after {
  border: none !important;
  background: transparent !important;
}

.status-line {
  color: var(--muted);
  font-size: 0.98rem;
}

.error-box {
  display: block;
  margin-top: 22px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(139, 43, 13, 0.08);
  color: #7b2c15;
  line-height: 1.6;
}

.result-panel {
  margin-top: 22px;
  padding: 32px;
}

.result-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
}

.h2 {
  display: block;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: bold;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.dish-card {
  min-height: 186px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 247, 235, 0.95)), var(--panel-strong);
  border: 1px solid rgba(182, 74, 43, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dish-card--animate {
  animation: reveal 420ms ease both;
}

.dish-category {
  display: block;
  font-family: "Avenir Next Condensed", "Arial Narrow", sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-dark);
  font-size: 0.82rem;
}

.dish-name {
  display: block;
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  line-height: 1.15;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 760px) {
  .page-shell {
    width: calc(100% - 20px);
    padding: 20px 0 40px;
  }

  .hero-panel,
  .result-panel {
    border-radius: 24px;
  }

  .hero-panel {
    padding: 26px 22px;
  }

  .result-panel {
    padding: 22px;
  }

  .toolbar {
    align-items: stretch;
  }

  .draw-button {
    width: 100%;
  }

  .dish-grid {
    grid-template-columns: 1fr;
  }
}
</style>
