# 经典肉类近期选中回避功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为经典肉类（荤菜）增加"被抽中后 5 次点击内不再重复出现"的功能，保持现有的肉菜-汤品权重配对逻辑不变。

**Architecture:** 在 `src/menuLogic.mjs` 模块级别维护一个固定大小的 FIFO 队列存储最近抽中的 5 道荤菜。每次抽取经典肉类前，从候选列表中过滤掉队列中的菜。抽取后将新菜加入队列，超过长度时移除队首。原有汤品权重配对逻辑完全不变。

**Tech Stack:** 原生 JavaScript ES 模块，无额外依赖。现有测试使用 Node.js 内置测试运行器。

---

### Task 1: 在 menuLogic.mjs 中添加队列状态和过滤逻辑

**Files:**
- Modify: `src/menuLogic.mjs`

**Step 1: 在模块顶部添加队列状态**

在文件开头 import 之后添加：

```javascript
// 最近抽中的经典肉类，FIFO 队列，最多保存 5 个菜名
const recentlyPickedMeats = [];
const MAX_RECENT_MEATS = 5;
```

**Step 2: 修改 drawMenuSections 函数中经典肉类的抽取逻辑**

找到 `section.id === 'classic'` 分支：

原代码：
```javascript
if (section.id === 'classic') {
  dish = pickOne(section.items, randomFn);
  classicDish = dish;
}
```

修改为：
```javascript
if (section.id === 'classic') {
  // 过滤掉最近 5 次抽中的菜
  const availableMeats = section.items.filter(
    dish => !recentlyPickedMeats.includes(dish.name)
  );
  // 如果所有菜都被过滤了（理论上不会发生，因为总数量 > 5），使用全部候选
  const candidates = availableMeats.length > 0 ? availableMeats : section.items;
  dish = pickOne(candidates, randomFn);
  classicDish = dish;

  // 添加到最近抽中队列，保持最大长度
  recentlyPickedMeats.push(dish.name);
  if (recentlyPickedMeats.length > MAX_RECENT_MEATS) {
    recentlyPickedMeats.shift();
  }
}
```

这样修改后，后续的汤品权重配对逻辑完全不受影响。

**Step 3: 运行现有测试确认通过**

```bash
node --test tests/menuLogic.test.mjs
```

Expected: 所有测试通过

**Step 4: Commit**

```bash
git add src/menuLogic.mjs docs/plans/2026-03-22-meat-cooldown-implementation.md
git commit -m "feat: add 5-click cooldown for recently picked meats"
```

### Task 2: 验证功能手动测试

**Files:**
- None to modify, just test

**Step 1: 启动本地服务器**

```bash
python3 -m http.server 8000
```

**Step 2: 在浏览器打开**

打开 `http://localhost:8000`

**Step 3: 验证功能**

- 多次连续点击"随机抽今日菜单"按钮
- 观察经典肉类部分，同一道菜不会在 5 次点击内重复出现
- 确认汤品的权重配对仍然正常工作（不会因为过滤而变化）

**Step 4: 验证刷新页面后重置**

- 刷新页面，之前的回避记录清空，可以立即抽到之前出现过的菜

### Task 3: （可选）如果有测试需要，添加单元测试

**Files:**
- Modify: `tests/menuLogic.test.mjs`

**Step 1: 添加测试用例**

在测试文件末尾添加：

```javascript
test('recently picked meat does not repeat for 5 draws', () => {
  const menu = parseRecipeMarkdown(`
# 菜谱

## 1. 经典肉类

1. 红烧肉 | protein=猪肉
2. 油焖鸡 | protein=鸡肉
3. 番茄牛腩 | protein=牛肉
4. 话梅排骨 | protein=猪肉
5. 酸菜炖粉条 | protein=猪肉
6. 红烧猪蹄 | protein=猪肉
7. 可乐鸡翅 | protein=鸡肉

## 2. 汤品
1. 番茄蛋汤 | protein=蛋类
`);
  const sections = buildSectionCandidates(menu, new Date());
  const pickedNames = [];
  // 使用固定种子保证可测试，全部抽完前不会重复
  for (let i = 0; i < 6; i++) {
    const draws = drawMenuSections(sections, () => 0.1); // always pick first available
    const meat = draws.find(d => d.sectionId === 'classic');
    pickedNames.push(meat.dish.name);
  }
  // 前 6 次抽取中，前 6 个各不相同（因为我们有 7 个菜，过滤 5 个）
  const uniqueCount = new Set(pickedNames).size;
  assert.equal(uniqueCount, 6);
});
```

**Step 2: 运行测试确认通过**

```bash
node --test tests/menuLogic.test.mjs
```

Expected: 测试通过

**Step 3: Commit**

```bash
git add tests/menuLogic.test.mjs
git commit -m "test: add unit test for recently picked cooldown"
```
