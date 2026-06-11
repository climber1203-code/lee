// 核心游戏逻辑：回合状态机、格子触发、事件卡、产出、交易、胜负判定
import {
  TILES, EVENTS, WIN_POINTS, START_BONUS,
  BANK_ENERGY_PRICE, TRADEWAR_ENERGY_PRICE, RES_LABEL,
} from './config.js';
import { AI } from './ai.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const rollDie = () => 1 + Math.floor(Math.random() * 6);

export class Game {
  constructor(playerConfigs, scene, ui) {
    this.scene = scene;
    this.ui = ui;
    this.players = playerConfigs.map((c, i) => ({
      id: i,
      name: c.name,
      color: c.color,
      css: c.css,
      isAI: c.isAI,
      position: 0,
      resources: { compute: 5, energy: 3, aiPoints: 0 },
      assets: { power: 0, chip: 0, ai: 0 },
      ownedTiles: [],
      jailed: false,
      jailRemaining: 0,
      alive: true,
      mods: { freeAI: false, greenBoost: false, noEnergyCost: false, strikeNext: false, striking: false },
    }));
    this.tiles = TILES.map((t) => ({ ...t, owner: null }));
    // 全局事件效果，按“玩家回合数”计数（= 存活人数，即持续一整轮）
    this.globalMods = { chipShortage: 0, heatwave: 0, openSource: 0, powerCrisis: 0, marketBubble: 0, tradeWar: 0 };
    this.current = 0;
    this.over = false;
  }

  get currentPlayer() { return this.players[this.current]; }
  alivePlayers() { return this.players.filter((p) => p.alive); }
  opponentsOf(p) { return this.players.filter((q) => q.alive && q.id !== p.id); }
  bankEnergyPrice() { return this.globalMods.tradeWar > 0 ? TRADEWAR_ENERGY_PRICE : BANK_ENERGY_PRICE; }

  hasSynergy(p) {
    return p.assets.power >= 1 && p.assets.chip >= 1 && p.assets.ai >= 1;
  }

  log(msg) { this.ui.log(msg); }

  async run() {
    this.ui.refresh();
    while (!this.over) {
      const p = this.currentPlayer;
      if (p.alive) {
        await this.playTurn(p);
        if (this.over) break;
      }
      this._advance();
    }
  }

  _advance() {
    for (const k of Object.keys(this.globalMods)) {
      if (this.globalMods[k] > 0) this.globalMods[k]--;
    }
    do {
      this.current = (this.current + 1) % this.players.length;
    } while (!this.players[this.current].alive);
  }

  async playTurn(p) {
    this.ui.setCurrent(p);
    this.ui.refresh();
    this.ui.setButtons({});

    // 罢工生效（上回合事件设置）
    if (p.mods.strikeNext) {
      p.mods.striking = true;
      p.mods.strikeNext = false;
    }

    // 监禁：跳过整个回合
    if (p.jailed) {
      this.log(`🚧 ${p.name} 处于监禁状态，跳过本回合。`);
      await this.ui.toast(`${p.name} 被监禁，跳过本回合`, 1400);
      p.jailRemaining--;
      if (p.jailRemaining <= 0) {
        p.jailed = false;
        this.log(`${p.name} 已解除监禁，下回合恢复行动。`);
      }
      this.ui.refresh();
      return;
    }

    // 1. 掷骰阶段
    if (p.isAI) {
      await delay(900);
    } else {
      this.ui.setButtons({ roll: true });
      await new Promise((res) => { this._rollResolve = res; });
      this.ui.setButtons({});
    }
    const d1 = rollDie(), d2 = rollDie();
    const steps = d1 + d2;
    await this.scene.rollDice(d1, d2);
    this.log(`🎲 ${p.name} 掷出 ${d1} + ${d2} = ${steps} 步`);

    // 移动
    const from = p.position;
    const passedStart = from + steps >= 24;
    const path = [];
    for (let s = 1; s <= steps; s++) path.push((from + s) % 24);
    p.position = (from + steps) % 24;
    await this.scene.moveToken(p.id, path);
    if (passedStart) {
      p.resources.compute += START_BONUS;
      this.log(`🏁 ${p.name} 经过起点，获得 ${START_BONUS} 算力。`);
      this.ui.refresh();
    }

    // 2. 格子触发
    await this.tileAction(p, this.tiles[p.position]);
    this.ui.refresh();
    if (this.over || !p.alive) return;
    if (this.checkWin(p)) return;

    // 3. 产出阶段（AI 先按需从银行补充能源）
    if (p.isAI) this._aiBuyEnergyIfNeeded(p);
    this.production(p);
    this.ui.refresh();

    // 5. 胜利判定
    if (this.checkWin(p)) return;

    // 4. 交易阶段（人类玩家可交易/购能/结束；AI 不主动交易）
    if (!p.isAI) {
      this.ui.setButtons({ trade: true, end: true });
      await new Promise((res) => { this._endTurnResolve = res; });
      this.ui.setButtons({});
    } else {
      await delay(700);
    }

    // 清除仅本回合有效的个人效果
    p.mods.striking = false;
    p.mods.greenBoost = false;
    p.mods.noEnergyCost = false;
    p.mods.freeAI = false;
  }

