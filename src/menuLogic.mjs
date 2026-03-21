const WINTER_ONLY_MARKER = '（冬日限定）';

function extractSection(markdown, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'u');
  const match = markdown.match(pattern);

  if (!match) {
    throw new Error(`Missing section: ${heading}`);
  }

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, '').trim());
}

export function parseRecipeMarkdown(markdown) {
  return {
    classics: extractSection(markdown, '1. 经典肉类'),
    soups: extractSection(markdown, '2. 汤品'),
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

export function buildCandidates(menu, date = new Date()) {
  const winterMode = isWinterDate(date);
  const classics = menu.classics.map((name) => ({
    name,
    category: 'classic',
    winterOnly: false,
  }));
  const soups = menu.soups
    .map((name) => ({
      name,
      category: 'soup',
      winterOnly: name.includes(WINTER_ONLY_MARKER),
    }))
    .filter((dish) => winterMode || !dish.winterOnly);

  return [...classics, ...soups];
}

function pickOne(items, randomFn) {
  const index = Math.floor(randomFn() * items.length);
  return items[Math.min(index, items.length - 1)];
}

export function drawTwoDishes(candidates, randomFn = Math.random) {
  if (candidates.length < 2) {
    throw new Error('Need at least two candidate dishes');
  }

  const first = pickOne(candidates, randomFn);
  let secondPool = candidates.filter((dish) => dish.name !== first.name);

  if (first.category === 'soup') {
    const nonSoupPool = secondPool.filter((dish) => dish.category !== 'soup');
    if (nonSoupPool.length > 0) {
      secondPool = nonSoupPool;
    }
  }

  if (secondPool.length === 0) {
    throw new Error('No valid second dish available');
  }

  const second = pickOne(secondPool, randomFn);
  return [first, second];
}
