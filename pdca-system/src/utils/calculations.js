/**
 * Compute actual value from numerator/denominator
 * @param {number} numerator
 * @param {number} denominator
 * @param {string} type - '比率' | '数量' | '比值'
 */
export function computeActual(numerator, denominator, type) {
  const num = Number(numerator);
  const den = Number(denominator);

  if (isNaN(num)) return null;

  if (type === '数量') {
    return num;
  }

  if (!den || den === 0 || isNaN(den)) return null;
  return num / den;
}

/**
 * Determine if indicator is achieved
 * @param {number} actual
 * @param {number} target
 * @param {string} direction - '越高越好' | '越低越好'
 */
export function isAchieved(actual, target, direction) {
  if (actual === null || actual === undefined) return null;
  if (direction === '越高越好') return actual >= target;
  if (direction === '越低越好') return actual <= target;
  return null;
}

/**
 * Month-over-month change
 * Returns absolute change (current - previous)
 */
export function momChange(current, previous) {
  if (current === null || previous === null || previous === undefined) return null;
  return current - previous;
}

/**
 * Count consecutive non-achieved months ending at currentMonth
 * @param {Array} entries - all entries sorted or filterable
 * @param {string} indicatorId
 * @param {string} currentMonth - 'YYYY-MM'
 */
export function consecutiveFailMonths(entries, indicatorId, currentMonth) {
  // collect all entries for this indicator, sorted by month desc
  const relevant = entries
    .filter((e) => e.indicatorId === indicatorId)
    .sort((a, b) => (a.month > b.month ? -1 : 1));

  // find index of currentMonth
  const startIdx = relevant.findIndex((e) => e.month === currentMonth);
  if (startIdx === -1) return 0;

  let count = 0;
  for (let i = startIdx; i < relevant.length; i++) {
    if (relevant[i].achieved === false) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Compute department rankings for a given base indicator in a month
 * Returns entries with added `rank` field
 * @param {Array} entries - entries filtered to one month and one baseId's sub-indicators
 * @param {string} direction
 */
export function computeRankings(entries, direction) {
  const sorted = [...entries].sort((a, b) => {
    if (a.actual === null) return 1;
    if (b.actual === null) return -1;
    return direction === '越高越好' ? b.actual - a.actual : a.actual - b.actual;
  });
  return sorted.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}

/**
 * Aggregate entries to campus level
 * Groups by baseId, sums numerators and denominators per campus
 */
export function aggregateToCampusLevel(entries, indicators) {
  const map = {};
  entries.forEach((entry) => {
    const ind = indicators.find((i) => i.id === entry.indicatorId);
    if (!ind) return;
    const key = `${entry.month}|${entry.campus}|${ind.baseId}`;
    if (!map[key]) {
      map[key] = {
        month: entry.month,
        campus: entry.campus,
        baseId: ind.baseId,
        name: ind.name,
        category: ind.category,
        direction: ind.direction,
        type: ind.type,
        needPublic: ind.needPublic,
        target: ind.target,
        numeratorSum: 0,
        denominatorSum: 0,
        entries: [],
      };
    }
    map[key].numeratorSum += entry.numerator || 0;
    map[key].denominatorSum += entry.denominator || 0;
    map[key].entries.push(entry);
  });

  return Object.values(map).map((group) => {
    const actual = computeActual(group.numeratorSum, group.denominatorSum, group.type);
    const achieved = isAchieved(actual, group.target, group.direction);
    return {
      ...group,
      actual,
      achieved,
      numerator: group.numeratorSum,
      denominator: group.denominatorSum,
    };
  });
}

/**
 * Aggregate entries to hospital level
 * Groups by baseId only (all campuses)
 */
export function aggregateToHospitalLevel(entries, indicators) {
  const map = {};
  entries.forEach((entry) => {
    const ind = indicators.find((i) => i.id === entry.indicatorId);
    if (!ind) return;
    const key = `${entry.month}|${ind.baseId}`;
    if (!map[key]) {
      map[key] = {
        month: entry.month,
        baseId: ind.baseId,
        name: ind.name,
        category: ind.category,
        direction: ind.direction,
        type: ind.type,
        needPublic: ind.needPublic,
        target: ind.target,
        numeratorSum: 0,
        denominatorSum: 0,
      };
    }
    map[key].numeratorSum += entry.numerator || 0;
    map[key].denominatorSum += entry.denominator || 0;
  });

  return Object.values(map).map((group) => {
    const actual = computeActual(group.numeratorSum, group.denominatorSum, group.type);
    const achieved = isAchieved(actual, group.target, group.direction);
    return {
      ...group,
      actual,
      achieved,
      numerator: group.numeratorSum,
      denominator: group.denominatorSum,
    };
  });
}

/**
 * Compute overall achievement rate for a given array of entries
 * Returns a number 0-1
 */
export function achievementRate(entries) {
  const withData = entries.filter((e) => e.actual !== null && e.actual !== undefined);
  if (!withData.length) return null;
  const achieved = withData.filter((e) => e.achieved === true).length;
  return achieved / withData.length;
}