  // UI 按钮回调
  onRollClicked() {
    if (this._rollResolve) { const r = this._rollResolve; this._rollResolve = null; r(); }
  }
  onEndTurnClicked() {
    if (this._endTurnResolve) { const r = this._endTurnResolve; this._endTurnResolve = null; r(); }
  }
  async onTradeClicked() {
    const p = this.currentPlayer;
    const offer = await this.ui.showTradeDialog(p, this.opponentsOf(p), this.bankEnergyPrice());
    if (!offer) return;
    if (offer.type === 'bank') {
      this._buyEnergyFromBank(p, offer.amount);
    } else {
      await this._executeTrade(p, offer);
    }
    this.ui.refresh();
  }

  // AI：若 AI 公司缺能源且算力充裕（保留 4 算力底线），从银行购能补足
  _aiBuyEnergyIfNeeded(p) {
    if (p.assets.ai <= 0 || p.mods.striking) return;
    const need = p.assets.ai * (this.hasSynergy(p) ? 1 : 2);
    const shortfall = need - p.resources.energy;
    if (shortfall <= 0) return;
    const price = this.bankEnergyPrice();
    const affordable = Math.floor((p.resources.compute - 4) / price);
    const amount = Math.min(shortfall, Math.max(0, affordable));
    if (amount > 0) this._buyEnergyFromBank(p, amount);
  }

  _buyEnergyFromBank(p, amount) {
    const price = this.bankEnergyPrice();
    const cost = amount * price;
    if (amount <= 0) return;
    if (p.resources.compute < cost) {
      this.ui.toast('算力不足，无法购买', 1200);
      return;
    }
    p.resources.compute -= cost;
    p.resources.energy += amount;
    this.log(`🏦 ${p.name} 花费 ${cost} 算力从银行购买 ${amount} 能源（单价 ${price}）。`);
  }

  async _executeTrade(p, offer) {
    const partner = this.players[offer.partnerId];
    const give = { compute: offer.giveCompute, energy: offer.giveEnergy };   // p 给出
    const get = { compute: offer.getCompute, energy: offer.getEnergy };      // p 获得
    if (give.compute + give.energy + get.compute + get.energy <= 0) return;
    if (p.resources.compute < give.compute || p.resources.energy < give.energy) {
      await this.ui.alert('交易失败', '你的资源不足以支付给出的部分。');
      return;
    }
    let accepted;
    if (partner.isAI) {
      accepted = AI.acceptTrade(partner, give, get);
    } else {
      if (partner.resources.compute < get.compute || partner.resources.energy < get.energy) {
        await this.ui.alert('交易失败', `${partner.name} 的资源不足。`);
        return;
      }
      accepted = await this.ui.confirmTrade(p, partner, give, get);
    }
    if (!accepted) {
      this.log(`🤝 ${partner.name} 拒绝了 ${p.name} 的交易请求。`);
      await this.ui.toast(`${partner.name} 拒绝了交易`, 1300);
      return;
    }
    p.resources.compute -= give.compute; p.resources.energy -= give.energy;
    partner.resources.compute += give.compute; partner.resources.energy += give.energy;
    partner.resources.compute -= get.compute; partner.resources.energy -= get.energy;
    p.resources.compute += get.compute; p.resources.energy += get.energy;
    this.log(`🤝 交易达成：${p.name} 给出 ${give.compute}算力/${give.energy}能源，换得 ${get.compute}算力/${get.energy}能源（来自 ${partner.name}）。`);
  }

