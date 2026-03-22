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
    return `小炒${count}`;
  } else if (entry.sectionId === 'coldDish') {
    return '凉拌';
  } else {
    return entry.sectionTitle;
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
  <view class="page">
    <view class="container">
      <!-- Header Section -->
      <view class="header-card">
        <text class="eyebrow">Today's Menu</text>
        <text class="title">今天吃什么</text>
        <text class="description">智能抽签决定今日菜单，根据主食材权重避免不合理搭配</text>
        <view class="action-area">
          <button class="draw-btn" @click="drawMenu">🎲 开始抽签</button>
        </view>
        <text class="status" v-if="statusText">{{ statusText }}</text>
        <view v-if="hasError" class="error-box">{{ errorText }}</view>
      </view>

      <!-- Result Section - Modern Menu Card Style -->
      <view v-if="hasResult" class="menu-board">
        <text class="menu-title">今日菜单</text>
        <view class="menu-items">
          <view
            v-for="(entry, index) in draws"
            :key="index"
            class="menu-item"
            :style="{ animationDelay: `${index * 60}ms` }"
          >
            <text class="item-category">{{ getCategoryText(entry) }}</text>
            <text class="item-name">{{ entry.dish.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
/* ========== CSS Variables ========== */
:root {
  --bg-page: #ede6d6;
  --bg-card: linear-gradient(150deg, #fbf0db 0%, #f2e6ce 100%);
  --text-main: #2b1810;
  --text-secondary: #6b5340;
  --accent: #c8551e;
  --accent-soft: #f9e0c4;
  --border: rgba(100, 60, 30, 0.18);
  --shadow: 0 6px 18px rgba(43, 24, 16, 0.1);
}

/* ========== Base ========== */
page {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: var(--bg-page);
  background-image:
    radial-gradient(at 0% 0%, rgba(200, 85, 30, 0.1) 0%, transparent 45%),
    radial-gradient(at 100% 100%, rgba(70, 100, 50, 0.1) 0%, transparent 45%);
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  color: var(--text-main);
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 12px;
}

/* ========== Header Card ========== */
.header-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 28px 20px;
  box-shadow: var(--shadow);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Subtle paper texture */
.header-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E");
  pointer-events: none;
}

.eyebrow {
  display: block;
  font-family: "Avenir Next Condensed", "Arial Narrow", Helvetica, sans-serif;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.8;
  margin-bottom: 10px;
}

.title {
  display: block;
  font-size: clamp(2.6rem, 8vw, 4rem);
  line-height: 0.92;
  font-weight: 800;
  letter-spacing: -0.05em;
  margin-bottom: 10px;
  color: var(--text-main);
}

.description {
  display: block;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin-bottom: 18px;
}

.action-area {
  margin-bottom: 8px;
}

/* Button - NO BORDER as requested */
.draw-btn {
  display: inline-block !important;
  width: auto !important;
  border: none !important;
  border-radius: 999px;
  padding: 14px 36px;
  font-size: 1.1rem;
  font-family: inherit;
  font-weight: 700;
  color: #ffffff !important;
  background: linear-gradient(135deg, var(--accent) 0%, #e06b2a 100%);
  box-shadow: 0 8px 24px rgba(200, 85, 30, 0.4);
  cursor: pointer;
  transition: all 200ms ease;
  line-height: 1.2;
}

.draw-btn::after {
  border: none !important;
  background: transparent !important;
}

.draw-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(200, 85, 30, 0.5);
}

.status {
  display: block;
  font-size: 0.82rem;
  color: var(--text-secondary);
  opacity: 0.75;
  margin-top: 8px;
}

.error-box {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(200, 85, 30, 0.1);
  border: 1px solid rgba(200, 85, 30, 0.2);
  color: var(--accent);
  font-size: 0.82rem;
  line-height: 1.4;
}

/* ========== Result - Elegant Menu Board Style ========== */
.menu-board {
  margin-top: 16px;
  background: linear-gradient(180deg, #fbf8f2 0%, #f5f0e6 100%);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
  animation: fadeSlide 300ms ease-out both;
}

.menu-title {
  display: block;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(100, 60, 30, 0.15);
  font-family: inherit;
}

/* Grid of menu items - 2 per row on all screens, compact */
.menu-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.menu-item {
  background: linear-gradient(135deg, #ffffff 0%, #fcf7ed 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 10px;
  box-shadow: 0 3px 8px rgba(43, 24, 16, 0.06);
  opacity: 0;
  animation: popIn 350ms ease forwards;
}

.item-category {
  display: block;
  font-family: "Avenir Next Condensed", "Arial Narrow", Helvetica, sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.7;
  margin-bottom: 4px;
}

.item-name {
  display: block;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-main);
}

/* ========== Animations ========== */
@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ========== Mobile Responsive ========== */
@media (max-width: 480px) {
  .container {
    padding: 10px 8px;
  }

  .header-card {
    padding: 20px 14px;
    border-radius: 20px;
  }

  .title {
    margin-bottom: 8px;
  }

  .description {
    margin-bottom: 14px;
  }

  .draw-btn {
    width: 100% !important;
  }

  .menu-board {
    margin-top: 10px;
    padding: 12px 10px;
  }

  .menu-items {
    gap: 8px;
  }

  .menu-item {
    padding: 10px 8px;
  }

  .item-name {
    font-size: 0.95rem;
  }
}

/* Single column on very small phones if needed */
@media (max-width: 320px) {
  .menu-items {
    grid-template-columns: 1fr;
  }
}
</style>
