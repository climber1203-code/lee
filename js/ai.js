// 简单 AI 行为
import { ENERGY_VALUE } from './config.js';

export const AI = {
  // 算力足够时 70% 概率购买
  shouldBuy(player, tile) {
    return player.resources.compute >= tile.price && Math.random() < 0.7;
  },

  // 指定对手时优先选择领先玩家（积分高者优先，其次算力高者）
  chooseTarget(candidates) {
    return [...candidates].sort((a, b) =>
      b.resources.aiPoints - a.resources.aiPoints ||
      b.resources.compute - a.resources.compute
    )[0];
  },

  // 交易评估：1 能源 = 1.5 算力（取整后比较），收益 >= 付出 且付得起才接受
  acceptTrade(aiPlayer, receive, pay) {
    if (aiPlayer.resources.compute < pay.compute) return false;
    if (aiPlayer.resources.energy < pay.energy) return false;
    const receiveValue = Math.floor(receive.compute + receive.energy * ENERGY_VALUE);
    const payValue = Math.floor(pay.compute + pay.energy * ENERGY_VALUE);
    return receiveValue >= payValue;
  },
};