  // ---------- 格子触发 ----------
  async tileAction(p, tile) {
    switch (tile.type) {
      case 'start':
        break; // 起点奖励已在经过时发放
      case 'resource':
        await this._resourceTile(p, tile);
        break;
      case 'jail':
        p.jailed = true;
        p.jailRemaining = 1;
        this.log(`🚧 ${p.name} 进入「${tile.name}」，下回合将被跳过。`);
        await this.ui.toast(`${p.name} 触发${tile.name}，停一回合`, 1500);
        break;
      case 'event':
        await this._drawEvent(p);
        break;
      case 'asset':
        await this._assetTile(p, tile);
        break;
    }
  }

  async _resourceTile(p, tile) {
    if (tile.special === 'fusion') {
      const d = rollDie();
      if (d <= 3) {
        p.resources.energy += 3;
        this.log(`☢️ ${p.name} 在核聚变试验场掷出 ${d}，获得 3 能源！`);
        await this.ui.toast(`核聚变成功（掷出${d}）：+3 能源`, 1600);
      } else {
        p.resources.energy = Math.max(0, p.resources.energy - 1);
        this.log(`☢️ ${p.name} 在核聚变试验场掷出 ${d}，损失 1 能源。`);
        await this.ui.toast(`核聚变失控（掷出${d}）：-1 能源`, 1600);
      }
      return;
    }
    const parts = [];
    for (const [k, v] of Object.entries(tile.gain)) {
      p.resources[k] += v;
      parts.push(`+${v} ${RES_LABEL[k]}`);
    }
    this.log(`💎 ${p.name} 抵达「${tile.name}」：${parts.join('，')}。`);
    await this.ui.toast(`${tile.name}：${parts.join('，')}`, 1400);
  }

  async _assetTile(p, tile) {
    const idx = p.position;
    if (tile.owner === null) {
      // 询问购买
      let buy;
      if (p.isAI) {
        buy = AI.shouldBuy(p, tile);
        await delay(500);
      } else {
        if (p.resources.compute >= tile.price) {
          buy = await this.ui.confirmBuy(p, tile);
        } else {
          await this.ui.toast(`算力不足，无法购买${tile.name}（需 ${tile.price} 算力）`, 1500);
          buy = false;
        }
      }
      if (buy) {
        p.resources.compute -= tile.price;
        tile.owner = p.id;
        p.assets[tile.sub]++;
        p.ownedTiles.push(idx);
        this.scene.setTileOwner(idx, p.color);
        this.log(`🏗️ ${p.name} 以 ${tile.price} 算力购入「${tile.name}」（${idx} 号格）。`);
      }
      return;
    }
    if (tile.owner === p.id) return;

    // 支付过路费
    const owner = this.players[tile.owner];
    if (!tile.toll || !owner.alive) return;
    const [resKey, amount] = Object.entries(tile.toll)[0];
    if (p.resources[resKey] >= amount) {
      p.resources[resKey] -= amount;
      owner.resources[resKey] += amount;
      this.log(`💸 ${p.name} 向 ${owner.name} 支付过路费 ${amount} ${RES_LABEL[resKey]}（${tile.name}）。`);
      await this.ui.toast(`支付过路费：${amount} ${RES_LABEL[resKey]} → ${owner.name}`, 1500);
    } else {
      // 无法足额支付 → 破产退出
      owner.resources[resKey] += p.resources[resKey];
      p.resources[resKey] = 0;
      this.log(`💥 ${p.name} 无法支付 ${amount} ${RES_LABEL[resKey]} 过路费，破产出局！`);
      await this.eliminate(p);
    }
  }

