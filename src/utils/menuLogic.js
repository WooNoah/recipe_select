import {
  proteinPairWeights,
  defaultProteinPairWeight,
} from './menuConfig.js';

// 最近抽中的经典肉类，FIFO 队列，最多保存 5 个菜名
const recentlyPickedMeats = [];
const MAX_RECENT_MEATS = 5;

const WINTER_ONLY_MARKER = '（冬日限定）';

const KNOWN_SECTION_RULES = {
  每日主菜: {
    id: 'classic',
    requiredMetadata: ['protein'],
  },
  汤品: {
    id: 'soup',
    requiredMetadata: ['protein'],
  },
  素菜类: {
    id: 'vegetarian',
    requiredMetadata: [],
  },
  小炒类: {
    id: 'stirFry',
    requiredMetadata: [],
  },
  凉拌菜类: {
    id: 'coldDish',
    requiredMetadata: [],
  },
};

function normalizeSectionTitle(heading) {
  return heading.replace(/^\d+\.\s*/, '').trim();
}

function buildFallbackSectionId(title, index) {
  const asciiSlug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return asciiSlug || `section-${index + 1}`;
}

function parseMetadata(parts) {
  return Object.fromEntries(
    parts
      .map((part) => part.split('=').map((value) => value.trim()))
      .filter(([key, value]) => Boolean(key) && Boolean(value))
  );
}

function parseDishLine(line, sectionRule) {
  const [rawName, ...metadataParts] = line.split('|').map((part) => part.trim());
  const metadata = parseMetadata(metadataParts);

  for (const field of sectionRule.requiredMetadata) {
    if (!metadata[field]) {
      throw new Error(`Dish is missing ${field} metadata: ${rawName}`);
    }
  }

  return {
    name: rawName,
    metadata,
  };
}

function parseSection(rawHeading, body, index) {
  const title = normalizeSectionTitle(rawHeading);
  const sectionRule = KNOWN_SECTION_RULES[title] ?? {
    id: buildFallbackSectionId(title, index),
    requiredMetadata: [],
  };

  const items = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, '').trim())
    .map((line) => parseDishLine(line, sectionRule));

  return {
    id: sectionRule.id,
    title,
    items,
  };
}

export function parseRecipeMarkdown(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentHeading = null;
  let currentBodyLines = [];

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (currentHeading !== null) {
        sections.push(parseSection(currentHeading, currentBodyLines.join('\n'), sections.length));
      }

      currentHeading = line.replace(/^##\s+/, '').trim();
      currentBodyLines = [];
      continue;
    }

    if (currentHeading !== null) {
      currentBodyLines.push(line);
    }
  }

  if (currentHeading !== null) {
    sections.push(parseSection(currentHeading, currentBodyLines.join('\n'), sections.length));
  }

  if (sections.length === 0) {
    throw new Error('No recipe sections found in recipe_menu.md');
  }

  return {
    sections,
  };
}

export function isWinterDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 12) {
    return day >= 1;
  }

  if (month >= 1 && month <= 2) {
    return true;
  }

  if (month === 3) {
    return day <= 31;
  }

  return false;
}

function buildDishCandidate(section, item) {
  return {
    name: item.name,
    metadata: item.metadata,
    proteinGroup: item.metadata.protein ?? null,
    winterOnly: section.id === 'soup' && item.name.includes(WINTER_ONLY_MARKER),
  };
}

export function buildSectionCandidates(menu, date = new Date()) {
  const winterMode = isWinterDate(date);

  return menu.sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items
      .map((item) => buildDishCandidate(section, item))
      .filter((dish) => section.id !== 'soup' || winterMode || !dish.winterOnly),
  }));
}

function pickOne(items, randomFn) {
  const index = Math.floor(randomFn() * items.length);
  return items[Math.min(index, items.length - 1)];
}

function getProteinPairWeight(firstDish, secondDish) {
  const row = proteinPairWeights[firstDish.proteinGroup];
  const exactWeight = row?.[secondDish.proteinGroup];

  return exactWeight ?? defaultProteinPairWeight;
}

function pickWeighted(itemsWithWeight, randomFn) {
  const totalWeight = itemsWithWeight.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    throw new Error('No weighted candidates available for section draw');
  }

  const target = randomFn() * totalWeight;
  let cumulativeWeight = 0;

  for (const item of itemsWithWeight) {
    cumulativeWeight += item.weight;
    if (target < cumulativeWeight) {
      return item.dish;
    }
  }

  return itemsWithWeight[itemsWithWeight.length - 1].dish;
}

export function drawMenuSections(sections, randomFn = Math.random) {
  const draws = [];
  let classicDish = null;

  for (const section of sections) {
    if (section.items.length === 0) {
      continue;
    }

    let dish = null;

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
    } else if (section.id === 'soup' && classicDish) {
      const weightedPool = section.items
        .map((candidate) => ({
          dish: candidate,
          weight: getProteinPairWeight(classicDish, candidate),
        }))
        .filter((candidate) => candidate.weight > 0);

      if (weightedPool.length === 0) {
        throw new Error(`No valid soup available for protein group: ${classicDish.proteinGroup}`);
      }

      dish = pickWeighted(weightedPool, randomFn);
    } else if (section.id === 'stirFry') {
      // 小炒类：抽两道，不能相同主要食材
      if (section.items.length >= 2) {
        // 抽第一道
        const firstDish = pickOne(section.items, randomFn);
        // 抽第二道，必须和第一道不同的 veg
        const availableSecond = section.items.filter(
          item => item.metadata.veg !== firstDish.metadata.veg
        );
        const secondDish = pickOne(availableSecond, randomFn);
        // 两道都加入结果
        draws.push({
          sectionId: section.id,
          sectionTitle: section.title,
          dish: firstDish,
        });
        draws.push({
          sectionId: section.id,
          sectionTitle: section.title,
          dish: secondDish,
        });
        continue;
      } else {
        // 少于两道，抽一道
        dish = pickOne(section.items, randomFn);
      }
    } else {
      dish = pickOne(section.items, randomFn);
    }

    draws.push({
      sectionId: section.id,
      sectionTitle: section.title,
      dish,
    });
  }

  return draws;
}
