// Three.js 2.5D 场景：棋盘、棋子、骰子、动画
import * as THREE from 'three';

const SP = 2.4;          // 地块间距
const TILE_SIZE = 2.1;   // 地块边长
const TILE_H = 0.32;     // 地块厚度

// 地块类型配色（科技感发光）
const TILE_COLORS = {
  start: 0x1f9d6b,
  power: 0x0e8aa0,
  chip: 0x2563eb,
  ai: 0x8b5cf6,
  event: 0xd97706,
  resource: 0xc9a227,
  jail: 0xb91c1c,
};

// 棋子在地块内的站位偏移（最多 4 名玩家）
const TOKEN_OFFSETS = [
  [-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55],
];

// 第 i 格在 7x7 环形网格上的坐标（每边 6 步，共 24 格）
export function tileGrid(i) {
  if (i < 6) return [i, 0];
  if (i < 12) return [6, i - 6];
  if (i < 18) return [6 - (i - 12), 6];
  return [0, 6 - (i - 18)];
}

export function tileWorldPos(i) {
  const [gx, gz] = tileGrid(i);
  return new THREE.Vector3((gx - 3) * SP, 0, (gz - 3) * SP);
}

function makeLabelTexture(icon, name) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '120px serif';
  ctx.fillText(icon, 128, 92);
  ctx.font = 'bold 42px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#eaf2ff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText(name, 128, 196);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDieFaceTexture(value) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f4f7ff';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#aab4cc';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 122, 122);
  ctx.fillStyle = '#1b2440';
  const P = { 1: [[64, 64]], 2: [[36, 36], [92, 92]], 3: [[32, 32], [64, 64], [96, 96]],
    4: [[36, 36], [92, 36], [36, 92], [92, 92]],
    5: [[34, 34], [94, 34], [64, 64], [34, 94], [94, 94]],
    6: [[36, 30], [92, 30], [36, 64], [92, 64], [36, 98], [92, 98]] };
  for (const [x, y] of P[value]) {
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTitleTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const grad = ctx.createLinearGradient(0, 160, 1024, 360);
  grad.addColorStop(0, '#5eead4');
  grad.addColorStop(0.5, '#93c5fd');
  grad.addColorStop(1, '#c4b5fd');
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(120,170,255,0.9)';
  ctx.shadowBlur = 30;
  ctx.font = 'bold 110px "Microsoft YaHei", sans-serif';
  ctx.fillText('智域争锋', 512, 200);
  ctx.font = 'bold 86px "Microsoft YaHei", sans-serif';
  ctx.fillText('能源纪元', 512, 330);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Scene3D {
  constructor(container) {
    this.container = container;
    this.tweens = [];
    this.tokens = new Map();      // playerId -> mesh group
    this.ownerPlates = [];        // 每个地块的归属底座
    this.dice = [];

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b16);
    this.scene.fog = new THREE.Fog(0x070b16, 30, 70);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    // 固定斜 45° 俯视
    this.camera.position.set(0, 17.5, 17.5);
    this.camera.lookAt(0, 0, 0.5);

    const amb = new THREE.AmbientLight(0x8899bb, 0.7);
    this.scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(10, 18, 8);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.left = -14; dir.shadow.camera.right = 14;
    dir.shadow.camera.top = 14; dir.shadow.camera.bottom = -14;
    this.scene.add(dir);
    const pt = new THREE.PointLight(0x66aaff, 60, 40);
    pt.position.set(0, 8, 0);
    this.scene.add(pt);

    // 地面 + 网格
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x0a101f, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);
    const grid = new THREE.GridHelper(120, 60, 0x1d2c4f, 0x14203a);
    grid.position.y = -0.04;
    this.scene.add(grid);

    // 中央标题
    const title = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 4.5),
      new THREE.MeshBasicMaterial({ map: makeTitleTexture(), transparent: true })
    );
    title.rotation.x = -Math.PI / 2;
    title.position.set(0, 0.02, 0);
    this.scene.add(title);

    this._buildDice();
    this._resize();
    window.addEventListener('resize', () => this._resize());

    this.clock = new THREE.Clock();
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this._updateTweens(dt);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  _resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _updateTweens(dt) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.duration);
      tw.onUpdate(k);
      if (k >= 1) {
        this.tweens.splice(i, 1);
        tw.resolve();
      }
    }
  }

  tween(duration, onUpdate) {
    return new Promise((resolve) => {
      this.tweens.push({ t: 0, duration, onUpdate, resolve });
    });
  }

  buildBoard(tiles) {
    tiles.forEach((tile, i) => {
      const pos = tileWorldPos(i);
      const color = TILE_COLORS[tile.type === 'asset' ? tile.sub : tile.type];

      // 归属底座（购买后显示玩家颜色）
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(TILE_SIZE + 0.34, 0.1, TILE_SIZE + 0.34),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
      );
      plate.position.set(pos.x, 0.05, pos.z);
      plate.visible = false;
      this.scene.add(plate);
      this.ownerPlates.push(plate);

      // 地块主体：半透明发光扁立方体
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(TILE_SIZE, TILE_H, TILE_SIZE),
        new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.28,
          transparent: true, opacity: 0.92, roughness: 0.4, metalness: 0.3,
        })
      );
      box.position.set(pos.x, TILE_H / 2 + 0.08, pos.z);
      box.castShadow = true;
      box.receiveShadow = true;
      this.scene.add(box);

      // 发光描边
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(box.geometry),
        new THREE.LineBasicMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.55 })
      );
      edges.position.copy(box.position);
      this.scene.add(edges);

      // 图标 + 名称悬浮标签
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: makeLabelTexture(tile.icon, tile.name), transparent: true })
      );
      sprite.scale.set(1.7, 1.7, 1);
      sprite.position.set(pos.x, 1.45, pos.z);
      this.scene.add(sprite);
    });
  }

  setTileOwner(index, colorHex) {
    const plate = this.ownerPlates[index];
    if (colorHex == null) {
      plate.visible = false;
    } else {
      plate.visible = true;
      plate.material.color.setHex(colorHex);
      plate.material.emissive.setHex(colorHex);
    }
  }

  _tokenPos(playerId, tileIndex) {
    const base = tileWorldPos(tileIndex);
    const [ox, oz] = TOKEN_OFFSETS[playerId % 4];
    return new THREE.Vector3(base.x + ox, 0.42, base.z + oz);
  }

  addToken(playerId, colorHex, tileIndex) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex, emissive: colorHex, emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.4,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.55, 24), mat);
    body.position.y = 0.28;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), mat);
    head.position.y = 0.68;
    head.castShadow = true;
    group.add(body, head);
    group.position.copy(this._tokenPos(playerId, tileIndex));
    this.scene.add(group);
    this.tokens.set(playerId, group);
  }

  removeToken(playerId) {
    const g = this.tokens.get(playerId);
    if (g) {
      this.scene.remove(g);
      this.tokens.delete(playerId);
    }
  }

  // 沿路径逐格跳跃移动
  async moveToken(playerId, path) {
    const g = this.tokens.get(playerId);
    if (!g) return;
    for (const tileIndex of path) {
      const from = g.position.clone();
      const to = this._tokenPos(playerId, tileIndex);
      await this.tween(0.26, (k) => {
        g.position.lerpVectors(from, to, k);
        g.position.y = from.y + Math.sin(k * Math.PI) * 0.7;
      });
      g.position.copy(to);
    }
  }

  _buildDice() {
    // 面材质顺序 [+x,-x,+y,-y,+z,-z] 对应点数 [1,6,2,5,3,4]
    this.dieFaceValues = [1, 6, 2, 5, 3, 4];
    const mats = this.dieFaceValues.map((v) =>
      new THREE.MeshStandardMaterial({ map: makeDieFaceTexture(v), roughness: 0.5 })
    );
    for (let i = 0; i < 2; i++) {
      const die = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mats);
      die.position.set(i === 0 ? -1 : 1, 2.2, 3.2);
      die.castShadow = true;
      die.visible = false;
      this.scene.add(die);
      this.dice.push(die);
    }
  }

  // 把点数 v 转到立方体顶面的欧拉角
  _dieRotationFor(v) {
    switch (v) {
      case 1: return [0, 0, Math.PI / 2];
      case 6: return [0, 0, -Math.PI / 2];
      case 2: return [0, 0, 0];
      case 5: return [Math.PI, 0, 0];
      case 3: return [-Math.PI / 2, 0, 0];
      case 4: return [Math.PI / 2, 0, 0];
    }
  }

  async rollDice(v1, v2) {
    const values = [v1, v2];
    const spins = this.dice.map(() => [
      (4 + Math.random() * 4) * Math.PI,
      (4 + Math.random() * 4) * Math.PI,
      (4 + Math.random() * 4) * Math.PI,
    ]);
    this.dice.forEach((d) => { d.visible = true; d.rotation.set(0, 0, 0); });
    await this.tween(1.0, (k) => {
      const e = 1 - Math.pow(1 - k, 3); // ease-out
      this.dice.forEach((d, i) => {
        d.rotation.set(spins[i][0] * e, spins[i][1] * e, spins[i][2] * e);
        d.position.y = 2.2 + Math.sin(k * Math.PI) * 1.2;
      });
    });
    this.dice.forEach((d, i) => {
      const [rx, ry, rz] = this._dieRotationFor(values[i]);
      d.rotation.set(rx, ry, rz);
      d.position.y = 2.2;
    });
    await this.tween(0.9, () => {});
    this.dice.forEach((d) => { d.visible = false; });
  }
}