  async eliminate(p) {
    p.alive = false;
    for (const idx of p.ownedTiles) {
      this.tiles[idx].owner = null;
      this.scene.setTileOwner(idx, null);
    }
    p.ownedTiles = [];
    p.assets = { power: 0, chip: 0, ai: 0 };
    this.scene.removeToken(p.id);
    this.ui.refresh();
    await this.ui.alert('💥 破产', `${p.name} 破产退出游戏，名下资产归还银行。`);
    const alive = this.alivePlayers();
    if (alive.length === 1) {
      this.over = true;
      this.ui.showWinner(alive[0], '唯一幸存的科技巨头');
    }
  }

  // ---------- 事件卡 ----------
  async _drawEvent(p) {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    this.log(`❓ ${p.name} 抽到事件卡「${ev.name}」：${ev.desc}`);
    await this.ui.showEventCard(ev, p.isAI ? 1700 : 0);
    await this.applyEvent(ev.id, p);
    this.ui.refresh();
  }

  _roundLength() { return this.alivePlayers().length; }

  async applyEvent(id, p) {
    const g = this.globalMods;
    switch (id) {
      case 1:
        p.resources.energy += 3;
        break;
      case 2: {
        const loss = Math.min(2, p.resources.compute);
        p.resources.compute -= loss;
        this.log(`${p.name} 失去 ${loss} 算力。`);
        break;
      }
      case 3:
        if (p.assets.ai >= 1) {
          p.mods.freeAI = true;
          this.log(`${p.name} 的一个 AI 公司本回合免能源产出。`);
        } else {
          this.log(`${p.name} 没有 AI 公司，事件无效果。`);
        }
        break;
      case 4: g.chipShortage = this._roundLength(); break;
      case 5: g.heatwave = this._roundLength(); break;
      case 6: p.resources.compute += 1; break;
      case 7: g.tradeWar = this._roundLength(); break;
      case 8: g.openSource = this._roundLength(); break;
      case 9:
        if (p.resources.compute >= 2) {
          p.resources.compute -= 2;
          this.log(`${p.name} 支付 2 算力罚款。`);
        } else if (p.ownedTiles.length > 0) {
          const i = p.ownedTiles[Math.floor(Math.random() * p.ownedTiles.length)];
          const tile = this.tiles[i];
          const refund = Math.floor(tile.price / 2);
          tile.owner = null;
          p.ownedTiles = p.ownedTiles.filter((x) => x !== i);
          p.assets[tile.sub]--;
          p.resources.compute += refund;
          this.scene.setTileOwner(i, null);
          this.log(`${p.name} 无力缴纳罚款，半价（${refund} 算力）出售「${tile.name}」给银行。`);
        } else {
          this.log(`${p.name} 既无算力也无资产，罚款不了了之。`);
        }
        break;
      case 10: p.resources.compute += 5; break;
      case 11: {
        const opps = this.opponentsOf(p);
        if (opps.length === 0) break;
        const target = p.isAI ? AI.chooseTarget(opps) : await this.ui.chooseTarget('网络攻击', '选择一名对手，使其失去 2 能源', opps);
        const loss = Math.min(2, target.resources.energy);
        target.resources.energy -= loss;
        this.log(`${p.name} 网络攻击 ${target.name}，其失去 ${loss} 能源。`);
        break;
      }
      case 12:
        p.mods.greenBoost = true;
        this.log(`${p.name} 的发电站本回合额外 +2 能源/座。`);
        break;
      case 13: g.powerCrisis = this._roundLength(); break;
      case 14: {
        let gained = 0;
        for (const q of this.opponentsOf(p)) {
          if (q.assets.chip >= 1 && q.resources.compute >= 1) {
            q.resources.compute -= 1;
            gained += 1;
          }
        }
        p.resources.compute += gained;
        this.log(`${p.name} 通过专利授权获得 ${gained} 算力。`);
        break;
      }
      case 15: g.marketBubble = this._roundLength(); break;
      case 16:
        p.mods.noEnergyCost = true;
        this.log(`${p.name} 本回合免除所有能源消耗。`);
        break;
      case 17:
        for (const q of this.alivePlayers()) {
          const loss = Math.floor(q.resources.energy / 2);
          q.resources.energy -= loss;
          if (loss > 0) this.log(`${q.name} 失去 ${loss} 能源。`);
        }
        break;
      case 18: {
        const gain = p.assets.ai * 2;
        p.resources.compute += gain;
        this.log(`${p.name} 获得 ${gain} 算力（每个 AI 公司 2 算力）。`);
        break;
      }
      case 19:
        p.mods.strikeNext = true;
        this.log(`${p.name} 下回合所有资产不产出。`);
        break;
      case 20:
        p.resources.aiPoints += 1;
        this.log(`${p.name} 获得 1 AI 积分！`);
        break;
    }
  }

