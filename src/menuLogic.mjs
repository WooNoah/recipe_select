import {
  proteinPairWeights,
  defaultProteinPairWeight,
} from './menuConfig.mjs';

const WINTER_ONLY_MARKER = '（冬日限定）';

const KNOWN_SECTION_RULES = {
  经典肉类: {
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
      dish = pickOne(section.items, randomFn);
      classicDish = dish;
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
