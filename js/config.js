// 《智域争锋·能源纪元》 全局配置：棋盘、事件卡、玩家定义、常量

export const WIN_POINTS = 10;        // 胜利所需 AI 积分
export const START_BONUS = 2;        // 经过/停靠起点获得算力
export const BANK_ENERGY_PRICE = 2;  // 银行基础能源价（算力/能源）
export const TRADEWAR_ENERGY_PRICE = 3;
export const ENERGY_VALUE = 1.5;     // AI 交易估值：1 能源 = 1.5 算力

export const PLAYER_DEFS = [
  { name: '红方', color: 0xff4d4d, css: '#ff4d4d' },
  { name: '蓝方', color: 0x4d9fff, css: '#4d9fff' },
  { name: '绿方', color: 0x4dd97a, css: '#4dd97a' },
  { name: '黄方', color: 0xffd24d, css: '#ffd24d' },
];

// 资产子类型元数据
export const ASSET_META = {
  power: { name: '发电站', icon: '⚡', price: 3, produceDesc: '产出 2 能源/回合' },
  chip:  { name: '芯片厂', icon: '🖥️', price: 5, toll: { compute: 1 }, produceDesc: '产出 3 算力/回合，过路费 1 算力' },
  ai:    { name: 'AI公司', icon: '🧠', price: 6, toll: { energy: 2 }, produceDesc: '消耗 2 能源产出 1 积分，过路费 2 能源' },
};

// 24 格环形棋盘（索引 0~23）
export const TILES = [
  { type: 'start',    name: '起点',        icon: '🏁' },
  { type: 'asset',    sub: 'power' },
  { type: 'event',    name: '事件',        icon: '❓' },
  { type: 'asset',    sub: 'chip' },
  { type: 'resource', name: '数据湖',      icon: '💎', gain: { energy: 1 } },
  { type: 'asset',    sub: 'ai' },
  { type: 'event',    name: '事件',        icon: '❓' },
  { type: 'asset',    sub: 'power' },
  { type: 'jail',     name: '技术审查',    icon: '🚧' },
  { type: 'asset',    sub: 'chip' },
  { type: 'resource', name: '风电场',      icon: '💎', gain: { energy: 2 } },
  { type: 'asset',    sub: 'ai' },
  { type: 'event',    name: '事件',        icon: '❓' },
  { type: 'asset',    sub: 'power' },
  { type: 'asset',    sub: 'chip' },
  { type: 'resource', name: '人才市场',    icon: '💎', gain: { compute: 1 } },
  { type: 'asset',    sub: 'ai' },
  { type: 'event',    name: '事件',        icon: '❓' },
  { type: 'asset',    sub: 'power' },
  { type: 'jail',     name: '专利纠纷',    icon: '🚧' },
  { type: 'asset',    sub: 'chip' },
  { type: 'resource', name: '核聚变试验场', icon: '💎', special: 'fusion' },
  { type: 'asset',    sub: 'ai' },
  { type: 'event',    name: '事件',        icon: '❓' },
].map((t) => {
  if (t.type === 'asset') {
    const m = ASSET_META[t.sub];
    return { ...t, name: m.name, icon: m.icon, price: m.price, toll: m.toll || null };
  }
  return t;
});

// 事件卡（20 张，抽到立即生效，具体效果在 game.js applyEvent 中实现）
export const EVENTS = [
  { id: 1,  name: '能源补贴', desc: '获得 3 能源。' },
  { id: 2,  name: '黑客攻击', desc: '失去 2 算力（不足则失去全部）。' },
  { id: 3,  name: '技术突破', desc: '你的一个 AI 公司本回合不消耗能源即可产出。' },
  { id: 4,  name: '芯片短缺', desc: '所有玩家本回合芯片厂产出 -1（最低 0）。' },
  { id: 5,  name: '热浪来袭', desc: '所有玩家本回合发电站产出 -1（最低 0）。' },
  { id: 6,  name: '人才挖角', desc: '获得 1 算力。' },
  { id: 7,  name: '贸易战',   desc: '下一回合，银行出售能源价格涨至 3 算力/能源。' },
  { id: 8,  name: '开源模型', desc: '所有玩家 AI 公司电费 -1（持续 1 回合）。' },
  { id: 9,  name: '监管罚款', desc: '支付 2 算力给银行；无法支付则随机半价出售一个资产。' },
  { id: 10, name: '风投注资', desc: '获得 5 算力。' },
  { id: 11, name: '网络攻击', desc: '指定一名对手，他失去 2 能源（不足则失去全部）。' },
  { id: 12, name: '绿能革命', desc: '你的所有发电站本回合额外产出 +2 能源。' },
  { id: 13, name: '电力危机', desc: '所有玩家本回合 AI 公司必须支付双倍能源才能产出。' },
  { id: 14, name: '专利授权', desc: '你从每一个拥有芯片厂的对手处获得 1 算力。' },
  { id: 15, name: '市场泡沫', desc: '所有玩家本回合 AI 积分产出翻倍。' },
  { id: 16, name: '破产保护', desc: '本回合你无需支付任何能源消耗（AI 公司仍可产出）。' },
  { id: 17, name: '地缘冲突', desc: '所有玩家失去一半能源（向下取整）。' },
  { id: 18, name: '行业标准', desc: '你每拥有一个 AI 公司，获得 2 算力。' },
  { id: 19, name: '员工罢工', desc: '你下回合所有资产不产出。' },
  { id: 20, name: '量子计算', desc: '立刻获得 1 AI 积分。' },
];

export const RES_LABEL = { compute: '算力', energy: '能源', aiPoints: 'AI积分' };
export const RES_ICON = { compute: '🔷', energy: '⚡', aiPoints: '🟣' };
