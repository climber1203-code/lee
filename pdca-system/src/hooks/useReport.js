import { useMemo } from 'react';
import { useDataContext } from '../context/DataContext';
import {
  computeActual,
  isAchieved,
  momChange,
  consecutiveFailMonths,
  computeRankings,
  aggregateToCampusLevel,
  aggregateToHospitalLevel,
  achievementRate,
} from '../utils/calculations';

/**
 * Returns department-level report rows for given month + optional campus filter
 */
export function useDeptReport(month, campus = 'all') {
  const { entries, indicators } = useDataContext();

  return useMemo(() => {
    const monthEntries = entries.filter((e) => e.month === month);
    const filtered = campus === 'all' ? monthEntries : monthEntries.filter((e) => e.campus === campus);

    // compute MoM: find previous month
    const prevMonth = getPrevMonth(month);
    const prevEntries = entries.filter((e) => e.month === prevMonth);

    // compute rankings per baseId
    const baseIds = [...new Set(filtered.map((e) => {
      const ind = indicators.find((i) => i.id === e.indicatorId);
      return ind?.baseId;
    }).filter(Boolean))];

    const rankMap = {};
    baseIds.forEach((baseId) => {
      const subEntries = filtered.filter((e) => {
        const ind = indicators.find((i) => i.id === e.indicatorId);
        return ind?.baseId === baseId;
      });
      const ind0 = indicators.find((i) => i.baseId === baseId);
      if (ind0) {
        const ranked = computeRankings(subEntries, ind0.direction);
        ranked.forEach((re) => { rankMap[re.id] = re.rank; });
      }
    });

    return filtered.map((entry) => {
      const ind = indicators.find((i) => i.id === entry.indicatorId);
      if (!ind) return null;

      const prevEntry = prevEntries.find((e) => e.indicatorId === entry.indicatorId);
      const mom = momChange(entry.actual, prevEntry?.actual ?? null);
      const consec = consecutiveFailMonths(entries, entry.indicatorId, month);

      return {
        ...entry,
        indicatorName: ind.name,
        category: ind.category,
        direction: ind.direction,
        type: ind.type,
        needPublic: ind.needPublic,
        level: '科室',
        momChange: mom,
        rank: rankMap[entry.id] ?? null,
        consecutiveFailMonths: consec,
      };
    }).filter(Boolean);
  }, [entries, indicators, month, campus]);
}

/**
 * Returns campus-level aggregated report rows
 */
export function useCampusReport(month, campus = 'all') {
  const { entries, indicators } = useDataContext();

  return useMemo(() => {
    const monthEntries = entries.filter((e) => e.month === month);
    const filtered = campus === 'all' ? monthEntries : monthEntries.filter((e) => e.campus === campus);

    const prevMonth = getPrevMonth(month);
    const prevEntries = entries.filter((e) => e.month === prevMonth);
    const prevCampus = aggregateToCampusLevel(prevEntries, indicators);

    const campusRows = aggregateToCampusLevel(filtered, indicators);

    return campusRows.map((row) => {
      const prevRow = prevCampus.find((p) => p.campus === row.campus && p.baseId === row.baseId);
      const mom = momChange(row.actual, prevRow?.actual ?? null);
      return {
        ...row,
        indicatorName: row.name,
        level: '院区',
        department: `${row.campus}院区`,
        indicatorId: row.baseId,
        momChange: mom,
        rank: null,
        consecutiveFailMonths: null,
        pdcaReason: '',
        pdcaAction: '',
      };
    });
  }, [entries, indicators, month, campus]);
}

/**
 * Returns hospital-level aggregated report rows
 */
export function useHospitalReport(month) {
  const { entries, indicators } = useDataContext();

  return useMemo(() => {
    const monthEntries = entries.filter((e) => e.month === month);
    const prevMonth = getPrevMonth(month);
    const prevEntries = entries.filter((e) => e.month === prevMonth);
    const prevHosp = aggregateToHospitalLevel(prevEntries, indicators);

    const hospRows = aggregateToHospitalLevel(monthEntries, indicators);

    return hospRows.map((row) => {
      const prevRow = prevHosp.find((p) => p.baseId === row.baseId);
      const mom = momChange(row.actual, prevRow?.actual ?? null);
      return {
        ...row,
        indicatorName: row.name,
        level: '全院',
        department: '全院',
        indicatorId: row.baseId,
        momChange: mom,
        rank: null,
        consecutiveFailMonths: null,
        pdcaReason: '',
        pdcaAction: '',
      };
    });
  }, [entries, indicators, month]);
}

/**
 * Dashboard summary stats for a given month
 */
export function useDashboardStats(month, campus = 'all') {
  const { entries, indicators } = useDataContext();

  return useMemo(() => {
    const monthEntries = entries.filter((e) => e.month === month);
    const filtered = campus === 'all' ? monthEntries : monthEntries.filter((e) => e.campus === campus);

    const total = filtered.length;
    const achievedCount = filtered.filter((e) => e.achieved === true).length;
    const unachievedCount = filtered.filter((e) => e.achieved === false).length;
    const rate = achievementRate(filtered);

    // consecutive fail >= 3
    const criticalCount = filtered.filter((e) => {
      if (e.achieved !== false) return false;
      return consecutiveFailMonths(entries, e.indicatorId, month) >= 3;
    }).length;

    // by campus breakdown
    const fcEntries = monthEntries.filter((e) => e.campus === '府城');
    const xyEntries = monthEntries.filter((e) => e.campus === '秀英');

    // department ranking
    const depts = [...new Set(filtered.map((e) => `${e.campus}|${e.department}`))];
    const deptRankings = depts.map((key) => {
      const [camp, dept] = key.split('|');
      const deptEntries = filtered.filter((e) => e.campus === camp && e.department === dept);
      const dr = achievementRate(deptEntries);
      return {
        campus: camp,
        department: dept,
        total: deptEntries.length,
        achieved: deptEntries.filter((e) => e.achieved === true).length,
        rate: dr,
      };
    }).sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

    // monthly trend (last 6 months)
    const trend = [];
    let m = month;
    for (let i = 0; i < 6; i++) {
      const mEntries = entries.filter((e) => e.month === m);
      const fcRate = achievementRate(mEntries.filter((e) => e.campus === '府城'));
      const xyRate = achievementRate(mEntries.filter((e) => e.campus === '秀英'));
      const allRate = achievementRate(mEntries);
      trend.unshift({ month: m, fcRate, xyRate, allRate });
      m = getPrevMonth(m);
    }

    // category breakdown
    const categories = [...new Set(indicators.map((i) => i.category))];
    const categoryStats = categories.map((cat) => {
      const catEntries = filtered.filter((e) => {
        const ind = indicators.find((i) => i.id === e.indicatorId);
        return ind?.category === cat;
      });
      return {
        category: cat,
        rate: achievementRate(catEntries),
        total: catEntries.length,
      };
    }).filter((c) => c.total > 0);

    return {
      total,
      achievedCount,
      unachievedCount,
      rate,
      criticalCount,
      fcRate: achievementRate(fcEntries),
      xyRate: achievementRate(xyEntries),
      deptRankings,
      trend,
      categoryStats,
    };
  }, [entries, indicators, month, campus]);
}

function getPrevMonth(month) {
  const [y, m] = month.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}