  // ---------- 产出阶段 ----------
  production(p) {
    if (p.mods.striking) {
      this.log(`🛑 ${p.name} 员工罢工，本回合所有资产不产出。`);
      return;
    }
    const g = this.globalMods;
    const lines = [];

    // 发电站
    if (p.assets.power > 0) {
      let per = 2 + (p.mods.greenBoost ? 2 : 0) - (g.heatwave > 0 ? 1 : 0);
      per = Math.max(0, per);
      const total = per * p.assets.power;
      p.resources.energy += total;
      if (total > 0) lines.push(`⚡ 发电站 ×${p.assets.power} 产出 ${total} 能源`);
    }
    // 芯片厂
    if (p.assets.chip > 0) {
      let per = Math.max(0, 3 - (g.chipShortage > 0 ? 1 : 0));
      const total = per * p.assets.chip;
      p.resources.compute += total;
      if (total > 0) lines.push(`🖥️ 芯片厂 ×${p.assets.chip} 产出 ${total} 算力`);
    }
    // AI 公司（先扣能源才产出）
    if (p.assets.ai > 0) {
      const synergy = this.hasSynergy(p);
      let baseCost = synergy ? 1 : 2;
      if (g.powerCrisis > 0) baseCost *= 2;
      if (g.openSource > 0) baseCost = Math.max(0, baseCost - 1);
      const outputPer = (synergy ? 2 : 1) * (g.marketBubble > 0 ? 2 : 1);
      let freeOne = p.mods.freeAI;
      let produced = 0, ran = 0;
      for (let i = 0; i < p.assets.ai; i++) {
        let cost = baseCost;
        if (p.mods.noEnergyCost) cost = 0;
        else if (freeOne) { cost = 0; freeOne = false; }
        if (p.resources.energy >= cost) {
          p.resources.energy -= cost;
          p.resources.aiPoints += outputPer;
          produced += outputPer;
          ran++;
        }
      }
      if (ran > 0) {
        lines.push(`🧠 AI公司 ×${ran} 产出 ${produced} 积分${synergy ? '（联动加成！）' : ''}`);
      }
      if (ran < p.assets.ai) {
        lines.push(`⚠️ ${p.assets.ai - ran} 个 AI 公司因能源不足停产`);
      }
    }

    if (lines.length > 0) {
      this.log(`📈 ${p.name} 产出阶段：${lines.join('；')}。`);
    }
  }

  checkWin(p) {
    if (p.resources.aiPoints >= WIN_POINTS) {
      this.over = true;
      this.ui.refresh();
      this.ui.showWinner(p, `率先达成 ${WIN_POINTS} AI 积分`);
      return true;
    }
    return false;
  }
}
