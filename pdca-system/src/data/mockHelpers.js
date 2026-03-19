import indicatorsData from './indicators.json';
import entriesData from './entries.json';

export function getAllIndicators() {
  return indicatorsData;
}

export function getIndicatorById(id) {
  return indicatorsData.find((ind) => ind.id === id);
}

export function getIndicatorsByFilter({ campus, department } = {}) {
  return indicatorsData.filter((ind) => {
    if (campus && campus !== 'all' && ind.campus !== campus) return false;
    if (department && department !== 'all' && ind.department !== department) return false;
    return true;
  });
}

export function getCampuses() {
  return [...new Set(indicatorsData.map((i) => i.campus))].sort();
}

export function getDepartmentsByCampus(campus) {
  if (!campus || campus === 'all') {
    return [...new Set(indicatorsData.map((i) => i.department))].sort();
  }
  return [...new Set(indicatorsData.filter((i) => i.campus === campus).map((i) => i.department))].sort();
}

export function getDefaultEntries() {
  return entriesData;
}

export function getMonthOptions() {
  const months = [];
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      const label = `${y}-${String(m).padStart(2, '0')}`;
      months.push(label);
    }
  }
  return months;
}
