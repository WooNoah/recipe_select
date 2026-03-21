import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseRecipeMarkdown,
  buildSectionCandidates,
  drawMenuSections,
} from '../src/menuLogic.mjs';

function createRandomSequence(values) {
  let index = 0;

  return () => {
    const value = values[Math.min(index, values.length - 1)];
    index += 1;
    return value;
  };
}

test('parseRecipeMarkdown preserves available sections and their metadata', () => {
  const menu = parseRecipeMarkdown(`
# 菜谱

## 1. 每日主菜

1. 红烧肉 | protein=猪肉

## 2. 汤品

1. 鱼汤 | protein=鱼类

## 3. 素菜类

1. 清炒菠菜 | veg=叶菜类

## 5. 甜品类

1. 银耳羹
`);

  assert.deepEqual(menu.sections.map((section) => section.title), [
    '每日主菜',
    '汤品',
    '素菜类',
    '甜品类',
  ]);
  assert.deepEqual(menu.sections[0].items[0], {
    name: '红烧肉',
    metadata: { protein: '猪肉' },
  });
  assert.deepEqual(menu.sections[2].items[0], {
    name: '清炒菠菜',
    metadata: { veg: '叶菜类' },
  });
  assert.deepEqual(menu.sections[3].items[0], {
    name: '银耳羹',
    metadata: {},
  });
});

test('buildSectionCandidates keeps winter-only filtering and allows missing optional sections', () => {
  const menu = parseRecipeMarkdown(`
# 菜谱

## 1. 每日主菜

1. 红烧肉 | protein=猪肉

## 2. 汤品

1. 羊排汤（冬日限定） | protein=羊肉
2. 鱼汤 | protein=鱼类
`);

  const summerSections = buildSectionCandidates(menu, new Date('2026-07-01T12:00:00Z'));
  const winterSections = buildSectionCandidates(menu, new Date('2026-01-15T12:00:00Z'));

  assert.deepEqual(summerSections.map((section) => section.id), ['classic', 'soup']);
  assert.equal(summerSections[1].items.some((dish) => dish.name.includes('羊排汤')), false);
  assert.equal(winterSections[1].items.some((dish) => dish.name.includes('羊排汤')), true);
});

test('drawMenuSections draws one result per available section in order', () => {
  const menu = parseRecipeMarkdown(`
# 菜谱

## 1. 每日主菜

1. 红烧肉 | protein=猪肉

## 2. 汤品

1. 排骨汤 | protein=猪肉
2. 番茄蛋汤 | protein=蛋类

## 3. 素菜类

1. 清炒菠菜 | veg=叶菜类
2. 香菇青菜 | veg=菌菇类

## 4. 凉拌菜类

1. 凉拌黄瓜
2. 皮蛋豆腐
`);

  const sections = buildSectionCandidates(menu, new Date('2026-03-22T12:00:00Z'));
  const draws = drawMenuSections(sections, createRandomSequence([0, 0.9, 0.4, 0.7]));

  assert.deepEqual(draws.map((entry) => entry.sectionTitle), [
    '每日主菜',
    '汤品',
    '素菜类',
    '凉拌菜类',
  ]);
  assert.equal(draws[0].dish.name, '红烧肉');
  assert.equal(draws[1].dish.name, '番茄蛋汤');
  assert.equal(draws[2].dish.name, '清炒菠菜');
  assert.equal(draws[3].dish.name, '皮蛋豆腐');
});

test('drawMenuSections keeps forbidden fish and shellfish soup pairings blocked', () => {
  const menu = parseRecipeMarkdown(`
# 菜谱

## 1. 每日主菜

1. 番茄鱼 | protein=鱼类

## 2. 汤品

1. 鱼汤 | protein=鱼类
2. 虾仁豆腐汤 | protein=甲壳海鲜
3. 罗宋汤 | protein=牛肉
`);

  const sections = buildSectionCandidates(menu, new Date('2026-03-22T12:00:00Z'));
  const draws = drawMenuSections(sections, createRandomSequence([0, 0.1]));

  assert.equal(draws[0].dish.metadata.protein, '鱼类');
  assert.equal(draws[1].dish.metadata.protein, '牛肉');
});

test('drawMenuSections includes unknown sections as independent draws', () => {
  const menu = parseRecipeMarkdown(`
# 菜谱

## 1. 每日主菜

1. 红烧肉 | protein=猪肉

## 2. 汤品

1. 排骨汤 | protein=猪肉

## 7. 宵夜类

1. 炒面
2. 炒饭
`);

  const sections = buildSectionCandidates(menu, new Date('2026-03-22T12:00:00Z'));
  const draws = drawMenuSections(sections, createRandomSequence([0, 0, 0.8]));

  assert.deepEqual(draws.map((entry) => entry.sectionTitle), ['每日主菜', '汤品', '宵夜类']);
  assert.equal(draws[2].dish.name, '炒饭');
});
