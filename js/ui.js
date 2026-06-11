// HTML/CSS 叠加层 UI：面板、按钮、弹窗、日志
import { PLAYER_DEFS, RES_ICON, WIN_POINTS } from './config.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor() {
    this.game = null;
    this.currentId = 0;
  }

  bind(game) {
    this.game = game;
    $('btn-roll').addEventListener('click', () => game.onRollClicked());
    $('btn-trade').addEventListener('click', () => game.onTradeClicked());
    $('btn-end').addEventListener('click', () => game.onEndTurnClicked());
  }

  // ---------- 开局设置 ----------
  showSetup() {
    return new Promise((resolve) => {
      const el = $('setup');
      el.classList.remove('hidden');
      const modes = [
        { label: '单人 vs 3 个 AI', humans: 1, total: 4 },
        { label: '2 名本地玩家', humans: 2, total: 2 },
        { label: '3 名本地玩家', humans: 3, total: 3 },
        { label: '4 名本地玩家', humans: 4, total: 4 },
      ];
      const box = $('setup-modes');
      box.innerHTML = '';
      modes.forEach((m) => {
        const btn = document.createElement('button');
        btn.className = 'setup-btn';
        btn.textContent = m.label;
        btn.addEventListener('click', () => {
          el.classList.add('hidden');
          const configs = [];
          for (let i = 0; i < m.total; i++) {
            const isAI = i >= m.humans;
            configs.push({
              ...PLAYER_DEFS[i],
              name: PLAYER_DEFS[i].name + (isAI ? ' (AI)' : ''),
              isAI,
            });
          }
          resolve(configs);
        });
        box.appendChild(btn);
      });
    });
  }

  // ---------- 面板刷新 ----------
  setCurrent(player) { this.currentId = player.id; }

  setButtons({ roll = false, trade = false, end = false } = {}) {
    $('btn-roll').disabled = !roll;
    $('btn-trade').disabled = !trade;
    $('btn-end').disabled = !end;
  }

  refresh() {
    if (!this.game) return;
    const g = this.game;
    // 左侧玩家列表
    const list = $('player-list');
    list.innerHTML = '';
    for (const p of g.players) {
      const div = document.createElement('div');
      div.className = 'player-card' + (p.id === this.currentId ? ' active' : '') + (p.alive ? '' : ' dead');
      div.innerHTML = `
        <div class="pc-head">
          <span class="dot" style="background:${p.css}"></span>
          <span class="pc-name">${p.name}</span>
          ${p.jailed ? '<span class="badge">🚧监禁</span>' : ''}
          ${p.alive ? '' : '<span class="badge">出局</span>'}
        </div>
        <div class="pc-row">${RES_ICON.aiPoints} 积分 <b>${p.resources.aiPoints}</b>/${WIN_POINTS}
          &nbsp; ${RES_ICON.compute}${p.resources.compute} &nbsp; ${RES_ICON.energy}${p.resources.energy}</div>
        <div class="pc-row pc-assets">⚡×${p.assets.power} 🖥️×${p.assets.chip} 🧠×${p.assets.ai}${g.hasSynergy(p) ? ' <span class="syn">🔗联动</span>' : ''}</div>`;
      list.appendChild(div);
    }
    // 右上当前玩家
    const cur = g.players[this.currentId];
    $('current-panel').innerHTML = `
      <div class="cp-title"><span class="dot big" style="background:${cur.css}"></span> 当前回合：${cur.name}</div>
      <div class="cp-res">
        <div class="res compute">${RES_ICON.compute} 算力 <b>${cur.resources.compute}</b></div>
        <div class="res energy">${RES_ICON.energy} 能源 <b>${cur.resources.energy}</b></div>
        <div class="res points">${RES_ICON.aiPoints} AI积分 <b>${cur.resources.aiPoints}</b> / ${WIN_POINTS}</div>
      </div>`;
  }

  log(msg) {
    const box = $('log');
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = msg;
    box.appendChild(line);
    while (box.children.length > 60) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }

  toast(msg, ms = 1400) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    return new Promise((res) => {
      setTimeout(() => { t.classList.remove('show'); res(); }, ms);
    });
  }

  // ---------- 通用模态框 ----------
  _modal(html, buttons) {
    return new Promise((resolve) => {
      const overlay = $('modal-overlay');
      const modal = $('modal');
      modal.innerHTML = html;
      const btnRow = document.createElement('div');
      btnRow.className = 'modal-btns';
      buttons.forEach((b) => {
        const btn = document.createElement('button');
        btn.className = 'modal-btn ' + (b.cls || '');
        btn.textContent = b.label;
        btn.addEventListener('click', () => {
          overlay.classList.add('hidden');
          resolve(b.value);
        });
        btnRow.appendChild(btn);
      });
      modal.appendChild(btnRow);
      overlay.classList.remove('hidden');
    });
  }

  alert(title, text) {
    return this._modal(
      `<h3>${title}</h3><p>${text}</p>`,
      [{ label: '确定', value: true, cls: 'primary' }]
    );
  }

  confirmBuy(player, tile) {
    return this._modal(
      `<h3>${tile.icon} 购买「${tile.name}」？</h3>
       <p>价格：<b>${tile.price}</b> 算力（你当前拥有 ${player.resources.compute} 算力）</p>
       <p class="dim">购买后每回合自动产出，他人停靠需支付过路费。</p>`,
      [
        { label: `购买（-${tile.price} 算力）`, value: true, cls: 'primary' },
        { label: '放弃', value: false },
      ]
    );
  }

  showEventCard(ev, autoMs = 0) {
    if (autoMs > 0) {
      // AI 抽卡：自动展示后关闭
      const overlay = $('modal-overlay');
      const modal = $('modal');
      modal.innerHTML = `<div class="event-card"><div class="ec-tag">事件卡</div><h3>❓ ${ev.name}</h3><p>${ev.desc}</p></div>`;
      overlay.classList.remove('hidden');
      return new Promise((res) => setTimeout(() => { overlay.classList.add('hidden'); res(); }, autoMs));
    }
    return this._modal(
      `<div class="event-card"><div class="ec-tag">事件卡</div><h3>❓ ${ev.name}</h3><p>${ev.desc}</p></div>`,
      [{ label: '确定', value: true, cls: 'primary' }]
    );
  }

  chooseTarget(title, desc, candidates) {
    return this._modal(
      `<h3>${title}</h3><p>${desc}</p>`,
      candidates.map((c) => ({ label: c.name, value: c, cls: 'primary' }))
    );
  }

  confirmTrade(proposer, partner, give, get) {
    return this._modal(
      `<h3>🤝 交易请求</h3>
       <p><b>${partner.name}</b>，${proposer.name} 向你提议：</p>
       <p>你将获得：<b>${give.compute}</b> 算力 + <b>${give.energy}</b> 能源</p>
       <p>你需付出：<b>${get.compute}</b> 算力 + <b>${get.energy}</b> 能源</p>`,
      [
        { label: '接受', value: true, cls: 'primary' },
        { label: '拒绝', value: false },
      ]
    );
  }

  // 交易面板：玩家间交易 或 从银行购买能源
  showTradeDialog(player, partners, bankPrice) {
    return new Promise((resolve) => {
      const overlay = $('modal-overlay');
      const modal = $('modal');
      const partnerOpts = partners.map((q) => `<option value="${q.id}">${q.name}</option>`).join('');
      modal.innerHTML = `
        <h3>🤝 交易阶段</h3>
        <div class="trade-section">
          <h4>玩家间交易</h4>
          ${partners.length === 0 ? '<p class="dim">没有可交易的对手。</p>' : `
          <label>交易对象 <select id="tr-partner">${partnerOpts}</select></label>
          <div class="trade-grid">
            <div><span>我给出</span>
              <label>算力 <input id="tr-gc" type="number" min="0" value="0"></label>
              <label>能源 <input id="tr-ge" type="number" min="0" value="0"></label>
            </div>
            <div><span>我获得</span>
              <label>算力 <input id="tr-rc" type="number" min="0" value="0"></label>
              <label>能源 <input id="tr-re" type="number" min="0" value="0"></label>
            </div>
          </div>
          <p class="dim">提示：AI 按 1 能源 ≈ 1.5 算力 估值，只接受不亏的交易。</p>`}
        </div>
        <div class="trade-section">
          <h4>🏦 银行购能（${bankPrice} 算力 / 1 能源）</h4>
          <label>购买数量 <input id="tr-bank" type="number" min="0" value="0"></label>
        </div>`;
      const btnRow = document.createElement('div');
      btnRow.className = 'modal-btns';
      const mk = (label, cls, fn) => {
        const b = document.createElement('button');
        b.className = 'modal-btn ' + cls;
        b.textContent = label;
        b.addEventListener('click', fn);
        btnRow.appendChild(b);
      };
      const close = (val) => { overlay.classList.add('hidden'); resolve(val); };
      const num = (id) => Math.max(0, Math.floor(Number($(id)?.value || 0)));
      if (partners.length > 0) {
        mk('发起交易', 'primary', () => {
          close({
            type: 'p2p',
            partnerId: Number($('tr-partner').value),
            giveCompute: num('tr-gc'), giveEnergy: num('tr-ge'),
            getCompute: num('tr-rc'), getEnergy: num('tr-re'),
          });
        });
      }
      mk('购买能源', 'primary', () => close({ type: 'bank', amount: num('tr-bank') }));
      mk('取消', '', () => close(null));
      modal.appendChild(btnRow);
      overlay.classList.remove('hidden');
    });
  }

  showWinner(player, reason) {
    const el = $('winner');
    $('winner-text').innerHTML = `
      <div class="dot huge" style="background:${player.css}"></div>
      <h1>🏆 ${player.name} 获胜！</h1>
      <p>${reason}</p>
      <p class="dim">${RES_ICON.aiPoints} AI积分 ${player.resources.aiPoints} ·
        ${RES_ICON.compute} 算力 ${player.resources.compute} ·
        ${RES_ICON.energy} 能源 ${player.resources.energy}</p>`;
    el.classList.remove('hidden');
    $('btn-restart').onclick = () => location.reload();
  }
}
