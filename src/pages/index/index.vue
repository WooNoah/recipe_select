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
    // Count stirFry dishes for numbering
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

// Initialize on load
(function init() {
  const today = new Date();
  setStatus(today);
})();
</script>

<template>
  <view class="container">
    <view class="status-bar">{{ statusText }}</view>

    <view v-if="hasError" class="error-box">{{ errorText }}</view>

    <button class="draw-button" @click="drawMenu">随机抽今日菜单</button>

    <view v-if="hasResult" class="result-section">
      <view class="dish-grid">
        <view v-for="(entry, index) in draws" :key="index" class="dish-card dish-card--animate">
          <view class="dish-category">{{ getCategoryText(entry) }}</view>
          <view class="dish-name">{{ entry.dish.name }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f5f5f5;
}

.status-bar {
  text-align: center;
  padding: 30rpx 0;
  color: #666;
  font-size: 28rpx;
}

.error-box {
  background-color: #fff2f0;
  border: 1rpx solid #ffccc7;
  color: #cf1322;
  padding: 16rpx;
  border-radius: 8rpx;
  margin: 16rpx 0;
  font-size: 28rpx;
}

.draw-button {
  display: block;
  width: 80%;
  margin: 30rpx auto;
  padding: 24rpx 0;
  background-color: #1890ff;
  color: white;
  border-radius: 12rpx;
  font-size: 32rpx;
  border: none;
  line-height: 1.4;
}

.draw-button::after {
  border: none;
}

.result-section {
  margin-top: 40rpx;
}

.dish-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.dish-card {
  flex: 1 1 calc(50% - 10rpx);
  min-width: 300rpx;
  background-color: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease forwards;
  opacity: 0;
  animation-delay: calc(var(--card-index) * 0.1s);
}

@keyframes slideIn {
  from {
    transform: translateY(20rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dish-category {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}

.dish-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}
</style>
