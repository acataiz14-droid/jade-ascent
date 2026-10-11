/* ==========================================
   JADE ASCENT: CORE GAME PHYSICS & LOOP
   ========================================== */
import { RunnerEngine } from './runner.js';
import { ArenaEngine, ARENA_CHARACTERS, BOT_DIFFICULTY_PROFILES } from './arena.js';
import { profileManager, DEFAULT_AVATARS, DEFAULT_GOOGLE_CLIENT_ID } from './auth.js';
import { sanctuaryManager } from './sanctuary.js';

window.currentMode = 'climb';
let runnerEngine = null;
let arenaEngine = null;

// Virtual Game Constants
const V_WIDTH = 800;
const V_HEIGHT = 950;

const LEVELS_CONFIG = {
  1: { name: "ด่าน 1: หุบเขาไม้ไผ่ (Bamboo Valley)", heightMeters: 500, emoji: "🎋" },
  2: { name: "ด่าน 2: วิหารลอยฟ้า (Cloud Temple)", heightMeters: 1000, emoji: "☁️" },
  3: { name: "ด่าน 3: เต๋าแห่งจักรวาล (Cosmic Tao)", heightMeters: 1000, emoji: "🌌" },
  4: { name: "ด่าน 4: แดนสวรรค์เบื้องบน (High Heavens)", heightMeters: 800, emoji: "⚡" },
  5: { name: "ด่าน 5: ยอดเขาไร้สิ้นสุด (Infinite Summit)", heightMeters: 1200, emoji: "🐉" },
  9: { name: "ด่านพิเศษ: ด่านของน้องเก้า 🌸🧸", heightMeters: 1000, emoji: "🌸", isSpecial: true },
  10: { name: "ด่านพิเศษ: Worldwide 🌍", heightMeters: 800, emoji: "🌍", isSpecial: true },
  11: { name: "ด่านพิเศษ: เครื่องใช้ไฟฟ้า ⚡🔌", heightMeters: 800, emoji: "⚡", isSpecial: true },
  12: { name: "ด่านพิเศษ: ชีวิตประจำวัน 🌅🏠", heightMeters: 800, emoji: "🌅", isSpecial: true },
  13: { name: "ด่านพิเศษ: งานอดิเรก 🎨⚽🎮", heightMeters: 800, emoji: "🎨", isSpecial: true },
  14: { name: "ด่านพิเศษ: HSK1 - บท 3 📜👨‍🏫🇨🇳", heightMeters: 800, emoji: "📜", isSpecial: true },
  15: { name: "ด่านพิเศษ: คำศัพท์เฉพาะกิจ 📱🪑💻", heightMeters: 2000, emoji: "📱", isSpecial: true },
  16: { name: "ด่านพิเศษ: HSK1 - บท 4 👨‍👩‍👧🏠", heightMeters: 800, emoji: "👨‍👩‍👧", isSpecial: true }
};

let PEAK_HEIGHT = LEVELS_CONFIG[1].heightMeters * 14.5;
let TOTAL_HEIGHT = PEAK_HEIGHT + 500;

// Setup Canvas and Context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Load Background Images
const bgImages = {
  bamboo: new Image(),
  clouds: new Image(),
  cosmic: new Image(),
  heavens: new Image(),
  summit: new Image(),
  worldwide: new Image(),
  appliances: new Image(),
  dailylife: new Image(),
  hobbies: new Image(),
  hsk1_3: new Image(),
  special_items: new Image()
};
bgImages.bamboo.src = 'assets/bg_bamboo.png';
bgImages.clouds.src = 'assets/bg_clouds.png';
bgImages.cosmic.src = 'assets/bg_cosmic.png';
bgImages.heavens.src = 'assets/bg_heavens.png';
bgImages.summit.src = 'assets/bg_summit.png';
bgImages.worldwide.src = 'assets/bg_worldwide.jpg';
bgImages.appliances.src = 'assets/bg_appliances.jpg';
bgImages.dailylife.src = 'assets/bg_dailylife.jpg';
bgImages.hobbies.src = 'assets/bg_hobbies.jpg';
bgImages.hsk1_3.src = 'assets/bg_hsk1_3.jpg';
bgImages.special_items.src = 'assets/bg_special_items.jpg';

const bgLoaded = { bamboo: false, clouds: false, cosmic: false, heavens: false, summit: false, worldwide: false, appliances: false, dailylife: false, hobbies: false, hsk1_3: false, special_items: false };
bgImages.bamboo.onload = () => bgLoaded.bamboo = true;
bgImages.clouds.onload = () => bgLoaded.clouds = true;
bgImages.cosmic.onload = () => bgLoaded.cosmic = true;
bgImages.heavens.onload = () => bgLoaded.heavens = true;
bgImages.summit.onload = () => bgLoaded.summit = true;
bgImages.worldwide.onload = () => bgLoaded.worldwide = true;
bgImages.appliances.onload = () => bgLoaded.appliances = true;
bgImages.dailylife.onload = () => bgLoaded.dailylife = true;
bgImages.hobbies.onload = () => bgLoaded.hobbies = true;
bgImages.hsk1_3.onload = () => bgLoaded.hsk1_3 = true;
bgImages.special_items.onload = () => bgLoaded.special_items = true;

// Master Character Spritesheets configuration for all 6 characters
const CHARACTER_SPRITES = {
  1: { name: 'wind_seeker', idleFrames: 6, runFrames: 8, jumpFrames: 4 },
  2: { name: 'fortune_sage', idleFrames: 5, runFrames: 6, jumpFrames: 4 },
  3: { name: 'turtle_master', idleFrames: 4, runFrames: 6, jumpFrames: 4 },
  4: { name: 'iron_panda', idleFrames: 4, runFrames: 6, jumpFrames: 4 },
  5: { name: 'cloud_monkey', idleFrames: 6, runFrames: 8, jumpFrames: 4 },
  6: { name: 'ink_sage', idleFrames: 4, runFrames: 6, jumpFrames: 4 }
};

for (const id in CHARACTER_SPRITES) {
  const c = CHARACTER_SPRITES[id];
  c.idle = new Image();
  c.idle.src = `assets/char_${c.name}_idle.png`;
  c.run = new Image();
  c.run.src = `assets/char_${c.name}_run.png`;
  c.jump = new Image();
  c.jump.src = `assets/char_${c.name}_jump.png`;
  c.icon = new Image();
  c.icon.src = `assets/char_${c.name}.png`;
  c.icon.onload = () => {
    if (typeof drawAllCharacterPreviews === 'function') {
      drawAllCharacterPreviews();
    }
  };
}

// Helper to draw rounded rectangles
function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Particle System for Juiciness
class Particle {
  constructor(x, y, color, vx, vy, size, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.maxLife = life;
    this.life = life;
  }

  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Platform Class
class Platform {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'normal', 'moving', 'crumbly', 'bouncy', 'slippery', 'spikes'
    
    // Physics fields
    this.vx = 0;
    this.range = 0;
    this.originalX = x;
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.crumbleTimer = 0;
    this.crumbled = false;
    this.respawnTimer = 0;

    // Spikes timing fields (2.5-second periodic cycle - 50% faster)
    this.spikeTimer = Math.random() * 2.5; // Stagger initial timing
    this.spikePeriod = 2.5;
    this.spikesExtended = false;
    this.isSpikeWarning = false;
    this.spikeExtensionHeight = 0;

    if (type === 'moving') {
      this.vx = 1.5 + Math.random() * 2.0;
      this.range = 100 + Math.random() * 150;
    }
  }

  update(dt) {
    if (this.type === 'moving') {
      this.x += this.vx * this.direction * dt * 60;
      if (Math.abs(this.x - this.originalX) > this.range) {
        this.direction *= -1;
        // Keep in screen boundary
        if (this.x < 10) this.x = 10;
        if (this.x + this.width > V_WIDTH - 10) this.x = V_WIDTH - 10 - this.width;
      }
    }

    if (this.type === 'crumbly') {
      if (this.crumbleTimer > 0) {
        this.crumbleTimer += dt;
        if (this.crumbleTimer > 0.4) {
          this.crumbled = true;
          this.crumbleTimer = 0;
          this.respawnTimer = 0.01;
        }
      } else if (this.crumbled) {
        this.respawnTimer += dt;
        if (this.respawnTimer > 2.5) { // Respawn after 2.5s
          this.crumbled = false;
          this.respawnTimer = 0;
        }
      }
    }

    if (this.type === 'spikes') {
      this.spikeTimer = (this.spikeTimer + dt) % this.spikePeriod;
      // 0.0s - 1.5s: Retracted safe phase
      // 1.5s - 1.9s: Warning phase (fast flashing lights, rapid hazard rumble)
      // 1.9s - 2.5s: Extended lethal phase (spikes thrust up)
      if (this.spikeTimer >= 1.9) {
        this.spikesExtended = true;
        this.isSpikeWarning = false;
        this.spikeExtensionHeight = Math.min(1, this.spikeExtensionHeight + dt * 18);
      } else if (this.spikeTimer >= 1.5) {
        this.spikesExtended = false;
        this.isSpikeWarning = true;
        this.spikeExtensionHeight = Math.max(0, this.spikeExtensionHeight - dt * 12);
      } else {
        this.spikesExtended = false;
        this.isSpikeWarning = false;
        this.spikeExtensionHeight = Math.max(0, this.spikeExtensionHeight - dt * 15);
      }
    }
  }

  draw(ctx) {
    if (this.type === 'crumbly' && this.crumbled) return;

    ctx.save();
    
    // 2.5D Geometry dimensions
    // Top surface depth (tilted stepping plane): 7px
    const topDepth = 7;
    
    // 1. SOFT 3D FLOATING SHADOW UNDERNEATH PLATFORM
    if (this.type !== 'crumbly') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + this.height + 6, this.width * 0.48, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (this.type === 'normal') {
      // --- 2.5D BAMBOO & ANCIENT STONE WOOD ---
      // 1. Front Vertical Face (3D Bamboo Cylinder Depth)
      const frontGrad = ctx.createLinearGradient(0, this.y + topDepth, 0, this.y + this.height + 4);
      frontGrad.addColorStop(0, '#5c351b');
      frontGrad.addColorStop(0.6, '#402311');
      frontGrad.addColorStop(1, '#271408');
      ctx.fillStyle = frontGrad;
      ctx.strokeStyle = '#1d0d04';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, this.x, this.y + topDepth, this.width, this.height - topDepth + 4, { tl: 0, tr: 0, bl: 6, br: 6 }, true, true);
      
      // Vertical bamboo segment ridges on front face
      ctx.strokeStyle = 'rgba(20, 10, 4, 0.65)';
      ctx.lineWidth = 2;
      for (let i = 28; i < this.width - 15; i += 35) {
        ctx.beginPath();
        ctx.moveTo(this.x + i, this.y + topDepth);
        ctx.lineTo(this.x + i, this.y + this.height + 4);
        ctx.stroke();
      }

      // 2. Top Stepping Surface (Tilted upper plane)
      const topGrad = ctx.createLinearGradient(0, this.y, 0, this.y + topDepth);
      topGrad.addColorStop(0, '#a5734e');
      topGrad.addColorStop(0.6, '#8d5d3b');
      topGrad.addColorStop(1, '#784c2d');
      ctx.fillStyle = topGrad;
      ctx.strokeStyle = '#4e3321';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, this.x, this.y, this.width, topDepth + 1, { tl: 6, tr: 6, bl: 2, br: 2 }, true, true);

      // Top surface wood grain & highlight
      ctx.strokeStyle = 'rgba(255, 230, 200, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x + 8, this.y + 2);
      ctx.lineTo(this.x + this.width - 8, this.y + 2);
      ctx.stroke();

      // Bamboo joint lines across top surface
      ctx.strokeStyle = 'rgba(78, 51, 33, 0.7)';
      ctx.lineWidth = 1.5;
      for (let i = 28; i < this.width - 15; i += 35) {
        ctx.beginPath();
        ctx.moveTo(this.x + i, this.y + 1);
        ctx.lineTo(this.x + i, this.y + topDepth);
        ctx.stroke();
      }

      // 3. 3D Rope Bindings on Ends (matching 2.5D mockup)
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      drawRoundRect(ctx, this.x + 5, this.y - 1, 5, this.height + 5, 2, true, true);
      drawRoundRect(ctx, this.x + this.width - 10, this.y - 1, 5, this.height + 5, 2, true, true);

    } else if (this.type === 'moving') {
      // --- 2.5D IMPERIAL RED & GOLD PLATFORM ---
      // 1. Front Vertical Face (Rich deep crimson lacquer)
      const frontGrad = ctx.createLinearGradient(0, this.y + topDepth, 0, this.y + this.height + 4);
      frontGrad.addColorStop(0, '#99001a');
      frontGrad.addColorStop(1, '#4a000a');
      ctx.fillStyle = frontGrad;
      ctx.strokeStyle = '#2d0006';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, this.x, this.y + topDepth, this.width, this.height - topDepth + 4, { tl: 0, tr: 0, bl: 6, br: 6 }, true, true);

      // 2. Top Stepping Surface
      const topGrad = ctx.createLinearGradient(0, this.y, 0, this.y + topDepth);
      topGrad.addColorStop(0, '#e11d48');
      topGrad.addColorStop(1, '#be123c');
      ctx.fillStyle = topGrad;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, this.x, this.y, this.width, topDepth + 1, { tl: 6, tr: 6, bl: 2, br: 2 }, true, true);

      // Gold rim line
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x + 4, this.y + 1.5);
      ctx.lineTo(this.x + this.width - 4, this.y + 1.5);
      ctx.stroke();

      // 3D Gold Corner Brackets with rivets
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      drawRoundRect(ctx, this.x + 2, this.y, 10, this.height + 3, 2, true, true);
      drawRoundRect(ctx, this.x + this.width - 12, this.y, 10, this.height + 3, 2, true, true);
      
      // Center gold rosette
      const cx = this.x + this.width / 2;
      ctx.beginPath();
      ctx.arc(cx, this.y + this.height / 2 + 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (this.type === 'crumbly') {
      // --- 2.5D VOLUMETRIC FLUFFY CLOUD ---
      let alpha = 0.9;
      if (this.crumbleTimer > 0) {
        alpha = Math.max(0.1, 0.9 * (1 - this.crumbleTimer / 0.4));
      }
      ctx.save();
      ctx.globalAlpha = alpha;

      // Soft underside shadow puff
      ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
      const r = this.height * 0.65;
      const numPuffs = 4;
      const segW = this.width / (numPuffs - 1);
      for (let i = 0; i < numPuffs; i++) {
        const px = this.x + i * segW;
        ctx.beginPath();
        ctx.arc(px, this.y + this.height + 1, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main cloud body puffs
      const cloudGrad = ctx.createLinearGradient(0, this.y - 4, 0, this.y + this.height);
      cloudGrad.addColorStop(0, '#ffffff');
      cloudGrad.addColorStop(0.6, '#f0f9ff');
      cloudGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = cloudGrad;
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(this.x + r * 0.7, this.y + r - 2, r * 0.8, 0.5 * Math.PI, 1.5 * Math.PI);
      for (let i = 0; i < numPuffs; i++) {
        const px = this.x + (i + 0.5) * (this.width / numPuffs);
        const py = this.y + (i % 2 === 0 ? -4 : -2);
        ctx.arc(px, py, r + (i === 1 || i === 2 ? 3 : 0), Math.PI, 0);
      }
      ctx.arc(this.x + this.width - r * 0.7, this.y + r - 2, r * 0.8, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top sunlight highlight rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 8, this.y - 2);
      ctx.lineTo(this.x + this.width - 8, this.y - 2);
      ctx.stroke();

      ctx.restore();

    } else if (this.type === 'bouncy') {
      // --- 2.5D TRADITIONAL CHINESE WAR DRUM ---
      // 1. Curved Red Drum Barrel (Front Face)
      const drumGrad = ctx.createLinearGradient(0, this.y + topDepth, 0, this.y + this.height + 4);
      drumGrad.addColorStop(0, '#b91c1c');
      drumGrad.addColorStop(0.5, '#dc2626');
      drumGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = drumGrad;
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, this.x, this.y + topDepth, this.width, this.height - topDepth + 4, { tl: 0, tr: 0, bl: 8, br: 8 }, true, true);

      // 3D Golden Studs around drum barrel
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      for (let i = 12; i < this.width - 8; i += 18) {
        ctx.beginPath();
        ctx.arc(this.x + i, this.y + this.height + 1, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 2. Golden Drumhead (Top Stepping Surface)
      const skinGrad = ctx.createLinearGradient(0, this.y, 0, this.y + topDepth);
      skinGrad.addColorStop(0, '#fef08a');
      skinGrad.addColorStop(0.6, '#fde047');
      skinGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = skinGrad;
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, this.x + 2, this.y, this.width - 4, topDepth + 1, 4, true, true);

      // Drumhead acoustic resonance ring
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + topDepth / 2 + 0.5, this.width * 0.35, (topDepth / 2) * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else if (this.type === 'slippery') {
      // --- 2.5D TRANSLUCENT FACETED JADE ICE ---
      // 1. Front Faceted Glass Face
      const iceGrad = ctx.createLinearGradient(0, this.y + topDepth, 0, this.y + this.height + 4);
      iceGrad.addColorStop(0, 'rgba(6, 95, 70, 0.85)');
      iceGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.75)');
      iceGrad.addColorStop(1, 'rgba(4, 120, 87, 0.9)');
      ctx.fillStyle = iceGrad;
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, this.x, this.y + topDepth, this.width, this.height - topDepth + 4, { tl: 0, tr: 0, bl: 5, br: 5 }, true, true);

      // Internal 3D crystal refraction facets
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 20; i < this.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(this.x + i, this.y + topDepth);
        ctx.lineTo(this.x + i - 8, this.y + this.height + 4);
        ctx.stroke();
      }

      // 2. Top Ice Plane (Glossy reflective surface)
      const topIce = ctx.createLinearGradient(0, this.y, 0, this.y + topDepth);
      topIce.addColorStop(0, '#a7f3d0');
      topIce.addColorStop(0.7, '#6ee7b7');
      topIce.addColorStop(1, '#34d399');
      ctx.fillStyle = topIce;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, this.x, this.y, this.width, topDepth + 1, 4, true, true);

      // Specular glare line across surface
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(this.x + 8, this.y + 2, this.width * 0.45, 1.5);

    } else if (this.type === 'spikes') {
      // --- 2.5D MECHANICAL TIMED SPIKE PLATFORM ---
      let jitterX = 0;
      let jitterY = 0;
      if (this.isSpikeWarning) {
        jitterX = (Math.random() - 0.5) * 2;
        jitterY = (Math.random() - 0.5) * 1.5;
      }

      const platX = this.x + jitterX;
      const platY = this.y + jitterY;

      // 1. Front Depth Face (Heavy Obsidian & Steel Slab)
      const slabGrad = ctx.createLinearGradient(0, platY + topDepth, 0, platY + this.height + 4);
      slabGrad.addColorStop(0, '#1e293b');
      slabGrad.addColorStop(0.5, '#0f172a');
      slabGrad.addColorStop(1, '#020617');
      ctx.fillStyle = slabGrad;
      ctx.strokeStyle = this.spikesExtended ? '#ef4444' : this.isSpikeWarning ? '#f59e0b' : '#475569';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, platX, platY + topDepth, this.width, this.height - topDepth + 4, { tl: 0, tr: 0, bl: 4, br: 4 }, true, true);

      // Warning hazard indicator lamps along the front face
      const slotCount = Math.max(2, Math.floor(this.width / 22));
      const slotSpacing = this.width / slotCount;
      for (let i = 0; i < slotCount; i++) {
        const slotX = platX + slotSpacing * (i + 0.5);
        const slotY = platY + topDepth + 4;
        ctx.fillStyle = this.spikesExtended ? '#ef4444' : (this.isSpikeWarning && (Math.floor(Date.now() / 120) % 2 === 0) ? '#f59e0b' : '#334155');
        ctx.fillRect(slotX - 3, slotY, 6, 4);
      }

      // 2. Top Stepping Plane (Brushed Iron with Grate Slots)
      const topIron = ctx.createLinearGradient(0, platY, 0, platY + topDepth);
      topIron.addColorStop(0, '#475569');
      topIron.addColorStop(0.7, '#334155');
      topIron.addColorStop(1, '#1e293b');
      ctx.fillStyle = topIron;
      ctx.strokeStyle = this.spikesExtended ? '#dc2626' : this.isSpikeWarning ? '#d97706' : '#64748b';
      ctx.lineWidth = 1.8;
      drawRoundRect(ctx, platX, platY, this.width, topDepth + 1, 4, true, true);

      // Grate slot indentations on the top surface
      for (let i = 0; i < slotCount; i++) {
        const slotX = platX + slotSpacing * (i + 0.5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(slotX - 4, platY + 2, 8, 3.5);
      }

      // 3. 2.5D Spikes (Extend upwards from slots)
      if (this.spikeExtensionHeight > 0.05) {
        const maxSpikeH = 15;
        const curSpikeH = maxSpikeH * this.spikeExtensionHeight;
        
        for (let i = 0; i < slotCount; i++) {
          const spikeBaseX = platX + slotSpacing * (i + 0.5);
          const spikeTipY = platY + 2 - curSpikeH;
          const spikeBaseY = platY + 3;

          // Red danger aura behind spikes when fully extended
          if (this.spikesExtended) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
            ctx.beginPath();
            ctx.arc(spikeBaseX, spikeTipY, 5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Left facet (Darker steel)
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(spikeBaseX, spikeTipY);
          ctx.lineTo(spikeBaseX - 4, spikeBaseY);
          ctx.lineTo(spikeBaseX, spikeBaseY);
          ctx.closePath();
          ctx.fill();

          // Right facet (Polished steel reflection)
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(spikeBaseX, spikeTipY);
          ctx.lineTo(spikeBaseX, spikeBaseY);
          ctx.lineTo(spikeBaseX + 4, spikeBaseY);
          ctx.closePath();
          ctx.fill();

          // Sharp spike outline & tip gleam
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(spikeBaseX - 4, spikeBaseY);
          ctx.lineTo(spikeBaseX, spikeTipY);
          ctx.lineTo(spikeBaseX + 4, spikeBaseY);
          ctx.stroke();

          // Glint at spike tip
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(spikeBaseX - 0.5, spikeTipY - 1, 1, 2);
        }
      }
    }

    ctx.restore();
  }
}

// Jade Shard Class (Collectible)
class JadeShard {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 18;
    this.height = 24;
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.bobOffset += dt * 3;
  }

  draw(ctx) {
    if (this.collected) return;
    
    ctx.save();
    
    // Smooth floating bobbing animation
    const yOffset = Math.sin(this.bobOffset) * 6;
    const cx = this.x + 9;
    const cy = this.y + 12 + yOffset;
    const spin = this.bobOffset * 2.6;
    const spinCos = Math.cos(spin);
    
    // 1. Floating 2.5D perspective drop shadow beneath crystal
    const shadowScale = 1 - (yOffset / 18);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, this.y + 27, 8 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Glowing celestial jade halo
    const glowRad = 16 + Math.sin(this.bobOffset * 1.8) * 3;
    const haloGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, glowRad);
    haloGrad.addColorStop(0, 'rgba(52, 211, 153, 0.55)');
    haloGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
    ctx.fill();

    // 3. 2.5D Spinning Faceted Crystal Gemstone
    const halfW = 9.5;
    const halfH = 13.5;
    const ridgeX = cx + spinCos * halfW;
    const topY = cy - halfH;
    const botY = cy + halfH;
    const leftX = cx - halfW;
    const rightX = cx + halfW;
    const midY = cy + Math.sin(spin) * 1.5;

    // Left Facet (Ambient / Reflected side)
    const leftLight = 0.5 + 0.4 * (-spinCos);
    const leftGrad = ctx.createLinearGradient(leftX, topY, ridgeX, botY);
    leftGrad.addColorStop(0, '#065f46');
    leftGrad.addColorStop(0.5, `rgb(${Math.floor(16 * leftLight)}, ${Math.floor(185 * leftLight)}, ${Math.floor(129 * leftLight)})`);
    leftGrad.addColorStop(1, '#047857');
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(leftX, midY);
    ctx.lineTo(cx, botY);
    ctx.lineTo(ridgeX, midY);
    ctx.closePath();
    ctx.fill();

    // Right Facet (Key Light / Specular side)
    const rightLight = 0.5 + 0.45 * spinCos;
    const rightGrad = ctx.createLinearGradient(ridgeX, topY, rightX, botY);
    rightGrad.addColorStop(0, '#10b981');
    rightGrad.addColorStop(0.5, `rgb(${Math.floor(52 * (0.6 + 0.4 * rightLight))}, ${Math.floor(211 * (0.6 + 0.4 * rightLight))}, ${Math.floor(153 * (0.6 + 0.4 * rightLight))})`);
    rightGrad.addColorStop(1, '#059669');
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(ridgeX, midY);
    ctx.lineTo(cx, botY);
    ctx.lineTo(rightX, midY);
    ctx.closePath();
    ctx.fill();

    // 4. Center 3D Facet Ridge Line (Sharp reflection highlight)
    ctx.strokeStyle = Math.abs(spinCos) < 0.35 ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(ridgeX, midY);
    ctx.lineTo(cx, botY);
    ctx.stroke();

    // 5. Outer Golden Bevel Rim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(rightX, midY);
    ctx.lineTo(cx, botY);
    ctx.lineTo(leftX, midY);
    ctx.closePath();
    ctx.stroke();

    // 6. Specular Glint Star when facet rotates towards screen
    const glintPhase = Math.sin(spin * 2);
    if (glintPhase > 0.82) {
      const glintAlpha = (glintPhase - 0.82) / 0.18;
      const glintX = ridgeX;
      const glintY = midY - 2;
      ctx.save();
      ctx.globalAlpha = glintAlpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(glintX - 4, glintY);
      ctx.lineTo(glintX + 4, glintY);
      ctx.moveTo(glintX, glintY - 4);
      ctx.lineTo(glintX, glintY + 4);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(glintX, glintY, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Small 2.5D Orbiting Jade Sparkle Particle
    const orbAng = spin * 1.3;
    const orbX = cx + Math.cos(orbAng) * 14;
    const orbY = cy + Math.sin(orbAng) * 6;
    const orbScale = 0.8 + Math.sin(orbAng) * 0.4;
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.arc(orbX, orbY, 1.5 * orbScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Gong Checkpoint Class
class Checkpoint {
  constructor(x, y, isFinish = false) {
    this.x = x;
    this.y = y;
    this.width = isFinish ? 120 : 60;
    this.height = isFinish ? 110 : 70;
    this.active = false;
    this.glowPulse = 0;
    this.isFinish = isFinish;
  }

  update(dt) {
    if (this.active) {
      this.glowPulse += dt * 5;
    }
  }

  draw(ctx) {
    if (this.isFinish) {
      ctx.save();
      
      // Golden celestial glow
      const glowAmt = 12 + Math.sin(Date.now() / 200) * 4;
      ctx.shadowBlur = glowAmt;
      ctx.shadowColor = '#ffd700';

      // 1. Pillars (Crimson painted columns)
      ctx.fillStyle = '#c8102e';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      
      // Left pillar
      ctx.fillRect(this.x + 12, this.y + 25, 14, this.height - 25);
      ctx.strokeRect(this.x + 12, this.y + 25, 14, this.height - 25);
      // Right pillar
      ctx.fillRect(this.x + this.width - 26, this.y + 25, 14, this.height - 25);
      ctx.strokeRect(this.x + this.width - 26, this.y + 25, 14, this.height - 25);
      
      // Rainbow Base Plate (ฐานสีรุ้งเรืองแสงใต้เสาซุ้มประตูเส้นชัย)
      const rainbowGrad = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
      rainbowGrad.addColorStop(0, '#ff0000');   // Red
      rainbowGrad.addColorStop(0.17, '#ff7f00'); // Orange
      rainbowGrad.addColorStop(0.33, '#ffff00'); // Yellow
      rainbowGrad.addColorStop(0.5, '#00ff00');  // Green
      rainbowGrad.addColorStop(0.67, '#0000ff'); // Blue
      rainbowGrad.addColorStop(0.83, '#4b0082'); // Indigo
      rainbowGrad.addColorStop(1, '#9400d3');    // Violet
      
      ctx.fillStyle = rainbowGrad;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.rect(this.x - 8, this.y + this.height - 12, this.width + 16, 12);
      ctx.fill();
      ctx.stroke();

      // 2. Transom Beam (Crimson crossbeam)
      ctx.fillStyle = '#c8102e';
      ctx.fillRect(this.x + 4, this.y + 20, this.width - 8, 8);
      ctx.strokeRect(this.x + 4, this.y + 20, this.width - 8, 8);

      // 3. Imperial Chinese Roof (Curved and layered gold/red)
      ctx.fillStyle = '#c8102e';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 20);
      ctx.lineTo(this.x + this.width, this.y + 20);
      ctx.lineTo(this.x + this.width - 8, this.y + 10);
      ctx.lineTo(this.x + 8, this.y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top golden curved tile roof
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(this.x - 6, this.y + 10);
      ctx.quadraticCurveTo(this.x + this.width / 2, this.y - 8, this.x + this.width + 6, this.y + 10);
      ctx.lineTo(this.x + this.width - 12, this.y + 3);
      ctx.quadraticCurveTo(this.x + this.width / 2, this.y - 12, this.x + 12, this.y + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Center Signboard / Plaque (glowing tablet)
      ctx.fillStyle = '#11151c';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.fillRect(this.x + this.width / 2 - 38, this.y + 12, 76, 17);
      ctx.strokeRect(this.x + this.width / 2 - 38, this.y + 12, 76, 17);
      
      // Plaque Text
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 9px var(--font-body)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ประตูสวรรค์ / เส้นชัย', this.x + this.width / 2, this.y + 21);

      // 5. Hanging Chinese Lanterns (glowing red bulbs)
      ctx.fillStyle = '#ff2b2b';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      // Left lantern
      ctx.beginPath();
      ctx.arc(this.x + 28, this.y + 42, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Right lantern
      ctx.beginPath();
      ctx.arc(this.x + this.width - 28, this.y + 42, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 6. Giant Yin-Yang background glow in the gateway path
      ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + 65, 26, 0, Math.PI * 2);
      ctx.fill();

      // 7. Floating FINISH label
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd700';
      ctx.font = 'bold 15px var(--font-title)';
      ctx.fillText('FINISH / เส้นชัย', this.x + this.width / 2, this.y - 18);

      ctx.restore();
      return;
    }

    ctx.save();
    
    // Draw Frame (Traditional Torii structure)
    ctx.strokeStyle = '#c8102e';
    ctx.lineWidth = 4;
    
    // Pillars
    ctx.beginPath();
    ctx.moveTo(this.x + 8, this.y + this.height);
    ctx.lineTo(this.x + 8, this.y + 15);
    ctx.moveTo(this.x + this.width - 8, this.y + this.height);
    ctx.lineTo(this.x + this.width - 8, this.y + 15);
    ctx.stroke();
    
    // Roof Beam
    ctx.fillStyle = '#c8102e';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + 15);
    ctx.lineTo(this.x + this.width, this.y + 15);
    ctx.lineTo(this.x + this.width - 5, this.y + 5);
    ctx.lineTo(this.x + 5, this.y + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gold decorative top
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x + this.width / 2 - 6, this.y, 12, 5);

    // Draw hanging ropes
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + 20, this.y + 15);
    ctx.lineTo(this.x + 22, this.y + 30);
    ctx.moveTo(this.x + this.width - 20, this.y + 15);
    ctx.lineTo(this.x + this.width - 22, this.y + 30);
    ctx.stroke();

    // Glowing active aura
    if (this.active) {
      const glowAmt = 8 + Math.sin(this.glowPulse) * 4;
      ctx.shadowBlur = glowAmt;
      ctx.shadowColor = '#ffd700';
    }

    // Gong Disc
    ctx.fillStyle = this.active ? '#ffd700' : '#d2b48c'; // Golden active / Tan passive
    ctx.strokeStyle = this.active ? '#ccac00' : '#8b7355';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 40, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central symbol (Yin-Yang or Dot)
    ctx.fillStyle = this.active ? '#c8102e' : '#5c4033';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 40, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Game State Class
class GameState {
  constructor() {
    this.state = 'MENU'; // MENU, PLAYING, WIN
    this.jadeCount = 0;
    this.altitude = 0;
    
    // Upgrade Level Data
    this.upgrades = {
      jump: 0,
      speed: 0,
      doublejump: 0,
      float: 0,
      shooting: 0
    };

    // Upgrade costs base and multipliers
    this.upgradeCosts = {
      jump: { base: 10, mult: 1.5, max: 5 },
      speed: { base: 15, mult: 1.5, max: 5 },
      doublejump: { base: 35, mult: 1.6, max: 5 },
      float: { base: 30, mult: 1.6, max: 5 },
      shooting: { base: 30, mult: 1, max: 2, fixedCosts: [30, 50] }
    };
    
    this.platforms = [];
    this.shards = [];
    this.checkpoints = [];
    this.projectiles = [];
    this.particles = [];
    
    this.lastCheckpointX = V_WIDTH / 2 - 20;
    this.lastCheckpointY = -140; // Default: start pad top
    
    this.shopOpen = false;
    this.currentLevel = 1;
    this.lastQuestionClearedHeight = 0; // The highest 50m milestone cleared
    this.currentQuestionMilestone = 0;  // The milestone currently being attempted
    this.askedQuestionIds = new Set();  // Set of asked question IDs to prevent repetition
    this.isQuestionActive = false;
    this.selectedCharacter = 1; // 1 to 5
  }

  getCost(type) {
    const config = this.upgradeCosts[type];
    const lvl = this.upgrades[type];
    let max = config.max;
    if (type === 'jump' && this.selectedCharacter === 1) {
      max = 3;
    }
    if (lvl >= max) return 'MAX';
    // Fixed costs for shooting upgrade
    if (config.fixedCosts) {
      let cost = config.fixedCosts[lvl];
      if (this.selectedCharacter === 5) cost = Math.floor(cost * 0.8);
      return cost;
    }
    let cost = Math.floor(config.base * Math.pow(config.mult, lvl));
    if (this.selectedCharacter === 5) {
      cost = Math.floor(cost * 0.8);
    }
    return cost;
  }

  buyUpgrade(type) {
    const cost = this.getCost(type);
    if (cost === 'MAX' || this.jadeCount < cost) return false;
    
    if (!profileManager.spendJade(cost)) return false;

    this.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (this.jadeCount - cost);
    this.upgrades[type]++;
    profileManager.updateProgress({ upgrades: { ...this.upgrades } });
    
    updateHUD();
    updateShopUI();
    return true;
  }

  buyHeart() {
    let cost = 15;
    if (this.selectedCharacter === 5) {
      cost = Math.floor(cost * 0.8);
    }
    if (this.jadeCount < cost || player.health >= player.maxHealth) return false;
    
    if (!profileManager.spendJade(cost)) return false;

    this.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (this.jadeCount - cost);
    player.health++;
    
    updateHUD();
    updateShopUI();
    return true;
  }
}

const game = new GameState();

// Player Entity
const player = {
  x: V_WIDTH / 2 - 20,
  y: -140, // Negative goes up, start resting on starting platform top
  vx: 0,
  vy: 0,
  width: 40,
  height: 40,
  grounded: false,
  health: 5,
  maxHealth: 5,
  highestY: -140,
  jumpCount: 0,
  maxJumps: 2,
  doubleJumpCooldownTimer: 0,
  tripleJumpCooldownTimer: 0,
  jumpAnticipationTimer: 0, // Quick crouch anticipation before leaping
  facingLeft: false,
  squashX: 1,
  squashY: 1,
  runCycle: 0,
  invincibleTimer: 0,
  shootCooldown: 0,

  // Base parameters (Levels will add multipliers)
  baseJumpVel: -11.5,
  baseSpeed: 5.2,
  baseGravity: 0.42,

  reset() {
    this.x = V_WIDTH / 2 - 20;
    this.y = -140;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    // Character 3 (อายุยืน) starts with 10 max health, Character 6 (เซียนพู่กัน) starts with 6, others 5
    // Pet Bonus: Spirit Turtle gives +1 starting Max HP
    let petHp = 0;
    const activeProf = profileManager.getActiveProfile();
    if (activeProf && activeProf.sanctuary && activeProf.sanctuary.activePet === 'turtle') {
      petHp = 1;
    }
    this.maxHealth = ((game.selectedCharacter === 3) ? 10 : (game.selectedCharacter === 6 ? 6 : 5)) + petHp;
    this.health = this.maxHealth;
    this.highestY = -140;
    this.jumpCount = 0;
    // Character 1 (วายุ) gets 3 jumps, others have 2
    this.maxJumps = (game.selectedCharacter === 1) ? 3 : 2;
    this.doubleJumpCooldownTimer = 0;
    this.tripleJumpCooldownTimer = 0;
    this.squashX = 1;
    this.squashY = 1;
    this.invincibleTimer = 0;
    this.shootCooldown = 0;
  },

  getDoubleJumpCooldownMax() {
    // Cooldown scales down as they upgrade:
    // Lv 0: 5.0s, Lv 1: 3.8s, Lv 2: 2.6s, Lv 3: 1.6s, Lv 4: 0.8s, Lv 5: 0.0s (instant!)
    const cd = [5.0, 3.8, 2.6, 1.6, 0.8, 0.0];
    return cd[game.upgrades.doublejump] !== undefined ? cd[game.upgrades.doublejump] : 5.0;
  },

  getTripleJumpCooldownMax() {
    // 3rd jump cooldown is 50% longer than double jump cooldown
    return this.getDoubleJumpCooldownMax() * 1.5;
  },

  getJumpVel() {
    // Each level increases jump power by 8% (Character 6 gets +14% spring jump bonus!)
    const charMult = (game.selectedCharacter === 6) ? 1.14 : 1.0;
    // Pet Bonus: Celestial Crane gives +12% jump height
    let petMult = 1.0;
    const activeProf = profileManager.getActiveProfile();
    if (activeProf && activeProf.sanctuary && activeProf.sanctuary.activePet === 'crane') {
      petMult = 1.12;
    }
    return this.baseJumpVel * (1 + game.upgrades.jump * 0.08) * charMult * petMult;
  },

  getSpeed() {
    // Each level increases speed by 10%
    return this.baseSpeed * (1 + game.upgrades.speed * 0.10);
  },

  getGravity() {
    // Each level of float talisman reduces gravity by 8% (falling lighter)
    return this.baseGravity * (1 - game.upgrades.float * 0.08);
  },

  update(dt, keys) {
    // Choose parameters
    const moveSpeed = this.getSpeed();
    const gravity = this.getGravity();
    const friction = this.grounded ? 0.76 : 0.88; // Lower is slidey-er

    // Active platform type changes friction
    let targetFriction = friction;
    let standingOnPlatform = this.getStandingPlatform();
    if (standingOnPlatform && standingOnPlatform.type === 'slippery') {
      targetFriction = 0.98; // Very slippery jade ice!
    }

    // Direction input
    let dir = 0;
    if (keys['a'] || keys['arrowleft'] || keys['ArrowLeft'] || keys['KeyA'] || activeMobileControls.left) {
      dir = -1;
      this.facingLeft = true;
    } else if (keys['d'] || keys['arrowright'] || keys['ArrowRight'] || keys['KeyD'] || activeMobileControls.right) {
      dir = 1;
      this.facingLeft = false;
    }

    // Horizontal acceleration
    const accel = this.grounded ? 1.0 : 0.5; // Responsive start acceleration
    this.vx += dir * accel * dt * 60;
    this.vx *= Math.pow(targetFriction, dt * 60);

    // Clamp horizontal velocity to moveSpeed
    if (this.vx > moveSpeed) this.vx = moveSpeed;
    if (this.vx < -moveSpeed) this.vx = -moveSpeed;

    // Gravity
    this.vy += gravity * dt * 60;
    
    // Cap vertical speed to avoid passing through thin platforms
    if (this.vy > 15) this.vy = 15;

    // Movement resolution
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    // Screen boundary wrap or stop
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    } else if (this.x + this.width > V_WIDTH) {
      this.x = V_WIDTH - this.width;
      this.vx = 0;
    }

    // Character squash animation bounce back to 1
    this.squashX += (1 - this.squashX) * 0.15;
    this.squashY += (1 - this.squashY) * 0.15;

    // Running animation rotation cycle
    if (Math.abs(this.vx) > 0.5 && this.grounded) {
      this.runCycle += Math.abs(this.vx) * 0.25;
    } else {
      this.runCycle = 0;
    }

    // Spawn walking particles
    if (this.grounded && Math.abs(this.vx) > 1 && Math.random() < 0.15) {
      game.particles.push(
        new Particle(
          this.x + this.width/2 - this.vx * 2,
          this.y + this.height,
          'rgba(255,255,255,0.4)',
          -this.vx * 0.1,
          -Math.random() * 0.5,
          2 + Math.random() * 3,
          0.3 + Math.random() * 0.2
        )
      );
    }
    // Decrement double jump cooldown
    if (this.doubleJumpCooldownTimer > 0) {
      this.doubleJumpCooldownTimer -= dt;
      if (this.doubleJumpCooldownTimer <= 0) {
        this.doubleJumpCooldownTimer = 0;
        // Cooldown finished spark effect!
        for (let i = 0; i < 8; i++) {
          game.particles.push(
            new Particle(
              this.x + this.width/2,
              this.y + this.height/2,
              '#ffd700', // Gold chimes
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              1.5 + Math.random() * 2,
              0.4 + Math.random() * 0.3
            )
          );
        }
      }
    }

    // Decrement triple jump cooldown for Seeker 1
    if (this.tripleJumpCooldownTimer > 0) {
      this.tripleJumpCooldownTimer -= dt;
      if (this.tripleJumpCooldownTimer <= 0) {
        this.tripleJumpCooldownTimer = 0;
        // Green/Jade chimes when triple jump is ready!
        for (let i = 0; i < 10; i++) {
          game.particles.push(
            new Particle(
              this.x + this.width/2,
              this.y + this.height/2,
              '#12d58a',
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
              2 + Math.random() * 2.5,
              0.4 + Math.random() * 0.3
            )
          );
        }
      }
    }

    // Decrement jump anticipation timer
    if (this.jumpAnticipationTimer > 0) {
      this.jumpAnticipationTimer -= dt;
      if (this.jumpAnticipationTimer < 0) this.jumpAnticipationTimer = 0;
    }

    // Decrement shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
      if (this.shootCooldown < 0) this.shootCooldown = 0;
    }

    // Track highest Y position reached during leap/fall
    if (this.grounded) {
      this.highestY = this.y;
    } else {
      if (this.y < this.highestY) {
        this.highestY = this.y;
      }
    }
  },

  getStandingPlatform() {
    // Check if player is standing on any platform
    for (let platform of game.platforms) {
      if (platform.crumbled) continue;
      if (
        this.x + this.width - 5 > platform.x &&
        this.x + 5 < platform.x + platform.width &&
        Math.abs((this.y + this.height) - platform.y) <= 1 &&
        this.vy >= 0
      ) {
        return platform;
      }
    }
    return null;
  },

  jump() {
    if (this.grounded) {
      this.vy = this.getJumpVel();
      this.grounded = false;
      this.jumpCount = 1;
      this.jumpAnticipationTimer = 0.12; // 120ms of dramatic leap spring transition
      this.squashX = 0.68;
      this.squashY = 1.38;
      audio.playJump();
      // Spawn dust particles
      for (let i = 0; i < 6; i++) {
        game.particles.push(
          new Particle(
            this.x + this.width/2, this.y + this.height,
            'rgba(255,255,255,0.5)',
            (Math.random() - 0.5) * 4,
            -Math.random() * 2,
            3 + Math.random() * 3,
            0.4 + Math.random() * 0.3
          )
        );
      }
    } else if (this.jumpCount < this.maxJumps) {
      if (this.jumpCount === 2) {
        // This is the 3rd jump (Triple Jump) for Seeker 1 - requires cooldown
        if (this.tripleJumpCooldownTimer <= 0) {
          this.vy = this.getJumpVel() * 0.95;
          this.jumpCount++;
          this.tripleJumpCooldownTimer = this.getTripleJumpCooldownMax();
          this.squashX = 0.8;
          this.squashY = 1.25;
          audio.playJump();
          
          // Green/Jade feather particles for triple jump
          for (let i = 0; i < 12; i++) {
            game.particles.push(
              new Particle(
                this.x + this.width/2, this.y + this.height/2,
                '#12d58a', // Green/Jade sparkles
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                2 + Math.random() * 4,
                0.6 + Math.random() * 0.4
              )
            );
          }
        }
      } else {
        // This is the 2nd jump (Double Jump)
        // Seeker 1 has no cooldown on the 2nd jump, others check doubleJumpCooldownTimer
        if (game.selectedCharacter === 1 || this.doubleJumpCooldownTimer <= 0) {
          this.vy = this.getJumpVel() * 0.95;
          this.jumpCount++;
          if (game.selectedCharacter !== 1) {
            this.doubleJumpCooldownTimer = this.getDoubleJumpCooldownMax();
          }
          this.squashX = 0.8;
          this.squashY = 1.25;
          audio.playJump();
          
          // Phoenix feather particles (double jump!)
          for (let i = 0; i < 10; i++) {
            game.particles.push(
              new Particle(
                this.x + this.width/2, this.y + this.height/2,
                '#ffd700', // Gold sparkles
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                2 + Math.random() * 4,
                0.6 + Math.random() * 0.4
              )
            );
          }
        }
      }
    }
  },

  draw(ctx) {
    ctx.save();
    
    // Centered pivot for drawing
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const size = this.width / 2;
    
    // Dynamic 2.5D Perspective Drop Shadow cast onto the platform below
    const footX = cx;
    const footY = this.y + this.height;
    let shadowPlatform = null;
    let minDy = Infinity;

    if (game.platforms) {
      for (let plat of game.platforms) {
        if (plat.crumbled) continue;
        if (footX >= plat.x - 8 && footX <= plat.x + plat.width + 8) {
          const dy = plat.y - footY;
          if (dy >= -4 && dy < minDy) {
            minDy = dy;
            shadowPlatform = plat;
          }
        }
      }
    }

    if (shadowPlatform && minDy <= 240) {
      const shadowY = shadowPlatform.y + 2;
      const distRatio = Math.max(0, Math.min(1, minDy / 240));
      const shadowScale = 1 - distRatio * 0.55;
      const shadowAlpha = (1 - distRatio * 0.72) * 0.36;
      const shadowW = (this.width * 0.48) * shadowScale;
      const shadowH = 5.5 * shadowScale;

      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(footX, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.grounded) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(footX, footY + 1, this.width * 0.45, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.translate(cx, cy);
    
    // Draw the main character model using shared drawCharacterModel
    drawCharacterModel(ctx, game.selectedCharacter, size, this.facingLeft, this.runCycle, this.vx, this.squashX, this.squashY);
    
    // 12. Draw Jump Cooldown / Ready Ring
    if (game.selectedCharacter === 1) {
      const maxCd = this.getTripleJumpCooldownMax();
      const ringRadius = size * 2.25;
      const ringCenterY = -size * 0.35;
      if (this.tripleJumpCooldownTimer > 0) {
        const pct = this.tripleJumpCooldownTimer / maxCd; // 1 to 0
        
        ctx.save();
        ctx.strokeStyle = 'rgba(18, 213, 138, 0.2)'; // faint jade-green
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, ringCenterY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Active fill arc (jade-green ring charging up to 100%)
        ctx.strokeStyle = '#12d58a'; // bright jade-green
        ctx.lineWidth = 4;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#12d58a';
        ctx.beginPath();
        ctx.arc(0, ringCenterY, ringRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (1 - pct)));
        ctx.stroke();
        ctx.restore();
      } else {
        // Ready state: solid glowing jade-green ring
        ctx.save();
        ctx.strokeStyle = '#12d58a'; // bright jade-green
        ctx.lineWidth = 4;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#12d58a';
        ctx.beginPath();
        ctx.arc(0, ringCenterY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (this.doubleJumpCooldownTimer > 0) {
      const maxCd = this.getDoubleJumpCooldownMax();
      const pct = this.doubleJumpCooldownTimer / maxCd; // 1 to 0
      
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)'; // faint gold
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      // Active fill arc (golden ring charging up to 100%)
      ctx.strokeStyle = '#ffd700'; // bright gold
      ctx.lineWidth = 4;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.35, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (1 - pct)));
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
};

// Camera details
const camera = {
  y: 0, // Starts at 0, goes negative as we climb
  targetY: 0,
  lerpSpeed: 0.08,

  reset() {
    this.y = 0;
    this.targetY = 0;
  },

  update(playerY, dt) {
    // Keep player in the middle of canvas view vertically
    const idealY = playerY - V_HEIGHT * 0.65;
    this.targetY = idealY;

    // Camera cannot scroll down past the ground (camera.y cannot be greater than 0)
    if (this.targetY > 0) this.targetY = 0;
    
    // camera cannot scroll past peak
    if (this.targetY < -TOTAL_HEIGHT + V_HEIGHT) this.targetY = -TOTAL_HEIGHT + V_HEIGHT;

    // Lerp
    this.y += (this.targetY - this.y) * this.lerpSpeed * dt * 60;
  }
};

// Deterministic Pseudo-Random Generator (Seedable)
// Used so platforms generate identically every play and don't slide around or mismatch
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    let x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  nextRange(min, max) {
    return min + this.next() * (max - min);
  }
}

// ==========================================
// PROJECTILE CLASS - Jade Bolt
// ==========================================
class Projectile {
  constructor(x, y, vx, vy, level) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.vx = vx;
    this.vy = vy;
    this.level = level;
    this.phase = 'fly'; // 'fly' or 'roll'
    this.startX = x;
    this.maxFlyDistance = 180; // Fly short distance horizontally (e.g. 180px)
    this.alive = true;
    this.lifeTime = 5.0; // Max lifetime in seconds for safety
  }

  update(dt) {
    this.lifeTime -= dt;
    if (this.lifeTime <= 0) {
      this.alive = false;
      return;
    }

    if (this.phase === 'fly') {
      // Just fly straight horizontally, ignore gravity
      this.x += this.vx * dt * 60;
      // Check distance
      if (Math.abs(this.x - this.startX) >= this.maxFlyDistance) {
        if (this.level === 1) {
          this.alive = false;
        } else {
          // Level 2 transitions to rolling phase
          this.phase = 'roll';
          this.vy = 0;
          // Keep vx direction but maybe roll speed could be adjusted or kept same
          const dir = Math.sign(this.vx) || 1;
          this.vx = dir * 3.5;
        }
      }
    } else if (this.phase === 'roll') {
      // Apply gravity
      this.vy += 0.45 * dt * 60;
      if (this.vy > 12) this.vy = 12;

      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;

      // Platform collision so it rolls on them
      for (const plat of game.platforms) {
        if (plat.crumbled) continue;
        if (this.x < plat.x + plat.width && this.x + this.width > plat.x &&
            this.y + this.height >= plat.y && this.y + this.height <= plat.y + 12 && this.vy >= 0) {
          this.y = plat.y - this.height;
          this.vy = 0;
        }
      }

      // If it hits walls, reverse direction
      if (this.x < 0) {
        this.x = 0;
        this.vx = -this.vx;
      }
      if (this.x + this.width > V_WIDTH) {
        this.x = V_WIDTH - this.width;
        this.vx = -this.vx;
      }
    }

    // Check collision with all active enemies
    for (let enemy of game.enemies) {
      if (enemy.alive && !enemy.dying) {
        if (checkAABB(this, enemy)) {
          enemy.die();
          audio.playCollect();
          const jadeReward = (game.selectedCharacter === 3) ? 2 : 1;
          profileManager.addJade(jadeReward);
          game.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (game.jadeCount + jadeReward);
          updateHUD();
          showFloatingText(enemy.x + 16, enemy.y - 16, '+' + jadeReward + ' 玉', '#12d58a');
          this.alive = false;
          break;
        }
      }
    }

    // Check collision with Bosses
    if (this.alive && game.bosses && game.bosses.length > 0) {
      for (let boss of game.bosses) {
        if (boss.alive && !boss.dying && checkAABB(this, boss)) {
          game.activeBossTarget = boss;
          boss.takeDamage(1);
          audio.playCollect();
          if (boss.alive) {
            triggerBossQuestion(boss);
          }
          this.alive = false;
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#00ffaa';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffaa';
    
    if (this.level === 1) {
      // Horizontal crystal shape
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.vx < 0 ? Math.PI : 0);
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(2, 4);
      ctx.lineTo(-8, 4);
      ctx.lineTo(-8, -4);
      ctx.lineTo(2, -4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Level 2: spinning jade sphere
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw internal details (spiral/cross to show rolling)
      ctx.strokeStyle = '#005533';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const angle = (Date.now() * 0.01 * (this.vx > 0 ? 1 : -1)) % (Math.PI * 2);
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 4, angle, angle + Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function playerShoot() {
  const isChar5Shooting = (game.selectedCharacter === 5 && game.upgrades.shooting === 0);
  
  if (game.upgrades.shooting <= 0 && !isChar5Shooting) return;
  if (player.shootCooldown > 0) return;

  const currentShootLevel = isChar5Shooting ? 1 : game.upgrades.shooting;
  player.shootCooldown = isChar5Shooting ? 3.0 : 0.4;

  const dir = player.facingLeft ? -1 : 1;
  const projectileSpeed = 8.5;

  const startX = player.facingLeft ? (player.x - 12) : (player.x + player.width - 4);
  const startY = player.y + player.height / 2 - 8;

  const proj = new Projectile(startX, startY, dir * projectileSpeed, 0, currentShootLevel);
  game.projectiles.push(proj);

  audio.playShoot();
}

// Generate complete mountain level
// ==========================================
// ENEMY CLASS - Zone 1 Bamboo Slime
// ==========================================
class Enemy {
  constructor(x, y, patrolLeft, patrolRight, speed = 1.2, platform = null) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.vx = speed;
    this.vy = 0;
    this.grounded = false;
    this.alive = true;
    this.dying = false;
    this.deathTimer = 0;
    this.facingLeft = false;
    this.patrolLeft = patrolLeft + 4;
    this.patrolRight = patrolRight - 4;
    this.walkCycle = 0;
    this.eyeBlink = 0;
    this.speed = speed;
    this.startY = y;
    this.isFlying = false;
    this.platform = platform;
    this.offsetY = platform ? y - platform.y : 0;
  }

  update(dt) {
    if (!this.alive && !this.dying) return;
    if (this.dying) {
      this.deathTimer -= dt;
      this.vy += 0.4;
      this.y += this.vy;
      if (this.deathTimer <= 0) { this.alive = false; this.dying = false; }
      return;
    }

    // Ride platform movement and adjust patrol bounds dynamically
    if (this.platform) {
      this.patrolLeft = this.platform.x + 4;
      this.patrolRight = this.platform.x + this.platform.width - 4;
      if (this.platform.type === 'moving') {
        const dx = this.platform.vx * this.platform.direction * dt * 60;
        this.x += dx;
      }
      this.startY = this.platform.y + this.offsetY;
    }

    if (this.isFlying) {
      this.x += this.vx * dt * 60;
      this.walkCycle += Math.abs(this.vx) * dt * 60 * 0.15;
      this.eyeBlink += dt;
      this.y = this.startY + Math.sin(this.walkCycle * 0.08) * (5 * 14.5);
      if (this.x <= this.patrolLeft) { this.vx = Math.abs(this.vx); this.facingLeft = false; }
      else if (this.x + this.width >= this.patrolRight) { this.vx = -Math.abs(this.vx); this.facingLeft = true; }
      if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx); }
      if (this.x + this.width > V_WIDTH) { this.x = V_WIDTH - this.width; this.vx = -Math.abs(this.vx); }
    } else {
      this.vy += 0.45 * dt * 60;
      if (this.vy > 15) this.vy = 15;
      this.x += this.vx * dt * 60;
      this.walkCycle += Math.abs(this.vx) * dt * 60 * 0.15;
      this.eyeBlink += dt;
      if (this.x <= this.patrolLeft) { this.vx = Math.abs(this.vx); this.facingLeft = false; }
      else if (this.x + this.width >= this.patrolRight) { this.vx = -Math.abs(this.vx); this.facingLeft = true; }
      this.y += this.vy * dt * 60;
      this.grounded = false;
      for (const plat of game.platforms) {
        if (this.x < plat.x + plat.width && this.x + this.width > plat.x &&
            this.y + this.height >= plat.y && this.y + this.height <= plat.y + plat.height + 12 && this.vy >= 0) {
          this.y = plat.y - this.height; this.vy = 0; this.grounded = true;
        }
      }
      if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx); }
      if (this.x + this.width > V_WIDTH) { this.x = V_WIDTH - this.width; this.vx = -Math.abs(this.vx); }
    }
  }

  die() {
    this.dying = true;
    this.deathTimer = 0.4;
    this.vy = -6;
    this.vx = 0;
    for (let i = 0; i < 10; i++) {
      game.particles.push(new Particle(this.x + 16, this.y + 16, '#4ade80',
        (Math.random()-0.5)*6, (Math.random()-0.5)*6-2, 2+Math.random()*2.5, 0.5+Math.random()*0.4));
    }
    for (let i = 0; i < 5; i++) {
      game.particles.push(new Particle(this.x + 16, this.y + 16, '#12d58a',
        (Math.random()-0.5)*5, (Math.random()-0.5)*5-3, 3+Math.random()*2, 0.7+Math.random()*0.4));
    }
  }

  draw(ctx) {
    if (!this.alive && !this.dying) return;
    const alpha = this.dying ? Math.max(0, this.deathTimer / 0.4) : 1.0;
    ctx.save();
    ctx.globalAlpha = alpha;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const bounce = Math.sin(this.walkCycle * Math.PI) * 0.08;
    const scaleY = 1 + bounce, scaleX = 1 - bounce * 0.5;

    // 2.5D Perspective Drop Shadow for Enemy
    if (this.isFlying) {
      let groundY = this.startY + 40;
      if (this.platform) {
        groundY = this.platform.y + 2;
      } else if (game.platforms) {
        for (let plat of game.platforms) {
          if (cx >= plat.x - 4 && cx <= plat.x + plat.width + 4 && plat.y >= this.y + this.height - 10) {
            if (plat.y < groundY || groundY === this.startY + 40) groundY = plat.y + 2;
          }
        }
      }
      const distY = Math.max(0, groundY - (this.y + this.height));
      const shadowFactor = Math.max(0.25, 1 - distY / 180);
      ctx.fillStyle = `rgba(15, 23, 42, ${0.28 * shadowFactor})`;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, 14 * shadowFactor, 4.5 * shadowFactor, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, this.y + this.height + 2, 14, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, this.y + this.height);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -(this.y + this.height));
    if (game.currentLevel === 11) {
      // --- THEMED ELECTRIC APPLIANCE ENEMY (LEVEL 11) ---
      if (this.isFlying) {
        // Flying Electric Fan Drone Bot (风扇 / 灯)
        // 1. Spinning Fan Blades
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.walkCycle * 4);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.ellipse(10, 0, 8, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 2. Center Light Dome / Fan Hub
        const fanGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
        fanGrad.addColorStop(0, '#fef08a');
        fanGrad.addColorStop(0.5, '#0284c7');
        fanGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = fanGrad;
        ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.stroke();

        // 3. Digital Glowing Eye
        const isBlinking = (this.eyeBlink % 3) < 0.12;
        ctx.fillStyle = isBlinking ? '#0284c7' : '#38bdf8';
        ctx.beginPath(); ctx.arc(cx, cy, isBlinking ? 1.5 : 4, 0, Math.PI * 2); ctx.fill();
        if (!isBlinking) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(cx - 1, cy - 1, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        // 4. Little Electric Spark / Antenna on top
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy - 11); ctx.lineTo(cx, cy - 16); ctx.stroke();
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(cx, cy - 16, 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        // Ground Robot: Retro Mini TV / Smart Appliance Bot (电视 / 冰箱)
        // 1. Robot Body (Monitor Chassis)
        const tvGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 26);
        tvGrad.addColorStop(0, '#334155');
        tvGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = tvGrad;
        drawRoundRect(ctx, cx - 14, cy - 11, 28, 24, 5, true, false);
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
        drawRoundRect(ctx, cx - 14, cy - 11, 28, 24, 5, false, true);

        // 2. CRT Screen
        ctx.fillStyle = '#020617';
        drawRoundRect(ctx, cx - 11, cy - 8, 22, 17, 3, true, false);

        // 3. Screen Glowing Face (Pixel Eyes)
        const isBlinking = (this.eyeBlink % 3) < 0.12;
        const ed = this.facingLeft ? -1 : 1;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#38bdf8';
        if (isBlinking) {
          ctx.fillRect(cx - 7 + ed, cy - 1, 5, 1.5);
          ctx.fillRect(cx + 2 + ed, cy - 1, 5, 1.5);
        } else {
          // Cute pixel eyes ^_^
          ctx.fillRect(cx - 7 + ed, cy - 3, 4, 4);
          ctx.fillRect(cx + 3 + ed, cy - 3, 4, 4);
          // Mini digital smile
          ctx.fillRect(cx - 2 + ed, cy + 3.5, 4, 1.5);
        }
        ctx.shadowBlur = 0;

        // 4. TV Antenna on top
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - 4, cy - 11); ctx.lineTo(cx - 9, cy - 19); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 4, cy - 11); ctx.lineTo(cx + 9, cy - 19); ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(cx - 9, cy - 19, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 9, cy - 19, 2.5, 0, Math.PI * 2); ctx.fill();

        // 5. Walking Robot Legs
        const legOff = Math.sin(this.walkCycle * 6) * 3;
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 9, cy + 13, 4, 4 + legOff);
        ctx.fillRect(cx + 5, cy + 13, 4, 4 - legOff);
      }
    } else if (game.currentLevel === 12) {
      // --- THEMED DAILY LIFE ENEMY: PARENT / GUARDIAN (ผู้ปกครอง) ---
      // Cute parent character with apron, hair, and a wagging finger

      // 1. Body (rounded torso with apron)
      const bodyGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      bodyGrad.addColorStop(0, '#fbbf24'); // Warm yellow shirt
      bodyGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 4, 15, 14, 0, 0, Math.PI * 2); ctx.fill();

      // 2. Apron
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 2);
      ctx.lineTo(cx + 10, cy - 2);
      ctx.lineTo(cx + 8, cy + 14);
      ctx.lineTo(cx - 8, cy + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1;
      ctx.stroke();
      // Apron pocket
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(cx - 4, cy + 5, 8, 5);
      ctx.strokeRect(cx - 4, cy + 5, 8, 5);

      // 3. Head
      ctx.fillStyle = '#fde68a'; // Skin tone
      ctx.beginPath(); ctx.arc(cx, cy - 10, 10, 0, Math.PI * 2); ctx.fill();

      // 4. Hair
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.arc(cx, cy - 14, 10, Math.PI, 2 * Math.PI); ctx.fill();
      // Side hair tufts
      ctx.beginPath(); ctx.arc(cx - 9, cy - 10, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 9, cy - 10, 4, 0, Math.PI * 2); ctx.fill();

      // 5. Eyes (with glasses for parent look)
      const isBlinking = (this.eyeBlink % 3) < 0.12;
      const ed = this.facingLeft ? -1 : 1;
      if (!isBlinking) {
        // Glasses frames
        ctx.strokeStyle = '#44403c'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx - 4 + ed, cy - 10, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 4 + ed, cy - 10, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 0.5 + ed, cy - 10); ctx.lineTo(cx + 0.5 + ed, cy - 10); ctx.stroke();
        // Pupils
        ctx.fillStyle = '#1c1917';
        ctx.beginPath(); ctx.arc(cx - 4 + ed, cy - 10, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4 + ed, cy - 10, 1.8, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx - 4, cy - 10, 3, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 4, cy - 10, 3, 0, Math.PI); ctx.stroke();
      }

      // 6. Mouth (stern but caring)
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 4);
      ctx.quadraticCurveTo(cx, cy - 6, cx + 3, cy - 4);
      ctx.stroke();

      // 7. Wagging Finger (scolding animation)
      const fingerAngle = Math.sin(this.walkCycle * 3) * 0.3;
      ctx.save();
      ctx.translate(this.facingLeft ? cx - 15 : cx + 15, cy - 5);
      ctx.rotate(this.facingLeft ? -0.5 + fingerAngle : 0.5 - fingerAngle);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-1.5, -12, 3, 12);
      ctx.beginPath(); ctx.arc(0, -13, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // 8. Walking feet
      const legOff = Math.sin(this.walkCycle * 6) * 2;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(cx - 7, cy + 14, 5, 3 + legOff);
      ctx.fillRect(cx + 2, cy + 14, 5, 3 - legOff);
    } else if (game.currentLevel === 13) {
      // --- THEMED HOBBIES ENEMY (GAMER / ARTIST SLIME) ---
      if (this.isFlying) {
        // Flying Soccer Drone with propeller wings
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5; ctx.stroke();
        // Football pentagons
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - 7, cy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 7, cy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy + 7, 2.5, 0, Math.PI * 2); ctx.fill();
        
        // Mechanical propeller wings on top
        ctx.save();
        ctx.translate(cx, cy - 12);
        ctx.rotate(this.walkCycle * 8);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.fillRect(-13, -2, 26, 4);
        ctx.restore();
      } else {
        // Ground Gamer Slime: Cute purple slime wearing RGB headphones
        const hGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 16);
        hGrad.addColorStop(0, '#c084fc');
        hGrad.addColorStop(0.5, '#7c3aed');
        hGrad.addColorStop(1, '#4c1d95');
        ctx.fillStyle = hGrad;
        ctx.beginPath(); ctx.ellipse(cx, cy + 4, 15, 13, 0, 0, Math.PI * 2); ctx.fill();

        // RGB Headphone band over head
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy - 1, 13, Math.PI * 0.9, Math.PI * 2.1);
        ctx.stroke();

        // Headphone ear cups
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath(); ctx.arc(cx - 13, cy + 2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 13, cy + 2, 4, 0, Math.PI * 2); ctx.fill();

        // Cute glowing eyes
        const isBlinking = (this.eyeBlink % 3) < 0.12;
        const ed = this.facingLeft ? -1 : 1;
        ctx.fillStyle = '#38bdf8';
        if (!isBlinking) {
          ctx.beginPath(); ctx.arc(cx + ed * 4 - 4, cy + 3, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + ed * 4 + 4, cy + 3, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(cx + ed * 4 - 5, cy + 2, 1.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + ed * 4 + 3, cy + 2, 1.2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(cx + ed * 4 - 6, cy + 3, 4, 1.5);
          ctx.fillRect(cx + ed * 4 + 2, cy + 3, 4, 1.5);
        }
      }
    } else if (game.currentLevel === 15) {
      // --- THEMED SPECIAL OBJECTS ENEMY: WIND-UP GADGET TOY BOT (หุ่นยนต์ของเล่นไขลาน / บอทมือถือ 🤖📱玩具) ---
      // 1. Mechanical walking legs
      const legOff = Math.sin(this.walkCycle * 6) * 3;
      ctx.fillStyle = '#0369a1';
      // Left foot
      ctx.fillRect(cx - 7, cy + 12 + legOff, 5, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 8, cy + 15 + legOff, 7, 3);
      // Right foot
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(cx + 2, cy + 12 - legOff, 5, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 1, cy + 15 - legOff, 7, 3);

      // 2. Wind-up Toy Key on back / top (กุญแจไขลานของเล่น 玩具)
      ctx.save();
      ctx.translate(cx, cy - 14);
      ctx.rotate(this.walkCycle * 4);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      // Key stem
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -6); ctx.stroke();
      // Key ring
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(-5, -6, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, -6, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();

      // 3. Main Gadget / Smart Phone Casing (โทรศัพท์ / จอคอม 手机/电脑)
      const botGrad = ctx.createLinearGradient(cx - 14, cy - 12, cx + 14, cy + 14);
      botGrad.addColorStop(0, '#38bdf8');
      botGrad.addColorStop(0.5, '#0284c7');
      botGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = botGrad;
      drawRoundRect(ctx, cx - 14, cy - 11, 28, 24, 5, true, false);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, cx - 14, cy - 11, 28, 24, 5, false, true);

      // 4. Dark Display Screen (จอทีวี / จอมือถือ 电视/手机)
      ctx.fillStyle = '#090d16';
      drawRoundRect(ctx, cx - 11, cy - 8, 22, 18, 3, true, false);

      // 5. Digital Face Expression on Screen
      const isBlinking = (this.eyeBlink % 3) < 0.14;
      const ed = this.facingLeft ? -1 : 1;
      if (!isBlinking) {
        // Glowing cyan digital eyes ^_^
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Left eye
        ctx.arc(cx - 5 + ed * 2, cy - 1, 3, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        // Right eye
        ctx.beginPath();
        ctx.arc(cx + 5 + ed * 2, cy - 1, 3, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        // Pixel smile
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 2 + ed * 2, cy + 4, 4, 1.5);
      } else {
        // Blinking horizontal line eyes
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 7 + ed * 2, cy - 1, 4, 1.5);
        ctx.fillRect(cx + 3 + ed * 2, cy - 1, 4, 1.5);
      }

      // 6. Side Accessory: Mini Water Bottle (กระบอกน้ำ 水杯)
      const bottleX = this.facingLeft ? cx + 13 : cx - 17;
      ctx.fillStyle = '#06b6d4'; // Cyan bottle
      drawRoundRect(ctx, bottleX, cy - 3, 5, 11, 2, true, false);
      ctx.fillStyle = '#e2e8f0'; // Silver cap
      ctx.fillRect(bottleX + 1, cy - 5, 3, 2);
    } else {
      // Standard enemy models
      // Body
      const grad = ctx.createRadialGradient(cx-4, cy-4, 2, cx, cy, 18);
      if (this.isFlying) {
        grad.addColorStop(0, '#f472b6'); grad.addColorStop(0.6, '#a855f7'); grad.addColorStop(1, '#6b21a8');
      } else {
        grad.addColorStop(0, '#86efac'); grad.addColorStop(0.6, '#22c55e'); grad.addColorStop(1, '#15803d');
      }
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(cx, cy+4, 16, 14, 0, 0, Math.PI*2); ctx.fill();

      // Wings (only if flying)
      if (this.isFlying) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Left Wing
        ctx.save();
        ctx.translate(cx - 14, cy - 2);
        const flap = Math.sin(this.walkCycle * 2.5) * 0.4;
        ctx.rotate(-0.4 + flap);
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
        
        // Right Wing
        ctx.save();
        ctx.translate(cx + 14, cy - 2);
        ctx.rotate(0.4 - flap);
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath(); ctx.ellipse(cx-5, cy-3, 7, 5, -0.3, 0, Math.PI*2); ctx.fill();
      // Eyes
      const isBlinking = (this.eyeBlink % 3) < 0.12;
      const ed = this.facingLeft ? -1 : 1;
      const lx = cx + ed*4 - 6, rx = cx + ed*4 + 2, ey = cy - 1;
      if (!isBlinking) {
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(lx, ey, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx, ey, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath(); ctx.arc(lx+ed, ey+1, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx+ed, ey+1, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(lx+ed-1, ey-1, 1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx+ed-1, ey-1, 1, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(lx, ey, 4, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ey, 4, 0, Math.PI); ctx.stroke();
      }
      // Eyebrows
      ctx.strokeStyle = '#166534'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx-4, ey-6); ctx.lineTo(lx+3, ey-5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx-2, ey-5); ctx.lineTo(rx+4, ey-6); ctx.stroke();
      // Antenna
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, this.y+2); ctx.lineTo(cx-3, this.y-7); ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath(); ctx.arc(cx-3, this.y-8, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore(); // restore scale
    // Stomp hint arrow
    const pulse = 0.55 + Math.sin(Date.now() * 0.004) * 0.45;
    ctx.globalAlpha = alpha * pulse;
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('▼', cx, this.y - 8);
    ctx.restore(); // Match the outer ctx.save()
  }
}

// ==========================================
// BOSS PROJECTILE CLASS
// ==========================================
class BossProjectile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 12;
    this.vx = vx;
    this.vy = vy;
    this.alive = true;
    this.lifeTime = 3.0; // disappear after 3 seconds
  }

  update(dt) {
    this.lifeTime -= dt;
    if (this.lifeTime <= 0) {
      this.alive = false;
      return;
    }
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    // Check hit with player
    const pL = player.x, pR = player.x + player.width;
    const pT = player.y, pB = player.y + player.height;
    if (pR > this.x && pL < this.x + this.width && pB > this.y && pT < this.y + this.height) {
      if (player.invincibleTimer <= 0) {
        player.health--;
        player.invincibleTimer = 1.5;
        audio.playDamage();
        updateHUD();
        const hudCard = document.getElementById('hud-health-card');
        if (hudCard) { hudCard.classList.add('shake-effect'); setTimeout(()=>hudCard.classList.remove('shake-effect'),500); }
        const cont = document.querySelector('.canvas-container');
        if (cont) { cont.classList.add('damage-flash'); setTimeout(()=>cont.classList.remove('damage-flash'),300); }
        
        // If player health <= 0, trigger defeat
        if (player.health <= 0) {
          game.isQuestionActive = true;
          audio.playDefeat();
          document.getElementById('hud').classList.add('hidden');
          document.getElementById('question-modal').classList.add('hidden');
          const lvlText = LEVELS_CONFIG[game.currentLevel].name || ('ด่าน ' + game.currentLevel);
          document.getElementById('game-over-level').innerText = lvlText;
          const tm = LEVELS_CONFIG[game.currentLevel].heightMeters;
          let rh = Math.floor(Math.abs(player.y) / 14.5);
          if (rh < 0) rh = 0; if (rh > tm) rh = tm;
          document.getElementById('game-over-height').innerText = rh + 'm / ' + tm + 'm';
          const jadeEl = document.getElementById('game-over-jade');
          if (jadeEl) jadeEl.innerText = game.jadeCount;
          document.getElementById('game-over-screen').classList.remove('hidden');
        }
      }
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    if (this.isSpike) {
      ctx.fillStyle = '#ff1133';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0033';
      const tipX = this.x + this.width / 2;
      const tipY = this.y + this.height + 6;
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(this.x - 2, this.y - 2);
      ctx.lineTo(this.x + this.width + 2, this.y - 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.isElectric || (game && game.currentLevel === 11)) {
      // Electric Plasma Orb
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      ctx.fillStyle = '#facc15';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      // Inner glowing core
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      // Lightning sparkles
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const sparkAngle = (Date.now() * 0.01) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(sparkAngle) * 8, cy + Math.sin(sparkAngle) * 8);
      ctx.lineTo(cx - Math.cos(sparkAngle) * 8, cy - Math.sin(sparkAngle) * 8);
      ctx.stroke();
    } else if (this.isDailylife) {
      // Daily Life Boss Projectile: Warm star / food item
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const rot = (Date.now() * 0.005) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      // Star shape
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i === 0 ? 0 : 7;
        if (i === 0) ctx.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
        else ctx.lineTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
        const midAngle = angle + (2 * Math.PI) / 5;
        ctx.lineTo(Math.cos(midAngle) * 3, Math.sin(midAngle) * 3);
      }
      ctx.closePath();
      ctx.fill();
      // Inner glow
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (this.isScholarScroll || (game && (game.currentLevel === 14 || game.currentLevel === 16))) {
      // Ancient Calligraphy Scroll Projectile (Level 14 & 16)
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const rot = (Date.now() * 0.006) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      // Golden parchment glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffd700';
      // Bamboo parchment scroll body
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      drawRoundRect(ctx, -8, -5, 16, 10, 2, true, true);
      // Chinese character ink marks
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 8px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('字', 0, 0);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ff3300';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff6600';
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ==========================================
// BOSS CLASS - High Heavens & Themed Bosses
// ==========================================
class Boss {
  constructor(x, y, platform, bossType = 'normal') {
    this.x = x;
    this.y = y;
    this.width = 96; // 300% of 32
    this.height = 96;
    this.bossType = bossType; // 'normal', 'lvl10', 'lvl5_1', 'lvl5_2', 'appliances', 'dailylife', 'hsk1_3'
    
    const isHarder = (game.currentLevel === 10);
    this.vx = isHarder ? 1.04 : (bossType === 'dailylife' ? 0.5 : 0.8);
    this.vy = 0;
    this.grounded = true;
    this.alive = true;
    this.dying = false;
    this.deathTimer = 0;
    this.facingLeft = true;
    
    this.platform = platform;
    this.patrolLeft = platform ? platform.x + 8 : x - 100;
    this.patrolRight = platform ? platform.x + platform.width - 96 - 8 : x + 100;
    
    if (bossType === 'lvl5_1') {
      this.hp = 10; // Boss 1 at 500m (easier)
      this.maxHp = 10;
      this.shootInterval = 3.0; // 1-directional spike downward every 3 seconds
    } else if (bossType === 'lvl5_2') {
      this.hp = 15; // Boss 2 at 1000m (50% more HP than Boss 1!)
      this.maxHp = 15;
      this.shootInterval = 2.0; // 3-directional spikes downward every 2 seconds
    } else if (bossType === 'dailylife') {
      this.hp = 5; // Daily Life: 50% less HP than Level 4 (10 -> 5)
      this.maxHp = 5;
      this.shootInterval = 4.0; // Much slower shooting (4s vs 2.5s)
    } else if (bossType === 'hsk1_3') {
      this.hp = 10; // HSK1 Lesson 3 Grand Teacher: 10 HP
      this.maxHp = 10;
      this.shootInterval = 2.5; // Shoots scrolls every 2.5s
    } else {
      this.hp = isHarder ? 13 : 10;
      this.maxHp = this.hp;
      this.shootInterval = isHarder ? 1.9 : 2.5;
    }

    this.shootTimer = this.shootInterval;
    this.walkCycle = 0;
    this.eyeBlink = 0;
  }

  update(dt) {
    if (!this.alive && !this.dying) return;
    if (this.dying) {
      this.deathTimer -= dt;
      this.vy += 0.4;
      this.y += this.vy;
      if (this.deathTimer <= 0) { this.alive = false; this.dying = false; }
      return;
    }

    // Horizontal patrol on platform
    this.x += this.vx * dt * 60;
    this.walkCycle += Math.abs(this.vx) * dt * 60 * 0.05;
    this.eyeBlink += dt;

    if (this.x <= this.patrolLeft) {
      this.vx = Math.abs(this.vx);
      this.facingLeft = false;
    } else if (this.x >= this.patrolRight) {
      this.vx = -Math.abs(this.vx);
      this.facingLeft = true;
    }

    // Keep within screen boundary just in case
    if (this.x < 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx);
    }
    if (this.x + this.width > V_WIDTH) {
      this.x = V_WIDTH - this.width;
      this.vx = -Math.abs(this.vx);
    }

    // Shooting
    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      this.shootTimer = this.shootInterval;
      this.shootSpikesOrProjectiles();
    }
  }

  shootSpikesOrProjectiles() {
    audio.playShoot();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    if (this.bossType === 'lvl5_1') {
      // Boss 1: ปล่อยหนาม 1 ทิศทางลงมาแทงเราทุกๆ 3 วินาที
      const proj = new BossProjectile(cx - 6, cy + 20, 0, 4.5);
      proj.isSpike = true;
      proj.lifeTime = 4.0;
      game.bossProjectiles.push(proj);
    } else if (this.bossType === 'lvl5_2') {
      // Boss 2: ปล่อยหนามลงมา 3 ทิศทางทุกๆ 2 วินาที
      const angles = [
        { vx: 0, vy: 4.5 },
        { vx: -2.2, vy: 4.0 },
        { vx: 2.2, vy: 4.0 }
      ];
      for (let a of angles) {
        const proj = new BossProjectile(cx - 6, cy + 20, a.vx, a.vy);
        proj.isSpike = true;
        proj.lifeTime = 4.0;
        game.bossProjectiles.push(proj);
      }
    } else if (this.bossType === 'dailylife') {
      // Daily Life Boss: 4-directional shooting (50% less than Level 4's 8-directional), slower speed
      const speed = 2.5;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const proj = new BossProjectile(cx - 6, cy - 6, vx, vy);
        proj.isDailylife = true;
        game.bossProjectiles.push(proj);
      }
    } else if (this.bossType === 'hsk1_3') {
      // HSK1 Lesson 3 Grand Teacher Boss: 8-directional calligraphy scroll burst
      const speed = 3.6;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const proj = new BossProjectile(cx - 6, cy - 6, vx, vy);
        proj.isScholarScroll = true;
        game.bossProjectiles.push(proj);
      }
    } else {
      // Level 4, Level 10, Level 11: 8-directional shooting
      const speed = (game.currentLevel === 10) ? 4.55 : 3.5;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const proj = new BossProjectile(cx - 6, cy - 6, vx, vy);
        if (game.currentLevel === 11 || this.bossType === 'appliances') {
          proj.isElectric = true;
        }
        game.bossProjectiles.push(proj);
      }
    }
  }

  takeDamage(amount) {
    if (!this.alive || this.dying) return;
    this.hp -= amount;
    
    // Spawn damage particles
    for (let i = 0; i < 15; i++) {
      game.particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, '#ff3300',
        (Math.random()-0.5)*8, (Math.random()-0.5)*8-2, 3+Math.random()*3, 0.5+Math.random()*0.4));
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.dying = true;
    this.deathTimer = 1.5; // Longer death timer for dramatic fall
    this.vy = -8;
    this.vx = 0;
    audio.playGong(); // Epic death gong sound
    
    // Huge celebration particle burst
    for (let i = 0; i < 40; i++) {
      game.particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, '#ffd700',
        (Math.random()-0.5)*12, (Math.random()-0.5)*12-5, 4+Math.random()*4, 1.0+Math.random()*0.5));
    }
    
    // Reward player with huge jade shards amount
    profileManager.addJade(20);
    game.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (game.jadeCount + 20);
    updateHUD();
    showFloatingText(this.x + this.width/2, this.y - 20, '+20 玉 (BOSS DEFEATED)', '#ffd700');
  }

  draw(ctx) {
    if (!this.alive && !this.dying) return;
    const alpha = this.dying ? Math.max(0, this.deathTimer / 1.5) : 1.0;
    ctx.save();
    ctx.globalAlpha = alpha;
    
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    
    const bounce = Math.sin(this.walkCycle * Math.PI) * 0.05;
    const scaleY = 1 + bounce, scaleX = 1 - bounce * 0.5;
    
    ctx.save();
    ctx.translate(cx, this.y + this.height);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -(this.y + this.height));
    
    // Big Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, this.y+this.height+4, 38, 10, 0, 0, Math.PI*2);
    ctx.fill();
    
    if (this.bossType === 'appliances' || game.currentLevel === 11) {
      // --- THEMED ELECTRIC APPLIANCE BOSS: MECHA APPLIANCE MASTER (⚡🔌) ---
      // 1. Giant Metallic Chassis (Rounded Cyber Computer / Smart TV frame)
      const chassisGrad = ctx.createLinearGradient(cx - 45, cy - 40, cx + 45, cy + 45);
      chassisGrad.addColorStop(0, '#334155');
      chassisGrad.addColorStop(0.5, '#1e293b');
      chassisGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = chassisGrad;
      drawRoundRect(ctx, cx - 44, cy - 35, 88, 76, 12, true, false);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
      drawRoundRect(ctx, cx - 44, cy - 35, 88, 76, 12, false, true);

      // 2. High-Voltage Tesla Coils on top
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx - 24, cy - 35); ctx.lineTo(cx - 32, cy - 54); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 24, cy - 35); ctx.lineTo(cx + 32, cy - 54); ctx.stroke();
      // Glowing energy spheres on antenna tips
      ctx.fillStyle = '#facc15'; ctx.shadowBlur = 10; ctx.shadowColor = '#fde047';
      ctx.beginPath(); ctx.arc(cx - 32, cy - 54, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 32, cy - 54, 7, 0, Math.PI * 2); ctx.fill();
      // Crackling lightning between coils
      if (Math.random() < 0.6) {
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 32, cy - 54);
        ctx.lineTo(cx - 10, cy - 50 + (Math.random() - 0.5) * 8);
        ctx.lineTo(cx + 10, cy - 50 + (Math.random() - 0.5) * 8);
        ctx.lineTo(cx + 32, cy - 54);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // 3. Side Dual Cooling Fans (Left & Right)
      const fanAngle = Date.now() * 0.008;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 36, cy + 26, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 36, cy + 26, 10, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(cx - 36, cy + 26); ctx.rotate(fanAngle);
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.fillRect(-2, -8, 4, 8);
      }
      ctx.restore();
      ctx.save();
      ctx.translate(cx + 36, cy + 26); ctx.rotate(-fanAngle);
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.fillRect(-2, -8, 4, 8);
      }
      ctx.restore();

      // 4. Giant OLED Screen Face
      ctx.fillStyle = '#020617';
      drawRoundRect(ctx, cx - 36, cy - 28, 72, 48, 8, true, false);
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.5;
      drawRoundRect(ctx, cx - 36, cy - 28, 72, 48, 8, false, true);

      // 5. Boss Eyes on Screen (Fierce Cyber Matrix Eyes)
      const isBlinking = (this.eyeBlink % 4) < 0.15;
      const ed = this.facingLeft ? -1 : 1;
      const lx = cx + ed * 10 - 16, rx = cx + ed * 10 + 6, ey = cy - 12;
      ctx.shadowBlur = 8; ctx.shadowColor = '#facc15';
      if (!isBlinking) {
        // Glowing Golden Lightning Eyes
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(lx - 8, ey - 5); ctx.lineTo(lx + 8, ey); ctx.lineTo(lx - 6, ey + 7);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(rx - 8, ey); ctx.lineTo(rx + 8, ey - 5); ctx.lineTo(rx + 6, ey + 7);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(lx - 8, ey); ctx.lineTo(lx + 8, ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx - 8, ey); ctx.lineTo(rx + 8, ey); ctx.stroke();
      }

      // 6. Digital Equalizer / Lightning Mouth
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 8);
      ctx.lineTo(cx - 8, cy + 4 + Math.sin(Date.now() * 0.01) * 3);
      ctx.lineTo(cx, cy + 10);
      ctx.lineTo(cx + 8, cy + 4 + Math.cos(Date.now() * 0.01) * 3);
      ctx.lineTo(cx + 16, cy + 8);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 7. Hazard Voltage Badge on Top Screen
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 220V ⚡', cx, cy - 18);
    } else if (this.bossType === 'dailylife' || game.currentLevel === 12) {
      // --- THEMED DAILY LIFE BOSS: GIANT PARENT / GUARDIAN (ผู้ปกครองยักษ์) ---

      // 1. Large Body (Warm colored torso)
      const bodyGrad = ctx.createLinearGradient(cx - 42, cy - 30, cx + 42, cy + 40);
      bodyGrad.addColorStop(0, '#fbbf24');
      bodyGrad.addColorStop(0.5, '#f59e0b');
      bodyGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 46, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 46, 38, 0, 0, Math.PI * 2); ctx.stroke();

      // 2. Big Apron
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 5);
      ctx.lineTo(cx + 30, cy - 5);
      ctx.lineTo(cx + 24, cy + 35);
      ctx.lineTo(cx - 24, cy + 35);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2;
      ctx.stroke();
      // Apron pocket with heart
      ctx.fillStyle = '#fde68a';
      drawRoundRect(ctx, cx - 12, cy + 10, 24, 14, 3, true, false);
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5;
      drawRoundRect(ctx, cx - 12, cy + 10, 24, 14, 3, false, true);
      // Heart on pocket
      ctx.fillStyle = '#ef4444';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❤️', cx, cy + 22);

      // 3. Head
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.arc(cx, cy - 28, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d4a574'; ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Chef/Cooking Hat
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 38);
      ctx.lineTo(cx + 22, cy - 38);
      ctx.lineTo(cx + 18, cy - 48);
      ctx.quadraticCurveTo(cx + 10, cy - 62, cx, cy - 58);
      ctx.quadraticCurveTo(cx - 10, cy - 62, cx - 18, cy - 48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Hat band
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 22, cy - 40, 44, 5);

      // 5. Hair on sides
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.arc(cx - 20, cy - 24, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 20, cy - 24, 8, 0, Math.PI * 2); ctx.fill();

      // 6. Eyes (with glasses)
      const isBlinking = (this.eyeBlink % 4) < 0.15;
      const ed = this.facingLeft ? -1 : 1;
      const lx = cx + ed * 6 - 10, rx = cx + ed * 6 + 4, ey = cy - 30;
      if (!isBlinking) {
        // Glasses frames
        ctx.strokeStyle = '#44403c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(lx, ey, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ey, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + 7, ey); ctx.lineTo(rx - 7, ey); ctx.stroke();
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(lx, ey, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx, ey, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1c1917';
        ctx.beginPath(); ctx.arc(lx + ed, ey + 1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx + ed, ey + 1, 3, 0, Math.PI * 2); ctx.fill();
        // Glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(lx + ed - 1, ey - 1, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx + ed - 1, ey - 1, 1.2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(lx, ey, 6, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ey, 6, 0, Math.PI); ctx.stroke();
      }

      // 7. Eyebrows (stern parent look)
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx - 6, ey - 10); ctx.lineTo(lx + 5, ey - 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 5, ey - 7); ctx.lineTo(rx + 6, ey - 10); ctx.stroke();

      // 8. Mouth (stern parent frown)
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 16);
      ctx.quadraticCurveTo(cx, cy - 20, cx + 10, cy - 16);
      ctx.stroke();

      // 9. Giant Ladle / Spatula in hand
      const ladleAngle = Math.sin(this.walkCycle * 2) * 0.2;
      ctx.save();
      ctx.translate(this.facingLeft ? cx - 44 : cx + 44, cy - 5);
      ctx.rotate(this.facingLeft ? -0.8 + ladleAngle : 0.8 - ladleAngle);
      // Handle
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-3, -40, 6, 40);
      // Ladle head
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.ellipse(0, -42, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a16207';
      ctx.beginPath(); ctx.ellipse(0, -42, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // 10. Badge text
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👨‍👩‍👧 ผู้ปกครอง', cx, cy - 58);
    } else if (this.bossType === 'hsk1_3' || game.currentLevel === 14 || game.currentLevel === 16) {
      // --- THEMED SCHOLAR BOSS: GRAND TEACHER (ท่านอาจารย์ใหญ่ 👨‍🏫📜) ---
      // 1. Robe / Torso (Imperial crimson scholar gown with gold lining)
      const robeGrad = ctx.createLinearGradient(cx - 40, cy - 25, cx + 40, cy + 45);
      robeGrad.addColorStop(0, '#991b1b');
      robeGrad.addColorStop(0.5, '#7f1d1d');
      robeGrad.addColorStop(1, '#450a0a');
      ctx.fillStyle = robeGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 44, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(cx, cy + 10, 44, 38, 0, 0, Math.PI * 2); ctx.stroke();

      // Golden collar sash & jade medallion
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 10);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx + 18, cy - 10);
      ctx.stroke();

      // Jade Scholar Pendant
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(cx, cy + 18, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();

      // 2. Head (Wise elder skin tone)
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath(); ctx.arc(cx, cy - 26, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 1.5; ctx.stroke();

      // 3. Scholar Cap (Guan Mao with gold wings)
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 36);
      ctx.lineTo(cx + 24, cy - 36);
      ctx.lineTo(cx + 20, cy - 56);
      ctx.lineTo(cx - 20, cy - 56);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke();

      // Cap Wings (Golden scholar ribbons)
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(cx - 40, cy - 44, 18, 5);
      ctx.fillRect(cx + 22, cy - 44, 18, 5);
      // Red gem on cap
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy - 46, 4, 0, Math.PI * 2); ctx.fill();

      // 4. Wise Long White Beard & Hair
      ctx.fillStyle = '#f8fafc';
      // Side hair
      ctx.beginPath(); ctx.arc(cx - 20, cy - 22, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 20, cy - 22, 7, 0, Math.PI * 2); ctx.fill();
      // Flowing beard
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 14);
      ctx.lineTo(cx + 14, cy - 14);
      ctx.lineTo(cx + 6, cy + 18);
      ctx.lineTo(cx, cy + 26);
      ctx.lineTo(cx - 6, cy + 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.2; ctx.stroke();

      // 5. Eyes with Spectacles
      const isBlinking = (this.eyeBlink % 4) < 0.15;
      const ed = this.facingLeft ? -1 : 1;
      const lx = cx + ed * 6 - 9, rx = cx + ed * 6 + 5, ey = cy - 28;
      if (!isBlinking) {
        // Gold rim glasses
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(lx, ey, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ey, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + 6, ey); ctx.lineTo(rx - 6, ey); ctx.stroke();
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(lx, ey, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx, ey, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath(); ctx.arc(lx + ed, ey, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx + ed, ey, 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(lx, ey, 5, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ey, 5, 0, Math.PI); ctx.stroke();
      }

      // 6. Huge Ancient Bamboo Scroll in Hand
      const scrollAngle = Math.sin(this.walkCycle * 2) * 0.18;
      ctx.save();
      ctx.translate(this.facingLeft ? cx - 42 : cx + 42, cy - 2);
      ctx.rotate(this.facingLeft ? -0.5 + scrollAngle : 0.5 - scrollAngle);
      // Bamboo scroll cylinder
      ctx.fillStyle = '#d97706';
      drawRoundRect(ctx, -6, -35, 12, 45, 3, true, false);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5;
      drawRoundRect(ctx, -6, -35, 12, 45, 3, false, true);
      // Red ribbon around scroll
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -16, 12, 6);
      ctx.restore();

      // 7. Title Badge
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👨‍🏫 อาจารย์ใหญ่ (Lao Shi)', cx, cy - 62);
    } else {
      // Standard Boss Body
      const grad = ctx.createRadialGradient(cx-10, cy-10, 5, cx, cy, 50);
      grad.addColorStop(0, '#ef4444'); // Bright red center
      grad.addColorStop(0.5, '#7f1d1d'); // Dark crimson middle
      grad.addColorStop(1, '#111827'); // Black edge
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy+8, 48, 40, 0, 0, Math.PI*2);
      ctx.fill();

      // Antenna/Horns
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 20, this.y + 15);
      ctx.lineTo(cx - 35, this.y - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 20, this.y + 15);
      ctx.lineTo(cx + 35, this.y - 15);
      ctx.stroke();
      
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath(); ctx.arc(cx-35, this.y-15, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+35, this.y-15, 6, 0, Math.PI*2); ctx.fill();

      // Red Glowing Eyes
      const isBlinking = (this.eyeBlink % 4) < 0.15;
      const ed = this.facingLeft ? -1 : 1;
      const lx = cx + ed*12 - 18, rx = cx + ed*12 + 6, ey = cy - 4;
      if (!isBlinking) {
        ctx.fillStyle = '#fef08a'; // Yellow white outer eye
        ctx.beginPath(); ctx.arc(lx, ey, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx, ey, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#dc2626'; // Glowing red pupil
        ctx.beginPath(); ctx.arc(lx+ed*2, ey+1, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx+ed*2, ey+1, 5, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(lx, ey, 8, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ey, 8, 0, Math.PI); ctx.stroke();
      }

      // Angered Eyebrows
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(lx-8, ey-12); ctx.lineTo(lx+6, ey-6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx-6, ey-6); ctx.lineTo(rx+8, ey-12); ctx.stroke();

      // Angry Mouth
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 22);
      ctx.quadraticCurveTo(cx, cy + 12, cx + 15, cy + 22);
      ctx.stroke();
    }

    ctx.restore(); // restore scale

    // Draw Boss HP Bar
    const barWidth = 100;
    const barHeight = 8;
    const bx = cx - barWidth / 2;
    const by = this.y - 25;
    
    // HP Bar background
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(bx, by, barWidth, barHeight);
    
    // HP Bar fill
    const fillRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = (game.currentLevel === 11 || this.bossType === 'appliances') ? '#38bdf8' : '#dc2626';
    ctx.fillRect(bx, by, barWidth * fillRatio, barHeight);
    
    // HP Bar border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, barWidth, barHeight);

    // Boss Name
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('守护者 (ผู้พิทักษ์) ' + this.hp + '/' + this.maxHp + ' HP', cx, this.y - 32);

    // Stomp indicator arrow if not dying
    if (!this.dying) {
      const pulse = 0.55 + Math.sin(Date.now() * 0.005) * 0.45;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('▼', cx, this.y - 45);
    }
    
    ctx.restore();
  }
}

// ==========================================
// PLAYER-ENEMY COLLISION
// ==========================================
function checkEnemyCollisions(dt) {
  for (let enemy of game.enemies) {
    if (!enemy.alive || enemy.dying) continue;
    const pL = player.x, pR = player.x + player.width;
    const pT = player.y, pB = player.y + player.height;
    const eL = enemy.x, eR = enemy.x + enemy.width;
    const eT = enemy.y, eB = enemy.y + enemy.height;
    if (!(pR > eL && pL < eR && pB > eT && pT < eB)) continue;
    // Stomp: player falling and was above enemy top before this frame
    const prevBottom = pB - (player.vy * dt * 60);
    if (player.vy > 0 && prevBottom <= eT + 14) {
      enemy.die();
      audio.playStomp();
      // Turtle character (id 3) gets double jade from stomping enemies
      const jadeReward = (game.selectedCharacter === 3) ? 2 : 1;
      profileManager.addJade(jadeReward);
      game.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (game.jadeCount + jadeReward);
      updateHUD();
      player.vy = player.getJumpVel() * 0.65;
      player.jumpCount = 0;
      showFloatingText(enemy.x + 16, enemy.y - 16, '+' + jadeReward + ' 玉', '#12d58a');
    } else if (player.invincibleTimer <= 0) {
      player.health--;
      player.invincibleTimer = 1.5;
      audio.playDamage();
      updateHUD();
      const kd = player.x < enemy.x + enemy.width / 2 ? -1 : 1;
      player.vx = kd * 7; player.vy = -4;
      const hudCard = document.getElementById('hud-health-card');
      if (hudCard) { hudCard.classList.add('shake-effect'); setTimeout(()=>hudCard.classList.remove('shake-effect'),500); }
      const cont = document.querySelector('.canvas-container');
      if (cont) { cont.classList.add('damage-flash'); setTimeout(()=>cont.classList.remove('damage-flash'),300); }
      if (player.health <= 0) {
        game.isQuestionActive = true;
        audio.playDefeat();
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('question-modal').classList.add('hidden');
        const lvlText = LEVELS_CONFIG[game.currentLevel].name || ('ด่าน ' + game.currentLevel);
        document.getElementById('game-over-level').innerText = lvlText;
        const tm = LEVELS_CONFIG[game.currentLevel].heightMeters;
        let rh = Math.floor(Math.abs(player.y) / 14.5);
        if (rh < 0) rh = 0; if (rh > tm) rh = tm;
        document.getElementById('game-over-height').innerText = rh + 'm / ' + tm + 'm';
        const jadeEl = document.getElementById('game-over-jade');
        if (jadeEl) jadeEl.innerText = game.jadeCount;
        document.getElementById('game-over-screen').classList.remove('hidden');
      }
    }
  }

  // Player-Boss collision check
  if (game.bosses && game.bosses.length > 0) {
    for (let boss of game.bosses) {
      if (boss.alive && !boss.dying) {
        const pL = player.x, pR = player.x + player.width;
        const pT = player.y, pB = player.y + player.height;
        const bL = boss.x, bR = boss.x + boss.width;
        const bT = boss.y, bB = boss.y + boss.height;

        if (pR > bL && pL < bR && pB > bT && pT < bB) {
          const prevBottom = pB - (player.vy * dt * 60);
          if (player.vy > 0 && prevBottom <= bT + 20) {
            // Player stomped on Boss!
            player.vy = player.getJumpVel() * 0.75;
            player.jumpCount = 0;
            
            // Take 1 HP and trigger Boss question
            game.activeBossTarget = boss;
            boss.takeDamage(1);
            if (boss.alive) {
              triggerBossQuestion(boss);
            }
          } else if (player.invincibleTimer <= 0) {
            // Player took damage from Boss body contact
            player.health--;
            player.invincibleTimer = 1.5;
            audio.playDamage();
            updateHUD();
            const kd = player.x < boss.x + boss.width / 2 ? -1 : 1;
            player.vx = kd * 8; player.vy = -5;
            const hudCard = document.getElementById('hud-health-card');
            if (hudCard) { hudCard.classList.add('shake-effect'); setTimeout(()=>hudCard.classList.remove('shake-effect'),500); }
            const cont = document.querySelector('.canvas-container');
            if (cont) { cont.classList.add('damage-flash'); setTimeout(()=>cont.classList.remove('damage-flash'),300); }
            
            if (player.health <= 0) {
              game.isQuestionActive = true;
              audio.playDefeat();
              document.getElementById('hud').classList.add('hidden');
              document.getElementById('question-modal').classList.add('hidden');
              const lvlText = LEVELS_CONFIG[game.currentLevel].isSpecial ? LEVELS_CONFIG[game.currentLevel].name : 'ด่าน ' + game.currentLevel;
              document.getElementById('game-over-level').innerText = lvlText;
              const tm = LEVELS_CONFIG[game.currentLevel].heightMeters;
              let rh = Math.floor(Math.abs(player.y) / 14.5);
              if (rh < 0) rh = 0; if (rh > tm) rh = tm;
              document.getElementById('game-over-height').innerText = rh + 'm / ' + tm + 'm';
              const jadeEl = document.getElementById('game-over-jade');
              if (jadeEl) jadeEl.innerText = game.jadeCount;
              document.getElementById('game-over-screen').classList.remove('hidden');
            }
          }
        }
      }
    }
  }
}

// Floating "+1 jade" text above enemy
function showFloatingText(x, y, text, color) {
  game.floatingTexts = game.floatingTexts || [];
  game.floatingTexts.push({
    x, y, text, color, life: 1.3, vy: -1.8,
    update(dt) { this.y += this.vy; this.life -= dt; },
    draw(ctx) {
      if (this.life <= 0) return;
      const a = Math.min(1, this.life / 0.5);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = 'bold 17px "Noto Serif TC", serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 3;
      ctx.strokeText(text, this.x, this.y);
      ctx.fillStyle = color;
      ctx.fillText(text, this.x, this.y);
      ctx.restore();
    }
  });
}

function generateLevel() {
  const levelData = LEVELS_CONFIG[game.currentLevel];
  PEAK_HEIGHT = levelData.heightMeters * 14.5;
  TOTAL_HEIGHT = PEAK_HEIGHT + 500;

  game.platforms = [];
  game.shards = [];
  game.checkpoints = [];
  game.enemies = [];
  game.boss = null;
  game.bossProjectiles = [];

  // Unique random seed per level
  const rand = new SeededRandom(888 + game.currentLevel * 111);

  // 1. Starting Platform (Ground)
  game.platforms.push(new Platform(50, -100, V_WIDTH - 100, 40, 'normal'));
  
  // 2. Procedural platform generation ascending vertically
  let currentY = -220;
  const platformHeight = 22;

  // Track height zones (generate platforms all the way to the peak at 100% height)
  while (Math.abs(currentY) < PEAK_HEIGHT - 300) {
    const relativeHeight = Math.abs(currentY);
    const zone = relativeHeight < PEAK_HEIGHT * 0.33 ? 1 
               : relativeHeight < PEAK_HEIGHT * 0.66 ? 2 
               : 3;

    // Platform widths shrink as we climb (harder)
    let pWidth = 140 - (relativeHeight / PEAK_HEIGHT) * 65;
    if (pWidth < 65) pWidth = 65;

    // Gap ranges increase as we climb
    let minGapX = 50;
    let maxGapX = 220 + (relativeHeight / PEAK_HEIGHT) * 120;
    if (maxGapX > 380) maxGapX = 380;

    let minGapY = 70;
    let maxGapY = 110 + (relativeHeight / PEAK_HEIGHT) * 60;
    if (maxGapY > 175) maxGapY = 175;

    // Determine platform type based on zone
    let pType = 'normal';
    const typeRoll = rand.next();

    if (zone === 1) {
      // Zone 1: Bamboo Valley (Mostly Normal, few bouncy drums)
      if (typeRoll < 0.12) pType = 'bouncy';
    } else if (zone === 2) {
      // Zone 2: Cloud Temple (Moving platforms, crumbly clouds, bouncy drums)
      if (typeRoll < 0.22) pType = 'moving';
      else if (typeRoll < 0.40) pType = 'crumbly';
      else if (typeRoll < 0.48) pType = 'bouncy';
    } else if (zone === 3) {
      // Zone 3: Cosmic Tao (All platforms types, introducing slippery jade ice)
      if (typeRoll < 0.22) pType = 'moving';
      else if (typeRoll < 0.38) pType = 'crumbly';
      else if (typeRoll < 0.52) pType = 'slippery';
      else if (typeRoll < 0.62) pType = 'bouncy';
    }

    // Level 12 (Daily Life): Override with more complex platform mix from the start
    // No enemies, so complexity comes purely from tricky platforms
    if (game.currentLevel === 12) {
      const dlRoll = rand.next();
      if (zone === 1) {
        // Early zone: introduce moving & bouncy early
        if (dlRoll < 0.18) pType = 'moving';
        else if (dlRoll < 0.30) pType = 'bouncy';
        else if (dlRoll < 0.38) pType = 'crumbly';
      } else if (zone === 2) {
        // Mid zone: full mix with slippery
        if (dlRoll < 0.22) pType = 'moving';
        else if (dlRoll < 0.38) pType = 'crumbly';
        else if (dlRoll < 0.50) pType = 'slippery';
        else if (dlRoll < 0.62) pType = 'bouncy';
      } else {
        // High zone: heavy mix, lots of tricky platforms
        if (dlRoll < 0.25) pType = 'moving';
        else if (dlRoll < 0.42) pType = 'crumbly';
        else if (dlRoll < 0.58) pType = 'slippery';
        else if (dlRoll < 0.70) pType = 'bouncy';
      }
    }

    // Level 13 (Hobbies - งานอดิเรก): Complex platform layout without spikes (moving, bouncy, crumbly, slippery)
    if (game.currentLevel === 13) {
      pWidth = Math.max(56, pWidth * 0.88);
      const hobRoll = rand.next();
      if (zone === 1) {
        if (hobRoll < 0.30) pType = 'moving';
        else if (hobRoll < 0.55) pType = 'bouncy';
        else pType = 'normal';
      } else if (zone === 2) {
        if (hobRoll < 0.30) pType = 'moving';
        else if (hobRoll < 0.50) pType = 'crumbly';
        else if (hobRoll < 0.70) pType = 'bouncy';
        else pType = 'normal';
      } else {
        if (hobRoll < 0.30) pType = 'moving';
        else if (hobRoll < 0.50) pType = 'crumbly';
        else if (hobRoll < 0.70) pType = 'slippery';
        else if (hobRoll < 0.85) pType = 'bouncy';
        else pType = 'normal';
      }
    }

    // Level 14 (HSK1 - บท 3) & Level 16 (HSK1 - บท 4): Complex platforms with timed spikes, moving, slippery, crumbly, bouncy
    if (game.currentLevel === 14 || game.currentLevel === 16) {
      pWidth = Math.max(54, pWidth * 0.86);
      const hskRoll = rand.next();
      if (zone === 1) {
        if (hskRoll < 0.22) pType = 'spikes';
        else if (hskRoll < 0.44) pType = 'moving';
        else if (hskRoll < 0.60) pType = 'bouncy';
        else pType = 'normal';
      } else if (zone === 2) {
        if (hskRoll < 0.24) pType = 'spikes';
        else if (hskRoll < 0.46) pType = 'moving';
        else if (hskRoll < 0.60) pType = 'crumbly';
        else if (hskRoll < 0.74) pType = 'bouncy';
        else pType = 'normal';
      } else {
        if (hskRoll < 0.26) pType = 'spikes';
        else if (hskRoll < 0.48) pType = 'moving';
        else if (hskRoll < 0.62) pType = 'crumbly';
        else if (hskRoll < 0.76) pType = 'slippery';
        else if (hskRoll < 0.88) pType = 'bouncy';
        else pType = 'normal';
      }
    }

    // Level 15 (Special Objects - คำศัพท์เฉพาะกิจ): Complex platform layout without spikes (identical to Level 13)
    if (game.currentLevel === 15) {
      pWidth = Math.max(56, pWidth * 0.88);
      const spRoll = rand.next();
      if (zone === 1) {
        if (spRoll < 0.30) pType = 'moving';
        else if (spRoll < 0.55) pType = 'bouncy';
        else pType = 'normal';
      } else if (zone === 2) {
        if (spRoll < 0.30) pType = 'moving';
        else if (spRoll < 0.50) pType = 'crumbly';
        else if (spRoll < 0.70) pType = 'bouncy';
        else pType = 'normal';
      } else {
        if (spRoll < 0.30) pType = 'moving';
        else if (spRoll < 0.50) pType = 'crumbly';
        else if (spRoll < 0.70) pType = 'slippery';
        else if (spRoll < 0.85) pType = 'bouncy';
        else pType = 'normal';
      }
    }

    // Generate x coordinate (ensure fits inside screen boundaries)
    const pX = rand.nextRange(25, V_WIDTH - pWidth - 25);
    
    // In Level 4, 10, 11, 12, 14, 16 (at 600m) and Level 5 (at 500m & 1000m), skip procedural platform generation if too close to boss platforms
    let skipProcedural = false;
    if ((game.currentLevel === 4 || game.currentLevel === 10 || game.currentLevel === 11 || game.currentLevel === 12 || game.currentLevel === 14 || game.currentLevel === 16) && Math.abs(currentY - (-600 * 14.5)) < 120) {
      skipProcedural = true;
    }
    if (game.currentLevel === 5 && (Math.abs(currentY - (-500 * 14.5)) < 120 || Math.abs(currentY - (-1000 * 14.5)) < 120)) {
      skipProcedural = true;
    }

    if (!skipProcedural) {
      // Create platform
      const platform = new Platform(pX, currentY, pWidth, platformHeight, pType);
      game.platforms.push(platform);

      // Spawn Jade Shards on platforms
      const shardRoll = rand.next();
      if (shardRoll < 0.65 && pType !== 'crumbly') { // 65% chance
        // Place jade shards floating above platform
        const shardX = platform.x + platform.width / 2 - 9;
        const shardY = platform.y - 45;
        game.shards.push(new JadeShard(shardX, shardY));
      }

      // Spawn enemies on platforms — all levels, scaling difficulty by level & zone
      {
        // Base spawn chance scales up with level
        let baseChance = [0, 0.40, 0.48, 0.55, 0.62, 0.68][game.currentLevel] || 0.48;
        if (game.currentLevel === 13 || game.currentLevel === 14 || game.currentLevel === 15 || game.currentLevel === 16) baseChance = 0.58;
        // Zone 1: all levels. Zone 2: level 2+. Zone 3: level 3+
        const zoneAllowed = zone === 1 || (zone === 2 && game.currentLevel >= 2) || (zone === 3 && game.currentLevel >= 3);
        // Enemies only spawn on platforms wide enough (normal/moving/spikes) — not crumbly/slippery (in lvl 15, also allowed on bouncy)
        const typeAllowed = pType === 'normal' || (pType === 'moving' && game.currentLevel >= 3) || (pType === 'spikes' && (game.currentLevel === 14 || game.currentLevel === 16)) || (pType === 'bouncy' && game.currentLevel === 15);
        const widthOk = pWidth >= (game.currentLevel === 13 || game.currentLevel === 14 || game.currentLevel === 15 || game.currentLevel === 16 ? 54 : 75);

        if (game.currentLevel > 1 && game.currentLevel !== 9 && zoneAllowed && typeAllowed && widthOk) {
          const platMeters = Math.floor(Math.abs(platform.y) / 14.5);
          let allowed = true;
          if (game.currentLevel === 3) {
            if (platMeters < 300 || pType === 'moving') {
              allowed = false;
            }
          }
          
          if (allowed) {
            // Zone 2 & 3 have slightly higher chance
            const zoneBonus = zone === 2 ? 0.08 : zone === 3 ? 0.14 : 0;
            let spawnChance = (baseChance + zoneBonus) * 0.6;
            // +20% enemies in Level 13, 14, 16, +40% in Level 15
            if (game.currentLevel === 13 || game.currentLevel === 14 || game.currentLevel === 16) {
              spawnChance *= 1.20;
            }
            if (game.currentLevel === 15) {
              spawnChance *= 1.40;
            }
            const enemyRoll = rand.next();
            if (enemyRoll < spawnChance) {
              const enemyX = platform.x + platform.width / 2 - 16;
              const enemyY = platform.y - 36;
              // Speed: levels 1-3 scale up, levels 4-5 fixed at 2.0
              let enemySpeed;
              if (game.currentLevel >= 4) {
                enemySpeed = 2.0;
              } else {
                const levelSpeedMult = 1 + (game.currentLevel - 1) * 0.35;
                const zoneSpeedMult = 1 + (zone - 1) * 0.15;
                enemySpeed = Math.min(1.2 * levelSpeedMult * zoneSpeedMult, 2.0);
              }
              if (game.currentLevel === 3) {
                enemySpeed *= 0.5;
              }
              enemySpeed *= 0.4; // Reduce speed by 60%
              const enemy = new Enemy(enemyX, enemyY, platform.x, platform.x + platform.width, enemySpeed, platform);
              if ((game.currentLevel === 3 || game.currentLevel === 11 || game.currentLevel === 14 || game.currentLevel === 16) && platMeters >= 350) {
                if (rand.next() < 0.5) {
                  enemy.isFlying = true;
                  enemy.y = platform.y - 50;
                  enemy.startY = enemy.y;
                }
              }
              game.enemies.push(enemy);
            }
          }
        }
      }

      // Spawn Gong Checkpoints every ~1000px vertically (~100m)
      // Ensure it falls on a Normal platform so it isn't moving/crumbly
      const nearCheckpointMilestone = Math.floor(relativeHeight / 1200) > Math.floor((relativeHeight - Math.abs(currentY - platform.y)) / 1200);
      if (nearCheckpointMilestone && pType === 'normal' && pWidth > 80) {
        const gongX = platform.x + platform.width / 2 - 30;
        const gongY = platform.y - 70;
        game.checkpoints.push(new Checkpoint(gongX, gongY));
      }
    }

    // Step upwards
    const stepY = rand.nextRange(minGapY, maxGapY);
    currentY -= stepY;
  }

  game.bosses = [];

  // Spawn Boss in Level 4, 10, 11, 12, 14, 16 at 600m
  if (game.currentLevel === 4 || game.currentLevel === 10 || game.currentLevel === 11 || game.currentLevel === 12 || game.currentLevel === 14 || game.currentLevel === 16) {
    const bossY = -600 * 14.5;
    // Create a special boss platform
    const bossPlat = new Platform(V_WIDTH / 2 - 100, bossY, 200, 22, 'normal');
    game.platforms.push(bossPlat);
    // Spawn the boss centered on the platform
    let bType = 'normal';
    if (game.currentLevel === 10) bType = 'lvl10';
    if (game.currentLevel === 11) bType = 'appliances';
    if (game.currentLevel === 12) bType = 'dailylife';
    if (game.currentLevel === 14 || game.currentLevel === 16) bType = 'hsk1_3';
    const b = new Boss(bossPlat.x + bossPlat.width / 2 - 48, bossPlat.y - 96, bossPlat, bType);
    game.bosses.push(b);
    game.boss = b;
  }

  // Spawn 2 Bosses in Level 5 (Boss 1 at 500m, Boss 2 at 1000m)
  if (game.currentLevel === 5) {
    // Boss 1 at 500m (10 HP, 1-spike downward every 3s)
    const b1Y = -500 * 14.5;
    const b1Plat = new Platform(V_WIDTH / 2 - 100, b1Y, 200, 22, 'normal');
    game.platforms.push(b1Plat);
    const b1 = new Boss(b1Plat.x + b1Plat.width / 2 - 48, b1Plat.y - 96, b1Plat, 'lvl5_1');
    game.bosses.push(b1);

    // Boss 2 at 1000m (15 HP (+50%), 3-spikes downward every 2s)
    const b2Y = -1000 * 14.5;
    const b2Plat = new Platform(V_WIDTH / 2 - 100, b2Y, 200, 22, 'normal');
    game.platforms.push(b2Plat);
    const b2 = new Boss(b2Plat.x + b2Plat.width / 2 - 48, b2Plat.y - 96, b2Plat, 'lvl5_2');
    game.bosses.push(b2);

    game.boss = b1;
  }

  // 3. Special Finish Line Platform and Gate at 90% of level height (with Rainbow base)
  const finishHeight = PEAK_HEIGHT * 0.9;
  const finishPlatform = new Platform(V_WIDTH / 2 - 80, -finishHeight, 160, 22, 'normal');
  game.platforms.push(finishPlatform);

  // Magnificent Celestial Gate (Finish Line)
  game.checkpoints.push(new Checkpoint(V_WIDTH / 2 - 60, -finishHeight - 110, true));

  // 4. Summit Celestial Palace Platform (Final Peak at 100% height)
  const summitWidth = V_WIDTH - 200;
  const summitPlatform = new Platform(100, -PEAK_HEIGHT, summitWidth, 60, 'normal');
  game.platforms.push(summitPlatform);

  // Standard checkpoint gong at the very summit
  game.checkpoints.push(new Checkpoint(V_WIDTH / 2 - 30, -PEAK_HEIGHT - 70, false));
}

// Check collision between AABB boxes
function checkAABB(b1, b2) {
  return b1.x < b2.x + b2.width &&
         b1.x + b1.width > b2.x &&
         b1.y < b2.y + b2.height &&
         b1.y + b1.height > b2.y;
}

// Physics & Collision resolution loops
function handleCollisions(dt) {
  player.grounded = false;

  // Let vertical movement happen
  // Check overlap with platforms
  for (let platform of game.platforms) {
    if (platform.crumbled) continue;

    // AABB intersection check
    if (checkAABB(player, platform)) {
      // Check if player lands on top of the platform (downward moving velocity)
      const prevBottom = player.y - (player.vy * dt * 60) + player.height;
      if (player.vy >= 0 && prevBottom <= platform.y + 12) {
        // Fall damage check if they land from the air
        if (!player.grounded) {
          const fallMeters = (player.y - player.highestY) / 14.5;
          if (fallMeters >= 50) {
            triggerFallDamage(fallMeters);
          }
        }

        player.y = platform.y - player.height;
        player.vy = 0;
        player.grounded = true;
        player.jumpCount = 0;

        // Bouncy Platform Effect
        if (platform.type === 'bouncy') {
          player.vy = player.getJumpVel() * 1.58; // Huge bounce boost!
          player.grounded = false;
          player.jumpCount = 1;
          player.squashX = 0.55;
          player.squashY = 1.45;
          audio.playJump();
          // Bounce drum spark particles
          for (let i = 0; i < 12; i++) {
            game.particles.push(
              new Particle(
                player.x + player.width/2, platform.y,
                '#ffd700',
                (Math.random() - 0.5) * 8,
                -Math.random() * 5 - 2,
                3 + Math.random() * 3,
                0.5 + Math.random() * 0.4
              )
            );
          }
        }
        
        // Crumbly Cloud triggers timer (unless player is Character 5, Cloud Master)
        if (platform.type === 'crumbly' && game.selectedCharacter !== 5) {
          if (platform.crumbleTimer === 0) {
            platform.crumbleTimer = 0.001; // trigger
            audio.playCollapse();
          }
        }

        // Stick to moving platform horizontal speed
        if (platform.type === 'moving') {
          player.x += platform.vx * platform.direction * dt * 60;
        }

        // Timed Spikes Platform landing damage
        if (platform.type === 'spikes' && platform.spikesExtended) {
          triggerSpikeDamage(platform);
        }
      }
    }
  }

  // Standing on active spikes hazard check (if spikes erupt while standing)
  if (player.grounded) {
    const standingPlat = player.getStandingPlatform();
    if (standingPlat && standingPlat.type === 'spikes' && standingPlat.spikesExtended) {
      triggerSpikeDamage(standingPlat);
    }
  }

  // Jade collect check
  for (let shard of game.shards) {
    if (!shard.collected && checkAABB(player, shard)) {
      shard.collected = true;
      profileManager.addJade(1);
      game.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (game.jadeCount + 1);
      audio.playCollect();
      updateHUD();

      // Sparkle particles
      for (let i = 0; i < 8; i++) {
        game.particles.push(
          new Particle(
            shard.x + 9, shard.y + 12,
            '#12d58a',
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            2 + Math.random() * 2,
            0.4 + Math.random() * 0.3
          )
        );
      }
    }
  }

  // Checkpoint Gong collision check
  for (let cp of game.checkpoints) {
    if (checkAABB(player, cp)) {
      // Is this the peak finish gate?
      if (cp.isFinish) {
        handleLevelCleared();
        return;
      }

      if (!cp.active) {
        // Deactivate other gongs first
        for (let otherCp of game.checkpoints) {
          otherCp.active = false;
        }
        cp.active = true;
        // Do not update checkpoint coordinates mid-level anymore so player restarts stage on respawn
        audio.playGong();
        audio.playCheckpoint();

        // Gong flash particles
        for (let i = 0; i < 25; i++) {
          game.particles.push(
            new Particle(
              cp.x + cp.width / 2, cp.y + 40,
              '#ffd700',
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6,
              3 + Math.random() * 4,
              0.8 + Math.random() * 0.4
            )
          );
        }
      }
    }
  }
}

// Trigger Fall Damage when player falls >= 50m
function triggerFallDamage(meters) {
  // Character 4 (กายแกร่ง) is immune to fall damage
  if (game.selectedCharacter === 4) return;

  player.health--;
  audio.playDamage();
  updateHUD();
  
  // Shake HUD health card
  const hudHealthCard = document.getElementById('hud-health-card');
  if (hudHealthCard) {
    hudHealthCard.classList.add('shake-effect');
    setTimeout(() => hudHealthCard.classList.remove('shake-effect'), 500);
  }
  
  // Vignette red flash effect on canvas wrapper
  const container = document.querySelector('.canvas-container');
  if (container) {
    container.classList.add('damage-flash');
    setTimeout(() => container.classList.remove('damage-flash'), 300);
  }
  
  if (player.health <= 0) {
    // Player dies from fall damage - Trigger Permadeath Game Over
    game.isQuestionActive = true; // Freeze physics
    audio.playDefeat();
    
    // Hide HUD
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('question-modal').classList.add('hidden');
    
    // Populate stats for Game Over screen
    const lvlText = LEVELS_CONFIG[game.currentLevel].name || `ด่าน ${game.currentLevel}`;
    document.getElementById('game-over-level').innerText = lvlText;
    
    const targetMeters = LEVELS_CONFIG[game.currentLevel].heightMeters;
    let realHeight = Math.floor(Math.abs(player.y) / 14.5);
    if (realHeight < 0) realHeight = 0;
    if (realHeight > targetMeters) realHeight = targetMeters;
    document.getElementById('game-over-height').innerText = `${realHeight}m / ${targetMeters}m`;
    
    const jadeEl = document.getElementById('game-over-jade');
    if (jadeEl) jadeEl.innerText = game.jadeCount;
    
    // Show Game Over overlay
    document.getElementById('game-over-screen').classList.remove('hidden');
  }
}

// Trigger Spike Damage when player lands or stands on active spikes
function triggerSpikeDamage(platform) {
  if (player.invincibleTimer <= 0) {
    player.health--;
    player.invincibleTimer = 1.5;
    audio.playDamage();
    updateHUD();
    player.vy = -8.5; // Hurt knockback bounce upward
    player.grounded = false;
    player.squashX = 0.6;
    player.squashY = 1.4;

    // Red spark particles
    for (let i = 0; i < 14; i++) {
      game.particles.push(
        new Particle(
          player.x + player.width / 2,
          platform.y,
          '#ef4444',
          (Math.random() - 0.5) * 6,
          -Math.random() * 4 - 1,
          2.5 + Math.random() * 2.5,
          0.4 + Math.random() * 0.3
        )
      );
    }

    const hudCard = document.getElementById('hud-health-card');
    if (hudCard) { hudCard.classList.add('shake-effect'); setTimeout(()=>hudCard.classList.remove('shake-effect'), 500); }
    const cont = document.querySelector('.canvas-container');
    if (cont) { cont.classList.add('damage-flash'); setTimeout(()=>cont.classList.remove('damage-flash'), 300); }

    if (player.health <= 0) {
      game.isQuestionActive = true;
      audio.playDefeat();
      document.getElementById('hud').classList.add('hidden');
      document.getElementById('question-modal').classList.add('hidden');
      const lvlText = LEVELS_CONFIG[game.currentLevel].name || ('ด่าน ' + game.currentLevel);
      document.getElementById('game-over-level').innerText = lvlText;
      const tm = LEVELS_CONFIG[game.currentLevel].heightMeters;
      let rh = Math.floor(Math.abs(player.y) / 14.5);
      if (rh < 0) rh = 0; if (rh > tm) rh = tm;
      document.getElementById('game-over-height').innerText = rh + 'm / ' + tm + 'm';
      const jadeEl = document.getElementById('game-over-jade');
      if (jadeEl) jadeEl.innerText = game.jadeCount;
      document.getElementById('game-over-screen').classList.remove('hidden');
    }
  }
}

// Respawn / Restart current stage from beginning
function respawnAtCheckpoint() {
  if (game.state !== 'PLAYING') return;

  // Reset stage checkpoint coordinates to the starting platform
  game.lastCheckpointX = V_WIDTH / 2 - 20;
  game.lastCheckpointY = -140;

  // Reset player state to starting platform and full health (5 hearts)
  player.x = game.lastCheckpointX;
  player.y = game.lastCheckpointY;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.jumpCount = 0;
  player.highestY = game.lastCheckpointY;

  // Reset question milestones and state for the current stage
  game.lastQuestionClearedHeight = 0;
  game.currentQuestionMilestone = 0;
  game.isQuestionActive = false;

  // Regenerate level platforms, shards, and gongs
  generateLevel();

  // Snap camera
  camera.y = player.y - V_HEIGHT * 0.65;
  camera.targetY = camera.y;

  audio.playFall();

  // Update HUD values
  updateHUD();

  // Teleport particle pop
  for (let i = 0; i < 20; i++) {
    game.particles.push(
      new Particle(
        player.x + player.width/2, player.y + player.height/2,
        '#c8102e',
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        2.5 + Math.random() * 3,
        0.5 + Math.random() * 0.4
      )
    );
  }
}

// Game Play/UI State Actions
function startGame() {
  audio.init();
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('game-over-screen').classList.add('hidden');
  
  game.state = 'PLAYING';
  game.currentLevel = game.pendingLevel || 1;
  const currentProfile = profileManager.getActiveProfile();
  game.jadeCount = currentProfile ? currentProfile.jade : 0;
  game.altitude = 0;
  if (currentProfile && currentProfile.upgrades) {
    game.upgrades = { ...currentProfile.upgrades };
  } else {
    game.upgrades = { jump: 0, speed: 0, doublejump: 0, float: 0, shooting: 0 };
  }
  game.projectiles = [];
  game.shootCooldown = 0;
  document.getElementById('level-clear-screen').classList.add('hidden');
  document.getElementById('level-select-screen').classList.add('hidden');
  
  // Reset peak and total heights to selected level values
  const levelData = LEVELS_CONFIG[game.currentLevel];
  PEAK_HEIGHT = levelData.heightMeters * 14.5;
  TOTAL_HEIGHT = PEAK_HEIGHT + 500;
  
  // Reset starting checkpoint coordinates
  game.lastCheckpointX = V_WIDTH / 2 - 20;
  game.lastCheckpointY = -140;

  // Reset question flags
  game.lastQuestionClearedHeight = 0;
  game.currentQuestionMilestone = 0;
  game.askedQuestionIds.clear();
  game.isQuestionActive = false;
  document.getElementById('question-modal').classList.add('hidden');

  player.reset();
  camera.reset();
  
  generateLevel();
  
  // Instantly set camera to avoid jarring scroll on start
  camera.y = player.y - V_HEIGHT * 0.65;
  camera.targetY = camera.y;

  updateHUD();
  updateShopUI();
}

function winGame() {
  game.state = 'WIN';
  audio.playWin();
  document.getElementById('final-jade').innerText = game.jadeCount;
  
  const winTitle = document.querySelector('#win-screen .congrats-title');
  const winSubtitle = document.querySelector('#win-screen .congrats-subtitle');
  const winDesc = document.querySelector('#win-screen .congrats-desc');
  const finalAltitude = document.querySelector('#win-screen .stat-box p strong.gold-text');
  
  if (game.currentLevel === 9) {
    if (winTitle) winTitle.innerText = "SPECIAL CLEAR";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษของน้องเก้าสำเร็จ! 🌸🧸";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนผ่านด่านพิเศษและทำแบบฝึกหัดคำศัพท์ของน้องเก้าได้สำเร็จ! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "1000m";
  } else if (game.currentLevel === 10) {
    if (winTitle) winTitle.innerText = "WORLDWIDE CLEAR";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษ Worldwide สำเร็จ! 🌍";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนผ่านด่านพิเศษและปราบบอสสุดแกร่งพร้อมตอบคำถามคำศัพท์ประเทศและสรรพนามได้สำเร็จ! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "800m";
  } else if (game.currentLevel === 11) {
    if (winTitle) winTitle.innerText = "APPLIANCE MASTER";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษเครื่องใช้ไฟฟ้าสำเร็จ! ⚡🔌";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนผ่านด่านพิเศษและปราบบอสหุ่นยนต์เครื่องใช้ไฟฟ้า พร้อมตอบคำถามคำศัพท์เครื่องใช้ไฟฟ้าได้ครบถ้วน! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "800m";
  } else if (game.currentLevel === 12) {
    if (winTitle) winTitle.innerText = "DAILY LIFE MASTER";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษชีวิตประจำวันสำเร็จ! 🌅🏠";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนผ่านด่านพิเศษชีวิตประจำวันและปราบบอสผู้ปกครองยักษ์ พร้อมตอบคำถามคำศัพท์เกี่ยวกับกิจวัตรประจำวันได้ครบถ้วน! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "800m";
  } else if (game.currentLevel === 13) {
    if (winTitle) winTitle.innerText = "HOBBY MASTER CLEAR";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษงานอดิเรกสำเร็จ! 🎨⚽🎮";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนฝ่าแท่นกลไกและฝูงศัตรู พร้อมตอบคำถามคำศัพท์งานอดิเรกได้อย่างยอดเยี่ยมและแม่นยำ 100%! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "800m";
  } else if (game.currentLevel === 14) {
    if (winTitle) winTitle.innerText = "SCHOLAR MASTER CLEAR";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษ HSK1 - บท 3 สำเร็จ! 📜👨‍🏫🇨🇳";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนฝ่าบันไดเมฆา ปราบท่านอาจารย์ใหญ่ และตอบคำถามคำศัพท์ HSK 1 บท 3 ได้อย่างแม่นยำครบถ้วน! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "800m";
  } else if (game.currentLevel === 15) {
    if (winTitle) winTitle.innerText = "SPECIAL OBJECTS CLEAR";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษคำศัพท์เฉพาะกิจสำเร็จ! 📱🪑💻";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนฝ่าแท่นกลไกและฝูงศัตรู พร้อมตอบคำถามคำศัพท์สิ่งของเฉพาะกิจได้อย่างยอดเยี่ยมและแม่นยำ 100%! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "2000m";
  } else if (game.currentLevel === 16) {
    if (winTitle) winTitle.innerText = "FAMILY SCHOLAR CLEAR";
    if (winSubtitle) winSubtitle.innerText = "ผ่านด่านพิเศษ HSK1 - บท 4 สำเร็จ! 👨‍👩‍👧🏠🇨🇳";
    if (winDesc) {
      winDesc.innerText = "คุณสามารถปีนฝ่าบันไดเมฆา ปราบท่านอาจารย์ใหญ่ และตอบคำถามคำศัพท์ครอบครัว HSK 1 บท 4 ได้อย่างแม่นยำครบถ้วน 100%! ยอดเยี่ยมมากครับ!";
    }
    if (finalAltitude) finalAltitude.innerText = "800m";
  } else {
    if (winTitle) winTitle.innerText = "CELESTIAL REACHED";
    if (winSubtitle) winSubtitle.innerText = "บรรลุสู่สวรรค์เก้าชั้นฟ้า! 🐉";
    if (winDesc) {
      winDesc.innerText = "You successfully scaled the legendary peaks and entered the Celestial Realm! Your agility and wisdom have earned you immortality.";
    }
    if (finalAltitude) finalAltitude.innerText = "5000m";
  }
  
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('win-screen').classList.remove('hidden');
}

function handleLevelCleared() {
  audio.playGong();
  
  const prof = profileManager.getActiveProfile();
  if (prof) {
    if (!prof.levelProgress) prof.levelProgress = { unlockedLevel: 1, highestMilestone: 0 };
    prof.levelProgress.unlockedLevel = Math.max(prof.levelProgress.unlockedLevel || 1, game.currentLevel + 1);
    profileManager.saveUserData(prof);
  }

  if (game.currentLevel === 5 || game.currentLevel === 9 || game.currentLevel === 10 || game.currentLevel === 11 || game.currentLevel === 12 || game.currentLevel === 13 || game.currentLevel === 14 || game.currentLevel === 15 || game.currentLevel === 16) {
    // Reached peak of special standalone levels! Player wins the entire game!
    winGame();
  } else {
    // Level cleared! Show the level-clear-screen modal
    game.isQuestionActive = true; // freeze player physics
    
    const nextLvl = game.currentLevel + 1;
    const nextConfig = LEVELS_CONFIG[nextLvl];
    const currentConfig = LEVELS_CONFIG[game.currentLevel];
    
    document.getElementById('level-clear-title').innerText = `LEVEL ${game.currentLevel} CLEARED`;
    document.getElementById('level-clear-subtitle').innerText = `ผ่านด่าน ${game.currentLevel} สำเร็จ! ${currentConfig.emoji}`;
    document.getElementById('level-clear-desc').innerText = `คุณปีนขึ้นมาถึงความสูง ${currentConfig.heightMeters} เมตรสำเร็จ! มาลุยด่านต่อไปกันเลย!`;
    document.getElementById('next-level-name').innerText = `${nextConfig.name} (ความสูง ${nextConfig.heightMeters} เมตร)`;
    document.getElementById('level-clear-jade').innerText = game.jadeCount;
    
    document.getElementById('level-clear-screen').classList.remove('hidden');
  }
}

function startNextLevel() {
  document.getElementById('level-clear-screen').classList.add('hidden');
  game.currentLevel++;
  
  // Update PEAK_HEIGHT & TOTAL_HEIGHT for the new level
  const levelData = LEVELS_CONFIG[game.currentLevel];
  PEAK_HEIGHT = levelData.heightMeters * 14.5;
  TOTAL_HEIGHT = PEAK_HEIGHT + 500;
  
  // Reset checkpoint coords to start pad of the new level
  game.lastCheckpointX = V_WIDTH / 2 - 20;
  game.lastCheckpointY = -140;

  // Reset question milestones for the new level
  game.lastQuestionClearedHeight = 0;
  game.currentQuestionMilestone = 0;
  
  // Unfreeze game physics
  game.isQuestionActive = false;
  
  // Reset player state (keep shards and upgrades)
  player.reset(); // This is perfect, resets position/velocity/health but keeps upgrades
  camera.reset();
  
  generateLevel();
  
  // Instantly set camera to avoid jarring scroll on start
  camera.y = player.y - V_HEIGHT * 0.65;
  camera.targetY = camera.y;
  
  updateHUD();
  updateShopUI();
}

function restartGame() {
  document.getElementById('win-screen').classList.add('hidden');
  startGame();
}

// ==========================================
// CHINESE QUESTION SYSTEM (BY LEVEL DIFFICULTY)
// ==========================================
const CHINESE_QUESTIONS_BY_LEVEL = {
  1: [ // Level 1 (Fruits - repeating pool)
    { id: "1_1", q: "คำศัพท์ภาษาจีนคำว่า '苹果' (píngguǒ) แปลว่าอะไร?", o: ["แอปเปิ้ล (Apple)", "กล้วย (Banana)", "องุ่น (Grape)", "แตงโม (Watermelon)"], a: 0 },
    { id: "1_2", q: "คำศัพท์ภาษาจีนคำว่า '香蕉' (xiāngjiāo) แปลว่าอะไร?", o: ["ส้ม (Orange)", "กล้วย (Banana)", "สับปะรด (Pineapple)", "มะพร้าว (Coconut)"], a: 1 },
    { id: "1_3", q: "คำศัพท์ภาษาจีนคำว่า '葡萄' (pútao) แปลว่าอะไร?", o: ["แตงโม (Watermelon)", "สตรอว์เบอร์รี่ (Strawberry)", "องุ่น (Grape)", "มะม่วง (Mango)"], a: 2 },
    { id: "1_4", q: "คำศัพท์ภาษาจีนคำว่า '西瓜' (xīguā) แปลว่าอะไร?", o: ["กล้วย (Banana)", "ส้ม (Orange)", "ลูกท้อ (Peach)", "แตงโม (Watermelon)"], a: 3 },
    { id: "1_5", q: "คำศัพท์ภาษาจีนคำว่า '草莓' (cǎoméi) แปลว่าอะไร?", o: ["สตรอว์เบอร์รี่ (Strawberry)", "แอปเปิ้ล (Apple)", "องุ่น (Grape)", "เชอร์รี่ (Cherry)"], a: 0 }
  ],
  2: [ // Level 2 (Animals - repeating pool)
    { id: "2_1", q: "คำศัพท์ภาษาจีนคำว่า '狗' (gǒu) แปลว่าอะไร?", o: ["สุนัข (Dog)", "แมว (Cat)", "กระต่าย (Rabbit)", "วัว (Cow)"], a: 0 },
    { id: "2_2", q: "คำศัพท์ภาษาจีนคำว่า '猫' (māo) แปลว่าอะไร?", o: ["สุนัข (Dog)", "แมว (Cat)", "กระต่าย (Rabbit)", "ไก่ (Chicken)"], a: 1 },
    { id: "2_3", q: "คำศัพท์ภาษาจีนคำว่า '兔子' (tùzi) แปลว่าอะไร?", o: ["แกะ (Sheep)", "วัว (Cow)", "กระต่าย (Rabbit)", "ปลา (Fish)"], a: 2 },
    { id: "2_4", q: "คำศัพท์ภาษาจีนคำว่า '牛' (niú) แปลว่าอะไร?", o: ["นก (Bird)", "ไก่ (Chicken)", "แกะ (Sheep)", "วัว (Cow)"], a: 3 },
    { id: "2_5", q: "คำศัพท์ภาษาจีนคำว่า '鸡' (jī) แปลว่าอะไร?", o: ["ไก่ (Chicken)", "ปลา (Fish)", "นก (Bird)", "สุนัข (Dog)"], a: 0 },
    { id: "2_6", q: "คำศัพท์ภาษาจีนคำว่า '鱼' (yú) แปลว่าอะไร?", o: ["กระต่าย (Rabbit)", "ปลา (Fish)", "แกะ (Sheep)", "นก (Bird)"], a: 1 },
    { id: "2_7", q: "คำศัพท์ภาษาจีนคำว่า '羊' (yáng) แปลว่าอะไร?", o: ["สุนัข (Dog)", "วัว (Cow)", "แกะ (Sheep)", "ไก่ (Chicken)"], a: 2 },
    { id: "2_8", q: "คำศัพท์ภาษาจีนคำว่า '鸟' (niǎo) แปลว่าอะไร?", o: ["ปลา (Fish)", "กระต่าย (Rabbit)", "แมว (Cat)", "นก (Bird)"], a: 3 }
  ],
  3: [ // Level 3 (Body Parts - Repeating Pool)
    { id: "3_1", q: "คำศัพท์ภาษาจีนคำว่า '头' (tóu) แปลว่าอะไร?", o: ["หัว (Head)", "แขน (Arm)", "ขา (Leg)", "มือ (Hand)"], a: 0 },
    { id: "3_2", q: "คำศัพท์ภาษาจีนคำว่า '眼睛' (yǎnjing) แปลว่าอะไร?", o: ["จมูก (Nose)", "ตา (Eyes)", "หู (Ears)", "ปาก (Mouth)"], a: 1 },
    { id: "3_3", q: "คำศัพท์ภาษาจีนคำว่า '耳朵' (ěrduo) แปลว่าอะไร?", o: ["ตา (Eyes)", "ปาก (Mouth)", "หู (Ears)", "เท้า (Foot)"], a: 2 },
    { id: "3_4", q: "คำศัพท์ภาษาจีนคำว่า '鼻子' (bízi) แปลว่าอะไร?", o: ["หู (Ears)", "ตา (Eyes)", "ปาก (Mouth)", "จมูก (Nose)"], a: 3 },
    { id: "3_5", q: "คำศัพท์ภาษาจีนคำว่า '嘴' (zuǐ) แปลว่าอะไร?", o: ["ฟัน (Teeth)", "ปาก (Mouth)", "จมูก (Nose)", "ตา (Eyes)"], a: 1 },
    { id: "3_6", q: "คำศัพท์ภาษาจีนคำว่า '手' (shǒu) แปลว่าอะไร?", o: ["มือ (Hand)", "เท้า (Foot)", "แขน (Arm)", "ขา (Leg)"], a: 0 },
    { id: "3_7", q: "คำศัพท์ภาษาจีนคำว่า '脚' (jiǎo) แปลว่าอะไร?", o: ["มือ (Hand)", "เท้า (Foot / Feet)", "หู (Ears)", "หัว (Head)"], a: 1 },
    { id: "3_8", q: "คำศัพท์ภาษาจีนคำว่า '头发' (tóufa) แปลว่าอะไร?", o: ["ผม (Hair)", "คิ้ว (Eyebrow)", "คอ (Neck)", "ไหล่ (Shoulder)"], a: 0 },
    { id: "3_9", q: "คำศัพท์ภาษาจีนคำว่า '肩膀' (jiānbǎng) แปลว่าอะไร?", o: ["เข่า (Knee)", "เอว (Waist)", "ไหล่ (Shoulder)", "คอ (Neck)"], a: 2 },
    { id: "3_10", q: "คำศัพท์ภาษาจีนคำว่า '膝盖' (xīgài) แปลว่าอะไร?", o: ["เท้า (Foot)", "เข่า (Knee)", "นิ้วมือ (Finger)", "เล็บ (Nail)"], a: 1 }
  ],
  9: [ // Level 9 (Nong Kao's Custom Vocabularies - Repeating Pool)
    { id: "9_1", q: "คำศัพท์ภาษาจีนคำว่า 'ài' แปลว่าอะไร?", o: ["เกลียด (Hate)", "รัก (Love)", "ชอบ (Like)", "โกรธ (Angry)"], a: 1 },
    { id: "9_2", q: "คำศัพท์ภาษาจีนคำว่า 'Tàiguó' แปลว่าอะไร?", o: ["ประเทศจีน (China)", "ประเทศญี่ปุ่น (Japan)", "ประเทศไทย (Thailand)", "ประเทศอังกฤษ (England)"], a: 2 },
    { id: "9_3", q: "คำศัพท์ภาษาจีนคำว่า 'shuǐ' แปลว่าอะไร?", o: ["ไฟ (Fire)", "น้ำ (Water)", "ดิน (Earth)", "ลม (Wind)"], a: 1 },
    { id: "9_4", q: "คำศัพท์ภาษาจีนคำว่า 'lái' แปลว่าอะไร?", o: ["ไป (Go)", "นอน (Sleep)", "นั่ง (Sit)", "มา (Come)"], a: 3 },
    { id: "9_5", q: "ตัวเลขภาษาจีนคำว่า 'èr' หมายถึงจำนวนเท่าใด?", o: ["หนึ่ง (1)", "สอง (2)", "สาม (3)", "สี่ (4)"], a: 1 },
    { id: "9_6", q: "ตัวเลขภาษาจีนคำว่า 'sān' หมายถึงจำนวนเท่าใด?", o: ["สาม (3)", "ห้า (5)", "เจ็ด (7)", "เก้า (9)"], a: 0 },
    { id: "9_7", q: "ตัวเลขภาษาจีนคำว่า 'liù' หมายถึงจำนวนเท่าใด?", o: ["ห้า (5)", "หก (6)", "เจ็ด (7)", "แปด (8)"], a: 1 },
    { id: "9_8", q: "ตัวเลขภาษาจีนคำว่า 'jiǔ' หมายถึงจำนวนเท่าใด?", o: ["แปด (8)", "เก้า (9)", "สิบ (10)", "หก (6)"], a: 1 },
    { id: "9_9", q: "คำศัพท์ภาษาจีนคำว่า 'mèi' แปลว่าอะไร?", o: ["พี่สาว (Elder sister)", "น้องสาว (Younger sister)", "คุณแม่ (Mother)", "เพื่อน (Friend)"], a: 1 },
    { id: "9_10", q: "คำอวัยวะร่างกายภาษาจีนคำว่า 'tuǐ' แปลว่าอะไร?", o: ["แขน (Arm)", "ขา (Leg)", "หัว (Head)", "หู (Ear)"], a: 1 },
    { id: "9_11", q: "คำศัพท์ภาษาจีนคำว่า 'gǒu' แปลว่าอะไร?", o: ["แมว (Cat)", "นก (Bird)", "วัว (Cow)", "สุนัข (Dog)"], a: 3 },
    { id: "9_12", q: "คำศัพท์ภาษาจีนคำว่า 'niú' แปลว่าอะไร?", o: ["วัว (Cow)", "แกะ (Sheep)", "เสือ (Tiger)", "สิงโต (Lion)"], a: 0 },
    { id: "9_13", q: "คำอวัยวะร่างกายภาษาจีนคำว่า 'tóu' แปลว่าอะไร?", o: ["หัว (Head)", "ตา (Eye)", "จมูก (Nose)", "ปาก (Mouse)"], a: 0 },
    { id: "9_14", q: "คำศัพท์ภาษาจีนคำว่า 'tóng xué men' แปลว่าอะไร?", o: ["คุณครูทั้งหลาย (Teachers)", "นักเรียนทั้งหลาย / เพื่อนนักเรียน (Students)", "ผู้ปกครอง (Parents)", "คนทำความสะอาด (Cleaners)"], a: 1 },
    { id: "9_15", q: "คำศัพท์ภาษาจีนคำว่า 'hǎo' แปลว่าอะไร?", o: ["เลว (Bad)", "ดี (Good)", "แย่ (Terrible)", "เฉยๆ (Normal)"], a: 1 },
    { id: "9_16", q: "คำกริยาภาษาจีนคำว่า 'pǎo' แปลว่าอะไร?", o: ["เดิน (Walk)", "วิ่ง (Run)", "กระโดด (Jump)", "ปีน (Climb)"], a: 1 },
    { id: "9_17", q: "คำศัพท์ภาษาจีนคำว่า 'qiú' แปลว่าอะไร?", o: ["หนังสือ (Book)", "ลูกบอล (Ball)", "โต๊ะ (Table)", "เก้าอี้ (Chair)"], a: 1 },
    { id: "9_18", q: "คำศัพท์กลุ่มคำว่า 'tóu tuǐ shuǐ qiú' เมื่อแปลรวมกันตามลำดับ หมายถึงข้อใด?", o: ["น้ำ วัว วิ่ง บิน", "หัว ขา น้ำ ลูกบอล", "วัว ขา หัว ลูกบอล", "สุนัข หัว รัก ประเทศไทย"], a: 1 },
    { id: "9_19", q: "คำกริยาภาษาจีนคำว่า 'fēi' แปลว่าอะไร?", o: ["ว่ายน้ำ (Swim)", "กระโดด (Jump)", "บิน (Fly)", "มุด (Dive)"], a: 2 }
  ],
  4: [ // Level 4 (Colors - Repeating Pool)
    { id: "4_1", q: "คำศัพท์ภาษาจีนคำว่า '红色' (hóngsè) แปลว่าสีอะไร?", o: ["สีแดง (Red)", "สีส้ม (Orange)", "สีชมพู (Pink)", "สีม่วง (Purple)"], a: 0 },
    { id: "4_2", q: "คำศัพท์ภาษาจีนคำว่า '蓝色' (lánsè) แปลว่าสีอะไร?", o: ["สีเขียว (Green)", "สีน้ำเงิน (Blue)", "สีม่วง (Purple)", "สีเทา (Gray)"], a: 1 },
    { id: "4_3", q: "คำศัพท์ภาษาจีนคำว่า '绿色' (lǜsè) แปลว่าสีอะไร?", o: ["สีน้ำเงิน (Blue)", "สีเหลือง (Yellow)", "สีเขียว (Green)", "สีน้ำตาล (Brown)"], a: 2 },
    { id: "4_4", q: "คำศัพท์ภาษาจีนคำว่า '黄色' (huángsè) แปลว่าสีอะไร?", o: ["สีส้ม (Orange)", "สีแดง (Red)", "สีขาว (White)", "สีเหลือง (Yellow)"], a: 3 },
    { id: "4_5", q: "คำศัพท์ภาษาจีนคำว่า '黑色' (hēisè) แปลว่าสีอะไร?", o: ["สีดำ (Black)", "สีเทา (Gray)", "สีน้ำตาล (Brown)", "สีน้ำเงิน (Blue)"], a: 0 },
    { id: "4_6", q: "คำศัพท์ภาษาจีนคำว่า '白色' (báisè) แปลว่าสีอะไร?", o: ["สีเทา (Gray)", "สีขาว (White)", "สีเหลือง (Yellow)", "สีชมพู (Pink)"], a: 1 },
    { id: "4_7", q: "คำศัพท์ภาษาจีนคำว่า '粉红色' (fěnhóngsè) แปลว่าสีอะไร?", o: ["สีแดง (Red)", "สีม่วง (Purple)", "สีชมพู (Pink)", "สีส้ม (Orange)"], a: 2 },
    { id: "4_8", q: "คำศัพท์ภาษาจีนคำว่า '橙色' (chéngsè) แปลว่าสีอะไร?", o: ["สีเหลือง (Yellow)", "สีแดง (Red)", "สีน้ำตาล (Brown)", "สีส้ม (Orange)"], a: 3 },
    { id: "4_9", q: "คำศัพท์ภาษาจีนคำว่า '灰色' (huīsè) แปลว่าสีอะไร?", o: ["สีเทา (Gray)", "สีดำ (Black)", "สีขาว (White)", "สีน้ำตาล (Brown)"], a: 0 },
    { id: "4_10", q: "คำศัพท์ภาษาจีนคำว่า '紫色' (zǐsè) แปลว่าสีอะไร?", o: ["สีชมพู (Pink)", "สีม่วง (Purple)", "สีน้ำเงิน (Blue)", "สีแดง (Red)"], a: 1 },
    { id: "4_11", q: "คำศัพท์ภาษาจีนคำว่า '棕色' (zōngsè) แปลว่าสีอะไร?", o: ["สีเทา (Gray)", "สีดำ (Black)", "สีน้ำตาล (Brown)", "สีส้ม (Orange)"], a: 2 }
  ],
  10: [ // Level 10 (Worldwide - Countries & Pronouns - Repeating Pool)
    { id: "10_1", q: "คำศัพท์ภาษาจีนคำว่า '泰国' (Tàiguó - ไท่กั๋ว) แปลว่าอะไร?", o: ["ประเทศไทย (Thailand)", "ประเทศจีน (China)", "ประเทศญี่ปุ่น (Japan)", "ประเทศเกาหลี (South Korea)"], a: 0 },
    { id: "10_2", q: "คำศัพท์ภาษาจีนคำว่า '中国' (Zhōngguó - จงกั๋ว) แปลว่าอะไร?", o: ["ประเทศเกาหลี (South Korea)", "ประเทศจีน (China)", "ประเทศอังกฤษ (UK)", "ประเทศอเมริกา (USA)"], a: 1 },
    { id: "10_3", q: "คำศัพท์ภาษาจีนคำว่า '日本' (Rìběn - รื่อเปิ่น) แปลว่าอะไร?", o: ["ประเทศฝรั่งเศส (France)", "ประเทศแคนาดา (Canada)", "ประเทศญี่ปุ่น (Japan)", "ประเทศไทย (Thailand)"], a: 2 },
    { id: "10_4", q: "คำศัพท์ภาษาจีนคำว่า '韩国' (Hánguó - หานกั๋ว) แปลว่าอะไร?", o: ["ประเทศอังกฤษ (UK)", "ประเทศอเมริกา (USA)", "ประเทศจีน (China)", "ประเทศเกาหลี (South Korea)"], a: 3 },
    { id: "10_5", q: "คำศัพท์ภาษาจีนคำว่า '英国' (Yīngguó - อิงกั๋ว) แปลว่าอะไร?", o: ["ประเทศอังกฤษ (United Kingdom)", "ประเทศฝรั่งเศส (France)", "ประเทศแคนาดา (Canada)", "ประเทศญี่ปุ่น (Japan)"], a: 0 },
    { id: "10_6", q: "คำศัพท์ภาษาจีนคำว่า '美国' (Měiguó - เหม่ยกั๋ว) แปลว่าอะไร?", o: ["ประเทศเกาหลี (South Korea)", "ประเทศอเมริกา (United States)", "ประเทศไทย (Thailand)", "ประเทศจีน (China)"], a: 1 },
    { id: "10_7", q: "คำศัพท์ภาษาจีนคำว่า '加拿大' (Jiānádà - เจียนาหนาต้า) แปลว่าอะไร?", o: ["ประเทศฝรั่งเศส (France)", "ประเทศอังกฤษ (UK)", "ประเทศแคนาดา (Canada)", "ประเทศอเมริกา (USA)"], a: 2 },
    { id: "10_8", q: "คำศัพท์ภาษาจีนคำว่า '法国' (Fǎguó - ฝ่ากั๋ว) แปลว่าอะไร?", o: ["ประเทศไทย (Thailand)", "ประเทศญี่ปุ่น (Japan)", "ประเทศจีน (China)", "ประเทศฝรั่งเศส (France)"], a: 3 },
    { id: "10_9", q: "คำศัพท์ภาษาจีนคำว่า '他' (tā - ทา) แปลว่าอะไร?", o: ["เขา (ผู้ชาย)", "เธอ (ผู้หญิง)", "พวกเรา", "พวกเขา"], a: 0 },
    { id: "10_10", q: "คำศัพท์ภาษาจีนคำว่า '她' (tā - ทา) แปลว่าอะไร?", o: ["เขา (ผู้ชาย)", "เธอ (ผู้หญิง)", "ฉัน", "คุณ"], a: 1 },
    { id: "10_11", q: "คำศัพท์ภาษาจีนคำว่า '是' (shì - ซื่อ) แปลว่าอะไร?", o: ["ไม่ (No)", "ไป (Go)", "เป็น / คือ (Is/Am/Are)", "กิน (Eat)"], a: 2 },
    { id: "10_12", q: "คำศัพท์ภาษาจีนคำว่า '哪' (nǎ - หน่า) แปลว่าอะไร?", o: ["ใคร (Who)", "อะไร (What)", "เมื่อไหร่ (When)", "ไหน / อะไร (Which/Where)"], a: 3 },
    { id: "10_13", q: "คำศัพท์ภาษาจีนคำว่า '同学' (tóngxué - ถงเสวีย) แปลว่าอะไร?", o: ["เพื่อนร่วมชั้น (Classmate)", "คุณครู (Teacher)", "นักเรียนใหม่ (New student)", "เพื่อนสนิท (Best friend)"], a: 0 },
    { id: "10_14", q: "คำศัพท์ภาษาจีนคำว่า '朋友' (péngyou - เผิงโหย่ว) แปลว่าอะไร?", o: ["ญาติ (Relative)", "เพื่อน (Friend)", "ครอบครัว (Family)", "พี่น้อง (Siblings)"], a: 1 }
  ],
  5: [ // Level 5 (Combined 34 vocabulary questions from Levels 1-4: Fruits, Animals, Body Parts, Colors)
    // Level 1: Fruits (5)
    { id: "5_1_1", q: "คำศัพท์ภาษาจีนคำว่า '苹果' (píngguǒ) แปลว่าอะไร?", o: ["แอปเปิ้ล (Apple)", "กล้วย (Banana)", "องุ่น (Grape)", "แตงโม (Watermelon)"], a: 0 },
    { id: "5_1_2", q: "คำศัพท์ภาษาจีนคำว่า '香蕉' (xiāngjiāo) แปลว่าอะไร?", o: ["ส้ม (Orange)", "กล้วย (Banana)", "สับปะรด (Pineapple)", "มะพร้าว (Coconut)"], a: 1 },
    { id: "5_1_3", q: "คำศัพท์ภาษาจีนคำว่า '葡萄' (pútao) แปลว่าอะไร?", o: ["แตงโม (Watermelon)", "สตรอว์เบอร์รี่ (Strawberry)", "องุ่น (Grape)", "มะม่วง (Mango)"], a: 2 },
    { id: "5_1_4", q: "คำศัพท์ภาษาจีนคำว่า '西瓜' (xīguā) แปลว่าอะไร?", o: ["กล้วย (Banana)", "ส้ม (Orange)", "ลูกท้อ (Peach)", "แตงโม (Watermelon)"], a: 3 },
    { id: "5_1_5", q: "คำศัพท์ภาษาจีนคำว่า '草莓' (cǎoméi) แปลว่าอะไร?", o: ["สตรอว์เบอร์รี่ (Strawberry)", "แอปเปิ้ล (Apple)", "องุ่น (Grape)", "เชอร์รี่ (Cherry)"], a: 0 },
    // Level 2: Animals (8)
    { id: "5_2_1", q: "คำศัพท์ภาษาจีนคำว่า '狗' (gǒu) แปลว่าอะไร?", o: ["สุนัข (Dog)", "แมว (Cat)", "กระต่าย (Rabbit)", "วัว (Cow)"], a: 0 },
    { id: "5_2_2", q: "คำศัพท์ภาษาจีนคำว่า '猫' (māo) แปลว่าอะไร?", o: ["สุนัข (Dog)", "แมว (Cat)", "กระต่าย (Rabbit)", "ไก่ (Chicken)"], a: 1 },
    { id: "5_2_3", q: "คำศัพท์ภาษาจีนคำว่า '兔子' (tùzi) แปลว่าอะไร?", o: ["แกะ (Sheep)", "วัว (Cow)", "กระต่าย (Rabbit)", "ปลา (Fish)"], a: 2 },
    { id: "5_2_4", q: "คำศัพท์ภาษาจีนคำว่า '牛' (niú) แปลว่าอะไร?", o: ["นก (Bird)", "ไก่ (Chicken)", "แกะ (Sheep)", "วัว (Cow)"], a: 3 },
    { id: "5_2_5", q: "คำศัพท์ภาษาจีนคำว่า '鸡' (jī) แปลว่าอะไร?", o: ["ไก่ (Chicken)", "ปลา (Fish)", "นก (Bird)", "สุนัข (Dog)"], a: 0 },
    { id: "5_2_6", q: "คำศัพท์ภาษาจีนคำว่า '鱼' (yú) แปลว่าอะไร?", o: ["กระต่าย (Rabbit)", "ปลา (Fish)", "แกะ (Sheep)", "นก (Bird)"], a: 1 },
    { id: "5_2_7", q: "คำศัพท์ภาษาจีนคำว่า '羊' (yáng) แปลว่าอะไร?", o: ["สุนัข (Dog)", "วัว (Cow)", "แกะ (Sheep)", "ไก่ (Chicken)"], a: 2 },
    { id: "5_2_8", q: "คำศัพท์ภาษาจีนคำว่า '鸟' (niǎo) แปลว่าอะไร?", o: ["ปลา (Fish)", "กระต่าย (Rabbit)", "แมว (Cat)", "นก (Bird)"], a: 3 },
    // Level 3: Body Parts (10)
    { id: "5_3_1", q: "คำศัพท์ภาษาจีนคำว่า '头' (tóu) แปลว่าอะไร?", o: ["หัว (Head)", "แขน (Arm)", "ขา (Leg)", "มือ (Hand)"], a: 0 },
    { id: "5_3_2", q: "คำศัพท์ภาษาจีนคำว่า '眼睛' (yǎnjing) แปลว่าอะไร?", o: ["จมูก (Nose)", "ตา (Eyes)", "หู (Ears)", "ปาก (Mouth)"], a: 1 },
    { id: "5_3_3", q: "คำศัพท์ภาษาจีนคำว่า '耳朵' (ěrduo) แปลว่าอะไร?", o: ["ตา (Eyes)", "ปาก (Mouth)", "หู (Ears)", "เท้า (Foot)"], a: 2 },
    { id: "5_3_4", q: "คำศัพท์ภาษาจีนคำว่า '鼻子' (bízi) แปลว่าอะไร?", o: ["หู (Ears)", "ตา (Eyes)", "ปาก (Mouth)", "จมูก (Nose)"], a: 3 },
    { id: "5_3_5", q: "คำศัพท์ภาษาจีนคำว่า '嘴' (zuǐ) แปลว่าอะไร?", o: ["ฟัน (Teeth)", "ปาก (Mouth)", "จมูก (Nose)", "ตา (Eyes)"], a: 1 },
    { id: "5_3_6", q: "คำศัพท์ภาษาจีนคำว่า '手' (shǒu) แปลว่าอะไร?", o: ["มือ (Hand)", "เท้า (Foot)", "แขน (Arm)", "ขา (Leg)"], a: 0 },
    { id: "5_3_7", q: "คำศัพท์ภาษาจีนคำว่า '脚' (jiǎo) แปลว่าอะไร?", o: ["มือ (Hand)", "เท้า (Foot / Feet)", "หู (Ears)", "หัว (Head)"], a: 1 },
    { id: "5_3_8", q: "คำศัพท์ภาษาจีนคำว่า '头发' (tóufa) แปลว่าอะไร?", o: ["ผม (Hair)", "คิ้ว (Eyebrow)", "คอ (Neck)", "ไหล่ (Shoulder)"], a: 0 },
    { id: "5_3_9", q: "คำศัพท์ภาษาจีนคำว่า '肩膀' (jiānbǎng) แปลว่าอะไร?", o: ["เข่า (Knee)", "เอว (Waist)", "ไหล่ (Shoulder)", "คอ (Neck)"], a: 2 },
    { id: "5_3_10", q: "คำศัพท์ภาษาจีนคำว่า '膝盖' (xīgài) แปลว่าอะไร?", o: ["เท้า (Foot)", "เข่า (Knee)", "นิ้วมือ (Finger)", "เล็บ (Nail)"], a: 1 },
    // Level 4: Colors (11)
    { id: "5_4_1", q: "คำศัพท์ภาษาจีนคำว่า '红色' (hóngsè) แปลว่าสีอะไร?", o: ["สีแดง (Red)", "สีส้ม (Orange)", "สีชมพู (Pink)", "สีม่วง (Purple)"], a: 0 },
    { id: "5_4_2", q: "คำศัพท์ภาษาจีนคำว่า '蓝色' (lánsè) แปลว่าสีอะไร?", o: ["สีเขียว (Green)", "สีน้ำเงิน (Blue)", "สีม่วง (Purple)", "สีเทา (Gray)"], a: 1 },
    { id: "5_4_3", q: "คำศัพท์ภาษาจีนคำว่า '绿色' (lǜsè) แปลว่าสีอะไร?", o: ["สีน้ำเงิน (Blue)", "สีเหลือง (Yellow)", "สีเขียว (Green)", "สีน้ำตาล (Brown)"], a: 2 },
    { id: "5_4_4", q: "คำศัพท์ภาษาจีนคำว่า '黄色' (huángsè) แปลว่าสีอะไร?", o: ["สีส้ม (Orange)", "สีแดง (Red)", "สีขาว (White)", "สีเหลือง (Yellow)"], a: 3 },
    { id: "5_4_5", q: "คำศัพท์ภาษาจีนคำว่า '黑色' (hēisè) แปลว่าสีอะไร?", o: ["สีดำ (Black)", "สีเทา (Gray)", "สีน้ำตาล (Brown)", "สีน้ำเงิน (Blue)"], a: 0 },
    { id: "5_4_6", q: "คำศัพท์ภาษาจีนคำว่า '白色' (báisè) แปลว่าสีอะไร?", o: ["สีเทา (Gray)", "สีขาว (White)", "สีเหลือง (Yellow)", "สีชมพู (Pink)"], a: 1 },
    { id: "5_4_7", q: "คำศัพท์ภาษาจีนคำว่า '粉红色' (fěnhóngsè) แปลว่าสีอะไร?", o: ["สีแดง (Red)", "สีม่วง (Purple)", "สีชมพู (Pink)", "สีส้ม (Orange)"], a: 2 },
    { id: "5_4_8", q: "คำศัพท์ภาษาจีนคำว่า '橙色' (chéngsè) แปลว่าสีอะไร?", o: ["สีเหลือง (Yellow)", "สีแดง (Red)", "สีน้ำตาล (Brown)", "สีส้ม (Orange)"], a: 3 },
    { id: "5_4_9", q: "คำศัพท์ภาษาจีนคำว่า '灰色' (huīsè) แปลว่าสีอะไร?", o: ["สีเทา (Gray)", "สีดำ (Black)", "สีขาว (White)", "สีน้ำตาล (Brown)"], a: 0 },
    { id: "5_4_10", q: "คำศัพท์ภาษาจีนคำว่า '紫色' (zǐsè) แปลว่าสีอะไร?", o: ["สีชมพู (Pink)", "สีม่วง (Purple)", "สีน้ำเงิน (Blue)", "สีแดง (Red)"], a: 1 },
    { id: "5_4_11", q: "คำศัพท์ภาษาจีนคำว่า '棕色' (zōngsè) แปลว่าสีอะไร?", o: ["สีเทา (Gray)", "สีดำ (Black)", "สีน้ำตาล (Brown)", "สีส้ม (Orange)"], a: 2 }
  ],
  11: [ // Level 11 (Electric Appliances - Repeating Pool)
    { id: "11_1", q: "คำศัพท์ภาษาจีนคำว่า '手机' (shǒujī) แปลว่าอะไร?", o: ["โทรศัพท์มือถือ (Mobile phone)", "คอมพิวเตอร์ (Computer)", "โทรทัศน์ (Television)", "พัดลม (Fan)"], a: 0 },
    { id: "11_2", q: "คำศัพท์ภาษาจีนคำว่า '电脑' (diànnǎo) แปลว่าอะไร?", o: ["โทรศัพท์มือถือ (Mobile phone)", "คอมพิวเตอร์ (Computer)", "ตู้เย็น (Refrigerator)", "โคมไฟ (Lamp)"], a: 1 },
    { id: "11_3", q: "คำศัพท์ภาษาจีนคำว่า '电视' (diànshì) แปลว่าอะไร?", o: ["พัดลม (Fan)", "เครื่องปรับอากาศ (Air conditioner)", "โทรทัศน์ / ทีวี (Television)", "คอมพิวเตอร์ (Computer)"], a: 2 },
    { id: "11_4", q: "คำศัพท์ภาษาจีนคำว่า '冰箱' (bīngxiāng) แปลว่าอะไร?", o: ["โทรทัศน์ (TV)", "เครื่องปรับอากาศ (Air conditioner)", "โคมไฟ (Lamp)", "ตู้เย็น (Refrigerator)"], a: 3 },
    { id: "11_5", q: "คำศัพท์ภาษาจีนคำว่า '风扇' (fēngshàn) แปลว่าอะไร?", o: ["พัดลม (Fan)", "ตู้เย็น (Refrigerator)", "โทรศัพท์มือถือ (Mobile phone)", "เครื่องปรับอากาศ (Air conditioner)"], a: 0 },
    { id: "11_6", q: "คำศัพท์ภาษาจีนคำว่า '空调' (kōngtiáo) แปลว่าอะไร?", o: ["คอมพิวเตอร์ (Computer)", "เครื่องปรับอากาศ / แอร์ (Air conditioner)", "พัดลม (Fan)", "โคมไฟ (Lamp)"], a: 1 },
    { id: "11_7", q: "คำศัพท์ภาษาจีนคำว่า '灯' (dēng) แปลว่าอะไร?", o: ["ตู้เย็น (Refrigerator)", "โทรทัศน์ (TV)", "โคมไฟ / ไฟ (Lamp / Light)", "พัดลม (Fan)"], a: 2 }
  ],
  12: [ // Level 12 (Daily Life - ชีวิตประจำวัน - Repeating Pool)
    { id: "12_1", q: "คำศัพท์ภาษาจีนคำว่า '起床' (qǐchuáng) แปลว่าอะไร?", o: ["ตื่นนอน (Get up)", "นอน (Sleep)", "แปรงฟัน (Brush teeth)", "อาบน้ำ (Take a shower)"], a: 0 },
    { id: "12_2", q: "คำศัพท์ภาษาจีนคำว่า '刷牙' (shuāyá) แปลว่าอะไร?", o: ["กินอาหารเช้า (Eat breakfast)", "แปรงฟัน (Brush teeth)", "ตื่นนอน (Get up)", "อาบน้ำ (Take a shower)"], a: 1 },
    { id: "12_3", q: "คำศัพท์ภาษาจีนคำว่า '吃早饭' (chī zǎofàn) แปลว่าอะไร?", o: ["กินอาหารกลางวัน (Eat lunch)", "กินอาหารเย็น (Eat dinner)", "กินอาหารเช้า (Eat breakfast)", "ทำการบ้าน (Do homework)"], a: 2 },
    { id: "12_4", q: "คำศัพท์ภาษาจีนคำว่า '去学校' (qù xuéxiào) แปลว่าอะไร?", o: ["กลับบ้าน (Go home)", "ดูทีวี (Watch TV)", "ทำการบ้าน (Do homework)", "ไปโรงเรียน (Go to school)"], a: 3 },
    { id: "12_5", q: "คำศัพท์ภาษาจีนคำว่า '吃午饭' (chī wǔfàn) แปลว่าอะไร?", o: ["กินอาหารกลางวัน (Eat lunch)", "กินอาหารเช้า (Eat breakfast)", "กินอาหารเย็น (Eat dinner)", "ไปโรงเรียน (Go to school)"], a: 0 },
    { id: "12_6", q: "คำศัพท์ภาษาจีนคำว่า '回家' (huí jiā) แปลว่าอะไร?", o: ["ไปโรงเรียน (Go to school)", "กลับบ้าน (Go home)", "ตื่นนอน (Get up)", "นอน (Sleep)"], a: 1 },
    { id: "12_7", q: "คำศัพท์ภาษาจีนคำว่า '做作业' (zuò zuòyè) แปลว่าอะไร?", o: ["ดูทีวี (Watch TV)", "กลับบ้าน (Go home)", "ทำการบ้าน (Do homework)", "อาบน้ำ (Take a shower)"], a: 2 },
    { id: "12_8", q: "คำศัพท์ภาษาจีนคำว่า '吃晚饭' (chī wǎnfàn) แปลว่าอะไร?", o: ["กินอาหารเช้า (Eat breakfast)", "ทำการบ้าน (Do homework)", "แปรงฟัน (Brush teeth)", "กินอาหารเย็น (Eat dinner)"], a: 3 },
    { id: "12_9", q: "คำศัพท์ภาษาจีนคำว่า '看电视' (kàn diànshì) แปลว่าอะไร?", o: ["ดูทีวี (Watch TV)", "นอน (Sleep)", "อาบน้ำ (Take a shower)", "กินอาหารกลางวัน (Eat lunch)"], a: 0 },
    { id: "12_10", q: "คำศัพท์ภาษาจีนคำว่า '洗澡' (xǐzǎo) แปลว่าอะไร?", o: ["แปรงฟัน (Brush teeth)", "อาบน้ำ (Take a shower)", "ตื่นนอน (Get up)", "กลับบ้าน (Go home)"], a: 1 },
    { id: "12_11", q: "คำศัพท์ภาษาจีนคำว่า '睡觉' (shuìjiào) แปลว่าอะไร?", o: ["ทำการบ้าน (Do homework)", "ดูทีวี (Watch TV)", "นอน (Sleep)", "ตื่นนอน (Get up)"], a: 2 },
    { id: "12_12", q: "คำศัพท์ภาษาจีนคำว่า '年' (nián) แปลว่าอะไร?", o: ["เดือน (Month)", "นาที (Minute)", "วันที่ (Date)", "ปี (Year)"], a: 3 },
    { id: "12_13", q: "คำศัพท์ภาษาจีนคำว่า '月' (yuè) แปลว่าอะไร?", o: ["เดือน (Month)", "ปี (Year)", "โมง (O'clock)", "ครึ่ง (Half)"], a: 0 },
    { id: "12_14", q: "คำศัพท์ภาษาจีนคำว่า '号' (hào) แปลว่าอะไร?", o: ["นาที (Minute)", "วันที่ / วัน (Date / Day)", "ปี (Year)", "ครึ่ง (Half)"], a: 1 },
    { id: "12_15", q: "คำศัพท์ภาษาจีนคำว่า '点' (diǎn) แปลว่าอะไร?", o: ["ครึ่ง (Half)", "เดือน (Month)", "โมง / นาฬิกา (O'clock)", "นาที (Minute)"], a: 2 },
    { id: "12_16", q: "คำศัพท์ภาษาจีนคำว่า '分' (fēn) แปลว่าอะไร?", o: ["วันที่ (Date)", "ปี (Year)", "โมง (O'clock)", "นาที (Minute)"], a: 3 },
    { id: "12_17", q: "คำศัพท์ภาษาจีนคำว่า '半' (bàn) แปลว่าอะไร?", o: ["ครึ่ง (Half)", "นาที (Minute)", "เดือน (Month)", "โมง (O'clock)"], a: 0 }
  ],
  13: [ // Level 13 (Hobbies - Repeating Pool in English)
    { id: "13_1", q: "What does the Chinese word '看书' (kànshū) mean?", o: ["Read a book", "Watch TV", "Listen to music", "Play games"], a: 0 },
    { id: "13_2", q: "What does the Chinese word '看电视' (kàn diànshì) mean?", o: ["Listen to music", "Watch TV", "Play football", "Read a book"], a: 1 },
    { id: "13_3", q: "What does the Chinese word '画画' (huàhuà) mean?", o: ["Swim", "Play games", "Draw / Paint", "Watch TV"], a: 2 },
    { id: "13_4", q: "What does the Chinese word '游泳' (yóuyǒng) mean?", o: ["Play football", "Listen to music", "Read a book", "Swim"], a: 3 },
    { id: "13_5", q: "What does the Chinese word '踢足球' (tī zúqiú) mean?", o: ["Play football", "Swim", "Play games", "Draw / Paint"], a: 0 },
    { id: "13_6", q: "What does the Chinese word '听音乐' (tīng yīnyuè) mean?", o: ["Watch TV", "Listen to music", "Read a book", "Swim"], a: 1 },
    { id: "13_7", q: "What does the Chinese word '玩游戏' (wán yóuxì) mean?", o: ["Play football", "Draw / Paint", "Play games", "Listen to music"], a: 2 },
    { id: "13_8", q: "How do you say 'Read a book' in Chinese?", o: ["看书 (kànshū)", "看电视 (kàn diànshì)", "画画 (huàhuà)", "听音乐 (tīng yīnyuè)"], a: 0 },
    { id: "13_9", q: "How do you say 'Watch TV' in Chinese?", o: ["玩游戏 (wán yóuxì)", "看电视 (kàn diànshì)", "踢足球 (tī zúqiú)", "游泳 (yóuyǒng)"], a: 1 },
    { id: "13_10", q: "How do you say 'Draw / Paint' in Chinese?", o: ["听音乐 (tīng yīnyuè)", "看书 (kànshū)", "画画 (huàhuà)", "玩游戏 (wán yóuxì)"], a: 2 },
    { id: "13_11", q: "How do you say 'Swim' in Chinese?", o: ["踢足球 (tī zúqiú)", "看电视 (kàn diànshì)", "看书 (kànshū)", "游泳 (yóuyǒng)"], a: 3 },
    { id: "13_12", q: "How do you say 'Play football' in Chinese?", o: ["踢足球 (tī zúqiú)", "游泳 (yóuyǒng)", "画画 (huàhuà)", "玩游戏 (wán yóuxì)"], a: 0 },
    { id: "13_13", q: "How do you say 'Listen to music' in Chinese?", o: ["看电视 (kàn diànshì)", "听音乐 (tīng yīnyuè)", "看书 (kànshū)", "踢足球 (tī zúqiú)"], a: 1 },
    { id: "13_14", q: "How do you say 'Play games' in Chinese?", o: ["画画 (huàhuà)", "游泳 (yóuyǒng)", "玩游戏 (wán yóuxì)", "听音乐 (tīng yīnyuè)"], a: 2 }
  ],
  14: [ // Level 14 (HSK1 - บท 3: 11 Words Only)
    { id: "14_1", q: "What does the Chinese word '叫' (jiào) mean?", o: ["to be called / call", "what", "name", "student"], a: 0 },
    { id: "14_2", q: "What does the Chinese word '什么' (shénme) mean?", o: ["person", "what", "I / me", "am / is / are"], a: 1 },
    { id: "14_3", q: "What does the Chinese word '名字' (míngzi) mean?", o: ["teacher", "China", "name", "student"], a: 2 },
    { id: "14_4", q: "What does the Chinese word '我' (wǒ) mean?", o: ["the United States", "person", "teacher", "I / me"], a: 3 },
    { id: "14_5", q: "What does the Chinese word '是' (shì) mean?", o: ["am / is / are", "to be called / call", "what", "question particle"], a: 0 },
    { id: "14_6", q: "What does the Chinese word '老师' (lǎoshī) mean?", o: ["student", "teacher", "person", "name"], a: 1 },
    { id: "14_7", q: "What does the Chinese word '吗' (ma) mean?", o: ["what", "I / me", "question particle", "to be called / call"], a: 2 },
    { id: "14_8", q: "What does the Chinese word '学生' (xuésheng) mean?", o: ["China", "person", "teacher", "student"], a: 3 },
    { id: "14_9", q: "What does the Chinese word '人' (rén) mean?", o: ["person", "I / me", "teacher", "student"], a: 0 },
    { id: "14_10", q: "What does the Chinese word '中国' (Zhōngguó) mean?", o: ["the United States", "China", "teacher", "name"], a: 1 },
    { id: "14_11", q: "What does the Chinese word '美国' (Měiguó) mean?", o: ["person", "China", "the United States", "what"], a: 2 },
    { id: "14_12", q: "How do you say 'to be called / call' in Chinese?", o: ["叫 (jiào)", "什么 (shénme)", "是 (shì)", "名字 (míngzi)"], a: 0 },
    { id: "14_13", q: "How do you say 'what' in Chinese?", o: ["吗 (ma)", "什么 (shénme)", "我 (wǒ)", "名字 (míngzi)"], a: 1 },
    { id: "14_14", q: "How do you say 'name' in Chinese?", o: ["老师 (lǎoshī)", "中国 (Zhōngguó)", "名字 (míngzi)", "学生 (xuésheng)"], a: 2 },
    { id: "14_15", q: "How do you say 'I / me' in Chinese?", o: ["人 (rén)", "吗 (ma)", "是 (shì)", "我 (wǒ)"], a: 3 },
    { id: "14_16", q: "How do you say 'am / is / are' in Chinese?", o: ["是 (shì)", "叫 (jiào)", "我 (wǒ)", "老师 (lǎoshī)"], a: 0 },
    { id: "14_17", q: "How do you say 'teacher' in Chinese?", o: ["学生 (xuésheng)", "老师 (lǎoshī)", "人 (rén)", "美国 (Měiguó)"], a: 1 },
    { id: "14_18", q: "How do you say 'question particle' in Chinese?", o: ["什么 (shénme)", "叫 (jiào)", "吗 (ma)", "是 (shì)"], a: 2 },
    { id: "14_19", q: "How do you say 'student' in Chinese?", o: ["老师 (lǎoshī)", "中国 (Zhōngguó)", "人 (rén)", "学生 (xuésheng)"], a: 3 },
    { id: "14_20", q: "How do you say 'person' in Chinese?", o: ["人 (rén)", "我 (wǒ)", "老师 (lǎoshī)", "学生 (xuésheng)"], a: 0 },
    { id: "14_21", q: "How do you say 'China' in Chinese?", o: ["美国 (Měiguó)", "中国 (Zhōngguó)", "名字 (míngzi)", "老师 (lǎoshī)"], a: 1 },
    { id: "14_22", q: "How do you say 'the United States' in Chinese?", o: ["中国 (Zhōngguó)", "人 (rén)", "美国 (Měiguó)", "叫 (jiào)"], a: 2 }
  ],
  15: [ // Level 15 (Special Objects - คำศัพท์เฉพาะกิจ: 21 Items)
    // --- Vocabulary: Chinese to English ---
    { id: "15_1", q: "What does the Chinese word '门' (mén) mean?", o: ["Door", "Window", "Bed", "Table"], a: 0 },
    { id: "15_2", q: "What does the Chinese word '窗户' (chuānghu) mean?", o: ["Door", "Window", "Light", "Blanket"], a: 1 },
    { id: "15_3", q: "What does the Chinese word '灯' (dēng) mean?", o: ["Bed", "Pillow", "Light", "TV"], a: 2 },
    { id: "15_4", q: "What does the Chinese word '枕头' (zhěntou) mean?", o: ["Blanket", "Bed", "Chair", "Pillow"], a: 3 },
    { id: "15_5", q: "What does the Chinese word '床' (chuáng) mean?", o: ["Bed", "Table", "Door", "Pillow"], a: 0 },
    { id: "15_6", q: "What does the Chinese word '被子' (bèizi) mean?", o: ["Pillow", "Blanket", "Cup", "Bed"], a: 1 },
    { id: "15_7", q: "What does the Chinese word '水杯' (shuǐbēi) mean?", o: ["Bowl", "Plate", "Water cup", "Chopsticks"], a: 2 },
    { id: "15_8", q: "What does the Chinese word '桌子' (zhuōzi) mean?", o: ["Chair", "Bed", "Spoon", "Table"], a: 3 },
    { id: "15_9", q: "What does the Chinese word '椅子' (yǐzi) mean?", o: ["Chair", "Table", "Bed", "Door"], a: 0 },
    { id: "15_10", q: "What does the Chinese word '手机' (shǒujī) mean?", o: ["Computer", "Mobile phone", "TV", "Microwave"], a: 1 },
    { id: "15_11", q: "What does the Chinese word '电脑' (diànnǎo) mean?", o: ["Mobile phone", "TV", "Computer", "Refrigerator"], a: 2 },
    { id: "15_12", q: "What does the Chinese word '电视' (diànshì) mean?", o: ["Computer", "Mobile phone", "Microwave", "TV"], a: 3 },
    { id: "15_13", q: "What does the Chinese word '玩具' (wánjù) mean?", o: ["Toy", "Table", "Chair", "Water cup"], a: 0 },
    { id: "15_14", q: "What does the Chinese word '冰箱' (bīngxiāng) mean?", o: ["Microwave", "Refrigerator", "Plate", "Bowl"], a: 1 },
    { id: "15_15", q: "What does the Chinese word '微波炉' (wēibōlú) mean?", o: ["Refrigerator", "TV", "Microwave", "Computer"], a: 2 },
    { id: "15_16", q: "What does the Chinese word '盘子' (pánzi) mean?", o: ["Bowl", "Fork", "Spoon", "Plate"], a: 3 },
    { id: "15_17", q: "What does the Chinese word '碗' (wǎn) mean?", o: ["Bowl", "Plate", "Cup", "Spoon"], a: 0 },
    { id: "15_18", q: "What does the Chinese word '勺子' (sháozi) mean?", o: ["Fork", "Spoon", "Chopsticks", "Bowl"], a: 1 },
    { id: "15_19", q: "What does the Chinese word '叉子' (chāzi) mean?", o: ["Spoon", "Chopsticks", "Fork", "Plate"], a: 2 },
    { id: "15_20", q: "What does the Chinese word '筷子' (kuàizi) mean?", o: ["Fork", "Spoon", "Bowl", "Chopsticks"], a: 3 },
    { id: "15_21", q: "What does the Chinese word '杯子' (bēizi) mean?", o: ["Cup", "Water cup", "Bowl", "Plate"], a: 0 },

    // --- Vocabulary: English to Chinese ---
    { id: "15_22", q: "How do you say 'Door' in Chinese?", o: ["窗户 (chuānghu)", "门 (mén)", "床 (chuáng)", "桌子 (zhuōzi)"], a: 1 },
    { id: "15_23", q: "How do you say 'Window' in Chinese?", o: ["门 (mén)", "灯 (dēng)", "窗户 (chuānghu)", "被子 (bèizi)"], a: 2 },
    { id: "15_24", q: "How do you say 'Light' in Chinese?", o: ["床 (chuáng)", "枕头 (zhěntou)", "电视 (diànshì)", "灯 (dēng)"], a: 3 },
    { id: "15_25", q: "How do you say 'Pillow' in Chinese?", o: ["枕头 (zhěntou)", "被子 (bèizi)", "床 (chuáng)", "椅子 (yǐzi)"], a: 0 },
    { id: "15_26", q: "How do you say 'Bed' in Chinese?", o: ["桌子 (zhuōzi)", "床 (chuáng)", "门 (mén)", "枕头 (zhěntou)"], a: 1 },
    { id: "15_27", q: "How do you say 'Blanket' in Chinese?", o: ["枕头 (zhěntou)", "杯子 (bēizi)", "被子 (bèizi)", "床 (chuáng)"], a: 2 },
    { id: "15_28", q: "How do you say 'Water cup' in Chinese?", o: ["杯子 (bēizi)", "碗 (wǎn)", "盘子 (pánzi)", "水杯 (shuǐbēi)"], a: 3 },
    { id: "15_29", q: "How do you say 'Table' in Chinese?", o: ["桌子 (zhuōzi)", "椅子 (yǐzi)", "床 (chuáng)", "门 (mén)"], a: 0 },
    { id: "15_30", q: "How do you say 'Chair' in Chinese?", o: ["桌子 (zhuōzi)", "椅子 (yǐzi)", "床 (chuáng)", "玩具 (wánjù)"], a: 1 },
    { id: "15_31", q: "How do you say 'Mobile phone' in Chinese?", o: ["电脑 (diànnǎo)", "电视 (diànshì)", "手机 (shǒujī)", "微波炉 (wēibōlú)"], a: 2 },
    { id: "15_32", q: "How do you say 'Computer' in Chinese?", o: ["手机 (shǒujī)", "电视 (diànshì)", "冰箱 (bīngxiāng)", "电脑 (diànnǎo)"], a: 3 },
    { id: "15_33", q: "How do you say 'TV' in Chinese?", o: ["电视 (diànshì)", "电脑 (diànnǎo)", "手机 (shǒujī)", "微波炉 (wēibōlú)"], a: 0 },
    { id: "15_34", q: "How do you say 'Toy' in Chinese?", o: ["桌子 (zhuōzi)", "玩具 (wánjù)", "椅子 (yǐzi)", "水杯 (shuǐbēi)"], a: 1 },
    { id: "15_35", q: "How do you say 'Refrigerator' in Chinese?", o: ["微波炉 (wēibōlú)", "电视 (diànshì)", "冰箱 (bīngxiāng)", "盘子 (pánzi)"], a: 2 },
    { id: "15_36", q: "How do you say 'Microwave' in Chinese?", o: ["冰箱 (bīngxiāng)", "电脑 (diànnǎo)", "电视 (diànshì)", "微波炉 (wēibōlú)"], a: 3 },
    { id: "15_37", q: "How do you say 'Plate' in Chinese?", o: ["盘子 (pánzi)", "碗 (wǎn)", "叉子 (chāzi)", "勺子 (sháozi)"], a: 0 },
    { id: "15_38", q: "How do you say 'Bowl' in Chinese?", o: ["盘子 (pánzi)", "碗 (wǎn)", "杯子 (bēizi)", "勺子 (sháozi)"], a: 1 },
    { id: "15_39", q: "How do you say 'Spoon' in Chinese?", o: ["叉子 (chāzi)", "筷子 (kuàizi)", "勺子 (sháozi)", "碗 (wǎn)"], a: 2 },
    { id: "15_40", q: "How do you say 'Fork' in Chinese?", o: ["勺子 (sháozi)", "筷子 (kuàizi)", "盘子 (pánzi)", "叉子 (chāzi)"], a: 3 },
    { id: "15_41", q: "How do you say 'Chopsticks' in Chinese?", o: ["筷子 (kuàizi)", "叉子 (chāzi)", "勺子 (sháozi)", "碗 (wǎn)"], a: 0 },
    { id: "15_42", q: "How do you say 'Cup' in Chinese?", o: ["水杯 (shuǐbēi)", "杯子 (bēizi)", "碗 (wǎn)", "盘子 (pánzi)"], a: 1 }
  ],
  16: [ // Level 16 (HSK1 - บท 4: 10 Words & 3 Key Sentences Only)
    // --- Vocabulary: Chinese to English ---
    { id: "16_1", q: "What does the Chinese word '家' (jiā) mean?", o: ["family / home", "daughter", "person / people", "this year"], a: 0 },
    { id: "16_2", q: "What does the Chinese word '口' (kǒu) mean?", o: ["have", "measure word for family members", "how many", "years old"], a: 1 },
    { id: "16_3", q: "What does the Chinese word '人' (rén) mean?", o: ["daughter", "how many", "family / home", "person / people"], a: 3 },
    { id: "16_4", q: "What does the Chinese word '有' (yǒu) mean?", o: ["have", "years old", "how old", "family / home"], a: 0 },
    { id: "16_5", q: "What does the Chinese word '女儿' (nǚ’ér) mean?", o: ["this year", "measure word for family members", "daughter", "person / people"], a: 2 },
    { id: "16_6", q: "What does the Chinese word '几' (jǐ) mean?", o: ["how many", "have", "years old", "indicating a change/new situation"], a: 0 },
    { id: "16_7", q: "What does the Chinese word '岁' (suì) mean?", o: ["family / home", "daughter", "years old", "how old"], a: 2 },
    { id: "16_8", q: "What does the Chinese word '了' (le) mean?", o: ["indicating a change/new situation", "this year", "how many", "have"], a: 0 },
    { id: "16_9", q: "What does the Chinese word '今年' (jīnnián) mean?", o: ["years old", "daughter", "this year", "person / people"], a: 2 },
    { id: "16_10", q: "What does the Chinese word '多大' (duō dà) mean?", o: ["how old", "how many", "family / home", "indicating a change/new situation"], a: 0 },

    // --- Vocabulary: English to Chinese ---
    { id: "16_11", q: "How do you say 'family / home' in Chinese?", o: ["女儿 (nǚ’ér)", "家 (jiā)", "岁 (suì)", "今年 (jīnnián)"], a: 1 },
    { id: "16_12", q: "How do you say 'measure word for family members' in Chinese?", o: ["人 (rén)", "几 (jǐ)", "口 (kǒu)", "了 (le)"], a: 2 },
    { id: "16_13", q: "How do you say 'person / people' in Chinese?", o: ["人 (rén)", "口 (kǒu)", "今年 (jīnnián)", "多大 (duō dà)"], a: 0 },
    { id: "16_14", q: "How do you say 'have' in Chinese?", o: ["岁 (suì)", "有 (yǒu)", "了 (le)", "几 (jǐ)"], a: 1 },
    { id: "16_15", q: "How do you say 'daughter' in Chinese?", o: ["家 (jiā)", "多大 (duō dà)", "今年 (jīnnián)", "女儿 (nǚ’ér)"], a: 3 },
    { id: "16_16", q: "How do you say 'how many' in Chinese?", o: ["口 (kǒu)", "几 (jǐ)", "岁 (suì)", "有 (yǒu)"], a: 1 },
    { id: "16_17", q: "How do you say 'years old' in Chinese?", o: ["人 (rén)", "今年 (jīnnián)", "了 (le)", "岁 (suì)"], a: 3 },
    { id: "16_18", q: "How do you say 'indicating a change/new situation' in Chinese?", o: ["家 (jiā)", "了 (le)", "口 (kǒu)", "几 (jǐ)"], a: 1 },
    { id: "16_19", q: "How do you say 'this year' in Chinese?", o: ["多大 (duō dà)", "岁 (suì)", "有 (yǒu)", "今年 (jīnnián)"], a: 3 },
    { id: "16_20", q: "How do you say 'how old' in Chinese?", o: ["今年 (jīnnián)", "多大 (duō dà)", "几 (jǐ)", "女儿 (nǚ’ér)"], a: 1 },

    // --- Key Sentences: Chinese to English ---
    { id: "16_21", q: "What does the sentence '你家有几口人？' (Nǐ jiā yǒu jǐ kǒu rén?) mean?", o: ["How old is your daughter?", "How old are you this year?", "How many people are there in your family?", "Who is in your family?"], a: 2 },
    { id: "16_22", q: "What does the sentence '你女儿几岁了？' (Nǐ nǚ’ér jǐ suì le?) mean?", o: ["How old is your daughter?", "How many people are there in your family?", "How old are you this year?", "Is this your daughter?"], a: 0 },
    { id: "16_23", q: "What does the sentence '你今年多大？' (Nǐ jīnnián duō dà?) mean?", o: ["How many people are there in your family?", "How old is your daughter?", "How old are you this year?", "Where are you this year?"], a: 2 },

    // --- Key Sentences: English to Chinese ---
    { id: "16_24", q: "How do you say 'How many people are there in your family?' in Chinese?", o: ["你女儿几岁了？", "你今年多大？", "你有几个人？", "你家有几口人？"], a: 3 },
    { id: "16_25", q: "How do you say 'How old is your daughter?' in Chinese?", o: ["你家有几口人？", "你女儿几岁了？", "你今年多大？", "你女儿多大了？"], a: 1 },
    { id: "16_26", q: "How do you say 'How old are you this year?' in Chinese?", o: ["你女儿几岁了？", "你家有几口人？", "你是哪国人？", "你今年多大？"], a: 3 }
  ]
};

let currentQuestionObj = null;

function triggerQuestion(milestone) {
  game.isQuestionActive = true;
  game.currentQuestionMilestone = milestone;
  document.getElementById('question-modal').classList.remove('hidden');
  
  // Set subtitle/description with the current milestone
  const questionSubtitle = document.querySelector('#question-card .question-subtitle');
  if (questionSubtitle) {
    if (game.currentLevel === 13 || game.currentLevel === 15) {
      questionSubtitle.innerText = `Answer the question at altitude ${milestone}m to ascend higher!`;
    } else {
      questionSubtitle.innerText = `ตอบคำถามที่ระดับความสูง ${milestone} เมตร เพื่อผ่านขึ้นสู่ดินแดนถัดไป!`;
    }
  }
  
  // Select pool based on current level (defaults to Level 1 if invalid)
  const questionPool = CHINESE_QUESTIONS_BY_LEVEL[game.currentLevel] || CHINESE_QUESTIONS_BY_LEVEL[1];
  
  // Filter for unused questions in the current level
  let unusedQuestions = questionPool.filter(q => !game.askedQuestionIds.has(q.id));
  
  // When all questions in the current level's pool have been asked, reset asked questions for this level to loop them endlessly
  if (unusedQuestions.length === 0) {
    questionPool.forEach(q => game.askedQuestionIds.delete(q.id));
    unusedQuestions = questionPool;
  }
  
  // Pick random question from unused pool
  const randIdx = Math.floor(Math.random() * unusedQuestions.length);
  currentQuestionObj = unusedQuestions[randIdx];
  
  // Mark this question as asked
  game.askedQuestionIds.add(currentQuestionObj.id);
  
  // Render text
  document.getElementById('question-text').innerText = currentQuestionObj.q;
  document.getElementById('question-feedback').innerText = "";
  document.getElementById('question-feedback').className = "feedback-text";
  
  const optionsContainer = document.getElementById('question-options');
  optionsContainer.innerHTML = "";
  
  currentQuestionObj.o.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = "option-btn";
    btn.innerText = `${idx + 1}. ${opt}`;
    btn.addEventListener('click', () => checkQuestionAnswer(idx, btn));
    optionsContainer.appendChild(btn);
  });
}

function triggerBossQuestion() {
  game.isQuestionActive = true;
  game.isBossQuestion = true;
  document.getElementById('question-modal').classList.remove('hidden');
  
  const questionSubtitle = document.querySelector('#question-card .question-subtitle');
  if (questionSubtitle) {
    questionSubtitle.innerText = `ตอบคำถามอัญเชิญสายฟ้าเพื่อสร้างความเสียหายแก่บอส! (ตอบถูกลดเลือดบอส 1HP, ตอบผิดลดเลือดเรา 1HP)`;
  }
  
  const questionPool = CHINESE_QUESTIONS_BY_LEVEL[game.currentLevel] || CHINESE_QUESTIONS_BY_LEVEL[1];
  let unusedQuestions = questionPool.filter(q => !game.askedQuestionIds.has(q.id));
  
  // Repeating pool for Level 4 boss questions
  if (unusedQuestions.length === 0) {
    questionPool.forEach(q => game.askedQuestionIds.delete(q.id));
    unusedQuestions = questionPool;
  }
  
  const randIdx = Math.floor(Math.random() * unusedQuestions.length);
  currentQuestionObj = unusedQuestions[randIdx];
  
  game.askedQuestionIds.add(currentQuestionObj.id);
  
  document.getElementById('question-text').innerText = currentQuestionObj.q;
  document.getElementById('question-feedback').innerText = "";
  document.getElementById('question-feedback').className = "feedback-text";
  
  const optionsContainer = document.getElementById('question-options');
  optionsContainer.innerHTML = "";
  
  currentQuestionObj.o.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = "option-btn";
    btn.innerText = `${idx + 1}. ${opt}`;
    btn.addEventListener('click', () => checkQuestionAnswer(idx, btn));
    optionsContainer.appendChild(btn);
  });
}

function checkQuestionAnswer(selectedIndex, clickedBtn) {
  // Disable all options to prevent double-click
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  const feedbackEl = document.getElementById('question-feedback');
  
  if (selectedIndex === currentQuestionObj.a) {
    // Correct Answer
    clickedBtn.classList.add('correct');

    // Record learned Chinese vocabulary into Taoist Sanctuary archive
    if (currentQuestionObj && currentQuestionObj.q) {
      const match = currentQuestionObj.q.match(/['"‘“]([\u4e00-\u9fa5]+)['"’”]/);
      if (match && match[1]) {
        profileManager.recordLearnedVocab(match[1]);
      }
    }

    if (game.isBossQuestion) {
      feedbackEl.innerText = "ถูกต้อง! 🎉 โจมตีสร้างความเสียหายแก่บอส 1 HP";
      feedbackEl.className = "feedback-text feedback-correct";
      if (game.boss && game.boss.alive) {
        game.boss.takeDamage(1);
      }
      profileManager.addJade(2);
      game.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (game.jadeCount + 2);
      audio.playCollect();
      updateHUD();
      
      // Resume and close modal after 1.5 seconds
      setTimeout(() => {
        game.isQuestionActive = false;
        game.isBossQuestion = false;
        document.getElementById('question-modal').classList.add('hidden');
      }, 1500);
    } else {
      let jadeReward = 5;
      if (game.selectedCharacter === 2) {
        jadeReward = 10;
      } else if (game.selectedCharacter === 1) {
        jadeReward = 3;
      }
      if (game.currentLevel === 13 || game.currentLevel === 15) {
        feedbackEl.innerText = `Correct! 🎉 Received +${jadeReward} Jade Shards`;
      } else {
        feedbackEl.innerText = `ถูกต้อง! 🎉 ได้รับ +${jadeReward} หยกเขียว`;
      }
      feedbackEl.className = "feedback-text feedback-correct";
      
      profileManager.addJade(jadeReward);
      game.jadeCount = profileManager.getActiveProfile() ? profileManager.getActiveProfile().jade : (game.jadeCount + jadeReward);
      audio.playCollect();
      updateHUD();
      
      // Resume and close modal after 1.5 seconds
      setTimeout(() => {
        game.lastQuestionClearedHeight = game.currentQuestionMilestone;
        game.isQuestionActive = false;
        document.getElementById('question-modal').classList.add('hidden');
      }, 1500);
    }
  } else {
    // Incorrect Answer
    clickedBtn.classList.add('incorrect');
    if (game.currentLevel === 13 || game.currentLevel === 15) {
      feedbackEl.innerText = "Incorrect answer! ❌ Lost 1 Health point";
    } else {
      feedbackEl.innerText = "คำตอบไม่ถูกต้อง! ❌ พลังชีวิตลดลง 1 หน่วย";
    }
    feedbackEl.className = "feedback-text feedback-incorrect";
    
    player.health--;
    audio.playDamage();
    updateHUD();
    
    // Shake elements
    const hudHealthCard = document.getElementById('hud-health-card');
    hudHealthCard.classList.add('shake-effect');
    setTimeout(() => hudHealthCard.classList.remove('shake-effect'), 500);
    
    const questionCard = document.getElementById('question-card');
    questionCard.classList.add('shake-effect');
    setTimeout(() => questionCard.classList.remove('shake-effect'), 500);
    
    setTimeout(() => {
      if (player.health <= 0) {
        // Player dies (out of health) - Trigger Permadeath Game Over
        game.isQuestionActive = true; // Freeze physics
        audio.playDefeat();
        
        // Hide modals and HUD
        document.getElementById('question-modal').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        
        // Populate stats for Game Over screen
        const lvlText = LEVELS_CONFIG[game.currentLevel].name || `ด่าน ${game.currentLevel}`;
        document.getElementById('game-over-level').innerText = lvlText;
        
        const targetMeters = LEVELS_CONFIG[game.currentLevel].heightMeters;
        let realHeight = Math.floor(Math.abs(player.y) / 14.5);
        if (realHeight < 0) realHeight = 0;
        if (realHeight > targetMeters) realHeight = targetMeters;
        document.getElementById('game-over-height').innerText = `${realHeight}m / ${targetMeters}m`;
        
        // Show Game Over overlay
        document.getElementById('game-over-screen').classList.remove('hidden');
      } else {
        // Pick another question and display
        if (game.isBossQuestion) {
          triggerBossQuestion();
        } else {
          triggerQuestion(game.currentQuestionMilestone);
        }
      }
    }, 1800);
  }
}

// Update HUD texts
function updateHUD() {
  document.getElementById('jade-count').innerText = game.jadeCount;
  
  // Update Health Emojis
  let heartsStr = "";
  for (let i = 0; i < player.maxHealth; i++) {
    if (i < player.health) {
      heartsStr += "❤️";
    } else {
      heartsStr += "🖤";
    }
  }
  document.getElementById('health-val').innerText = heartsStr;

  // Altitude goes from 0m to targetMeters based on level vertical climb
  const targetMeters = LEVELS_CONFIG[game.currentLevel].heightMeters;
  let realHeight = Math.floor(Math.abs(player.y) / 14.5);
  if (realHeight < 0) realHeight = 0;
  if (realHeight > targetMeters) realHeight = targetMeters;
  
  game.altitude = realHeight;
  const currentName = LEVELS_CONFIG[game.currentLevel].isSpecial ? "ด่านพิเศษ" : `ด่าน ${game.currentLevel}`;
  document.getElementById('height-val').innerText = `${realHeight}m / ${targetMeters}m (${currentName})`;
  
  // Progress fill %
  const pct = (realHeight / targetMeters) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  
  // Dynamic audio zone adjustment based on height ratio
  const heightRatio = realHeight / targetMeters;
  if (heightRatio < 0.33) {
    audio.setZone(1);
  } else if (heightRatio < 0.66) {
    audio.setZone(2);
  } else {
    audio.setZone(3);
  }
}

// Update Shop items button levels and states
function updateShopUI() {
  const categories = ['jump', 'speed', 'doublejump', 'float', 'shooting'];
  
  categories.forEach(cat => {
    const lvlSpan = document.getElementById(`lvl-${cat}`);
    const maxSpan = document.getElementById(`max-${cat}`);
    const costBtn = document.getElementById(`buy-${cat}`);
    
    if (lvlSpan && costBtn) {
      const lvl = game.upgrades[cat];
      let max = game.upgradeCosts[cat].max;
      if (cat === 'jump' && game.selectedCharacter === 1) {
        max = 3;
      }
      
      if (maxSpan) {
        maxSpan.innerText = max;
      }
      lvlSpan.innerText = lvl;
      
      const cost = game.getCost(cat);
      if (cost === 'MAX') {
        costBtn.querySelector('.cost-val').innerText = 'MAX';
        costBtn.querySelector('.cost-currency').style.display = 'none';
        costBtn.classList.add('disabled');
      } else {
        costBtn.querySelector('.cost-val').innerText = cost;
        costBtn.querySelector('.cost-currency').style.display = 'inline';
        
        if (game.jadeCount >= cost) {
          costBtn.classList.remove('disabled');
        } else {
          costBtn.classList.add('disabled');
        }
      }
    }
  });

  // Update Buy Heart button state
  const heartBtn = document.getElementById('buy-heart');
  if (heartBtn) {
    let cost = 15;
    if (game.selectedCharacter === 5) {
      cost = Math.floor(cost * 0.8);
    }
    const costValSpan = heartBtn.querySelector('.cost-val');
    if (player.health >= player.maxHealth) {
      costValSpan.innerText = 'FULL';
      heartBtn.querySelector('.cost-currency').style.display = 'none';
      heartBtn.classList.add('disabled');
    } else {
      costValSpan.innerText = cost;
      heartBtn.querySelector('.cost-currency').style.display = 'inline';
      if (game.jadeCount >= cost) {
        heartBtn.classList.remove('disabled');
      } else {
        heartBtn.classList.add('disabled');
      }
    }
  }
}

// Input Handlers
const keys = {};
window.addEventListener('keydown', e => {
  if (game.state !== 'PLAYING') return;

  const k = e.key.toLowerCase();
  keys[k] = true;
  keys[e.code] = true;

  // Prevent default behavior for game keys to stop browser scrolling
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k) || 
      ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }

  // Shortcuts
  if (k === 'e' || e.code === 'KeyE' || e.key === 'Escape' || e.code === 'Escape') {
    toggleShop();
  }
  if ((k === 'r' || e.code === 'KeyR') && !game.shopOpen) {
    respawnAtCheckpoint();
  }
  if ((k === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.code === 'ArrowUp' || k === 'w' || e.code === 'KeyW') && !game.shopOpen && !e.repeat) {
    player.jump();
  }
  if ((k === 'f' || e.code === 'KeyF') && !game.shopOpen && !e.repeat) {
    playerShoot();
  }
});

window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  keys[k] = false;
  keys[e.code] = false;
});

// --- MODERN POINTER EVENTS TOUCH CONTROLS (iPad, Tablet & Mobile Support) ---
const activeMobileControls = { left: false, right: false };

function enableTouchMode() {
  document.body.classList.add('is-touch-device');
}

if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) {
  enableTouchMode();
}
window.addEventListener('touchstart', enableTouchMode, { once: true, passive: true });
window.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') enableTouchMode();
}, { once: true, passive: true });

function bindPointerButton(btn, onDown, onUp) {
  if (!btn) return;
  btn.style.touchAction = 'none';

  const handleDown = (e) => {
    if (e.cancelable) e.preventDefault();
    if (e.pointerId !== undefined && btn.setPointerCapture) {
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
    }
    btn.classList.add('active');
    if (onDown) onDown(e);
  };

  const handleUp = (e) => {
    if (e.cancelable) e.preventDefault();
    if (e.pointerId !== undefined && btn.releasePointerCapture) {
      try { btn.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    btn.classList.remove('active');
    if (onUp) onUp(e);
  };

  btn.addEventListener('pointerdown', handleDown, { passive: false });
  btn.addEventListener('pointerup', handleUp, { passive: false });
  btn.addEventListener('pointercancel', handleUp, { passive: false });
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');
const btnShoot = document.getElementById('btn-shoot');
const btnMobileShop = document.getElementById('btn-mobile-shop');

bindPointerButton(btnLeft, 
  () => { activeMobileControls.left = true; }, 
  () => { activeMobileControls.left = false; }
);

bindPointerButton(btnRight, 
  () => { activeMobileControls.right = true; }, 
  () => { activeMobileControls.right = false; }
);

bindPointerButton(btnJump, 
  () => {
    if (game.state === 'PLAYING' && !game.shopOpen) {
      player.jump();
    }
  }, 
  () => {}
);

bindPointerButton(btnShoot, 
  () => {
    if (game.state === 'PLAYING' && !game.shopOpen) {
      playerShoot();
    }
  }, 
  () => {}
);

bindPointerButton(btnMobileShop, 
  (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    toggleShop();
  }, 
  () => {}
);

// On-Canvas Direct Touch/Tap/Swipe for Tower Climb on iPad
canvas.addEventListener('pointerdown', (e) => {
  if (window.currentMode !== 'climb' || game.state !== 'PLAYING' || game.shopOpen) return;
  if (e.target !== canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  const relY = (e.clientY - rect.top) / rect.height;

  if (relY > 0.45) {
    if (relX < 0.4) {
      activeMobileControls.left = true;
    } else if (relX > 0.6) {
      activeMobileControls.right = true;
    } else {
      player.jump();
    }
  } else {
    player.jump();
  }
}, { passive: false });

const clearCanvasClimbTouch = () => {
  if (window.currentMode !== 'climb') return;
  activeMobileControls.left = false;
  activeMobileControls.right = false;
};

canvas.addEventListener('pointerup', clearCanvasClimbTouch, { passive: true });
canvas.addEventListener('pointercancel', clearCanvasClimbTouch, { passive: true });

// Shop trigger elements
function toggleShop() {
  game.shopOpen = !game.shopOpen;
  const shopEl = document.getElementById('shop-modal');
  const shopBtn = document.getElementById('btn-toggle-shop');

  if (game.shopOpen) {
    shopEl.classList.remove('hidden');
    shopBtn.querySelector('span').innerText = '❌ CLOSE (E)';
    updateShopUI();
  } else {
    shopEl.classList.add('hidden');
    shopBtn.querySelector('span').innerText = '🛒 SHOP (E)';
  }
}

document.getElementById('btn-toggle-shop').addEventListener('click', e => {
  e.stopPropagation();
  toggleShop();
});

document.getElementById('btn-close-shop').addEventListener('click', e => {
  e.stopPropagation();
  toggleShop();
});

// Close shop if clicked outside
document.getElementById('shop-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('shop-modal')) {
    toggleShop();
  }
});

// Purchase triggers
document.getElementById('buy-jump').addEventListener('click', () => game.buyUpgrade('jump'));
document.getElementById('buy-speed').addEventListener('click', () => game.buyUpgrade('speed'));
document.getElementById('buy-doublejump').addEventListener('click', () => game.buyUpgrade('doublejump'));
document.getElementById('buy-float').addEventListener('click', () => game.buyUpgrade('float'));
document.getElementById('buy-shooting').addEventListener('click', () => game.buyUpgrade('shooting'));
document.getElementById('buy-heart').addEventListener('click', () => game.buyHeart());

// Sound Toggle click
document.getElementById('audio-control').addEventListener('click', () => {
  const isMuted = audio.toggleMute();
  document.querySelector('.audio-icon').innerText = isMuted ? '🔇' : '🔊';
});

// Dynamic drawing of characters on selection screen canvases

// Shared character drawing helper to render different animal/kid graphics
function drawCharacterModel(ctx, charId, size, facingLeft, runCycle, vx, squashX = 1, squashY = 1) {
  ctx.save();
  ctx.scale(squashX, squashY);
  
  // Tilt based on velocity & running animation
  let rot = vx * 0.02;
  if (runCycle > 0) {
    rot += Math.sin(runCycle) * 0.08;
  }
  ctx.rotate(rot);

  // Flip horizontally if facing left
  if (facingLeft) {
    ctx.scale(-1, 1);
  }

  // --- 2D CARTOON SPRITESHEET RENDERING FOR ALL CHARACTERS ---
  const spriteCfg = CHARACTER_SPRITES[charId];
  const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
  const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
  const isMoving = Math.abs(vx) > 0.5;

  if (spriteCfg) {
    const drawW = size * 2.8;
    const drawH = size * 2.8;
    const drawX = -drawW / 2;
    const drawY = -drawH / 2 - 4;
    const frameW = 256;

    let drawn = false;

    if (isAirborne && spriteCfg.jump.complete && spriteCfg.jump.naturalWidth > 0) {
      let jumpFrame = 2; // Mid-air apex / hover default
      if (pVy < -3) {
        jumpFrame = 1; // Ascending leap upward
      } else if (pVy > 2) {
        jumpFrame = 3; // Falling / descending downward
      } else {
        jumpFrame = 2; // Apex / hover
      }
      ctx.drawImage(spriteCfg.jump, jumpFrame * frameW, 0, frameW, 256, drawX, drawY, drawW, drawH);
      drawn = true;
    } else if (isMoving && spriteCfg.run.complete && spriteCfg.run.naturalWidth > 0) {
      const runIndex = Math.floor(Math.abs(runCycle * 1.5)) % spriteCfg.runFrames;
      ctx.drawImage(spriteCfg.run, runIndex * frameW, 0, frameW, 256, drawX, drawY, drawW, drawH);
      drawn = true;
    } else if (spriteCfg.idle.complete && spriteCfg.idle.naturalWidth > 0) {
      const idleIndex = Math.floor((Date.now() * 0.003)) % spriteCfg.idleFrames;
      ctx.drawImage(spriteCfg.idle, idleIndex * frameW, 0, frameW, 256, drawX, drawY, drawW, drawH);
      drawn = true;
    } else if (spriteCfg.icon.complete && spriteCfg.icon.naturalWidth > 0) {
      ctx.drawImage(spriteCfg.icon, drawX, drawY, drawW, drawH);
      drawn = true;
    }

    if (drawn) {
      // Special character effects
      if (charId === 1 && isAirborne) {
        // Wind Seeker jade wing flutter aura
        ctx.save();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.35, size * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (charId === 5 && isAirborne) {
        // Cloud Master small cloud wisps under feet
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.9, size * 0.8, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (charId === 6 && (Math.abs(vx) > 1.2 || isAirborne)) {
        // Ink Sage droplets trailing behind
        if (typeof game !== 'undefined' && game.particles && Math.random() < 0.22) {
          game.particles.push(
            new Particle(
              (player ? player.x + player.width/2 : 0) + (Math.random() - 0.5) * 12,
              (player ? player.y + player.height - 4 : 0),
              Math.random() < 0.5 ? 'rgba(15, 23, 42, 0.45)' : 'rgba(56, 189, 248, 0.5)',
              (Math.random() - 0.5) * 2,
              -Math.random() * 2,
              2 + Math.random() * 3,
              0.4
            )
          );
        }
      }

      ctx.restore();
      return;
    }
  }

  if (charId === 1) { // 1. ตั๊กแตนวายุ (Wind Seeker) - Fallback
    const bodyColor = '#22c55e'; // Bright emerald green
    const limbColor = '#15803d'; // Dark green joints & limbs
    const eyeColor = '#0f172a';  // Glossy dark slate eyes
    const wingColor = 'rgba(187, 247, 208, 0.65)'; // Translucent jade wing
    const wingBorder = '#4ade80';

    // Animation variables derived from movement physics
    const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
    const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
    const isAnticipating = (typeof player !== 'undefined' && player && player.jumpAnticipationTimer > 0);
    const isSpinning = (typeof player !== 'undefined' && player && player.jumpCount >= 3);
    const isDoubleJumping = (typeof player !== 'undefined' && player && player.jumpCount === 2);

    // Dynamic angles & offsets
    let legCycle = runCycle * 1.8;
    let wingFlap = 0;
    let crouchDrop = 0;

    if (isAnticipating) {
      // Crouch anticipation right before jumping!
      crouchDrop = 6;
    }

    if (isAirborne) {
      // High-speed wing fluttering in the air!
      wingFlap = Math.sin(Date.now() * 0.045) * 0.75;
      if (isDoubleJumping) wingFlap *= 1.35;
    } else if (Math.abs(vx) > 0.5) {
      // Subtle wing shimmer while running
      wingFlap = Math.sin(legCycle * 2) * 0.15;
    }

    if (isSpinning) {
      // Active 360 degree tornado spin
      ctx.rotate((Date.now() * 0.025) % (Math.PI * 2));
      // Draw cyclone wind vortex around body
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
      ctx.lineWidth = 3;
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const r = size * (1.2 + w * 0.4);
        ctx.ellipse(0, 0, r, r * 0.6, (Date.now() * 0.01 + w) % (Math.PI * 2), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 1. DYNAMIC INSECT WINGS (Behind Body)
    ctx.save();
    const wingBaseX = -size * 0.35;
    const wingBaseY = -size * 0.3 + crouchDrop;
    
    // Left / Back Wing
    ctx.save();
    ctx.translate(wingBaseX, wingBaseY);
    ctx.rotate(isAirborne ? (-0.6 + wingFlap) : (-0.15 + wingFlap * 0.3));
    ctx.fillStyle = wingColor;
    ctx.strokeStyle = wingBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-size * 0.5, -size * 0.6, size * 0.45, size * 1.25, Math.PI / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Wing inner veins
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.6, -size * 1.2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.8, -size * 0.7);
    ctx.stroke();
    ctx.restore();

    // Right / Front Wing
    ctx.save();
    ctx.translate(wingBaseX + 6, wingBaseY + 3);
    ctx.rotate(isAirborne ? (-0.2 + wingFlap * 0.9) : (0.1 + wingFlap * 0.3));
    ctx.fillStyle = wingColor;
    ctx.strokeStyle = wingBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.5, size * 0.35, size * 1.05, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // 2. BACK LEGS (Natural Walking / Jumping Leg Motion)
    let backLegAngle = 0;
    let frontLegAngle = 0;

    if (isAirborne) {
      if (pVy < 0) {
        // Leaping upward: legs tucked / bent backward naturally
        backLegAngle = -0.55;
        frontLegAngle = 0.45;
      } else {
        // Falling down: legs extended ready to catch the ground
        backLegAngle = 0.3;
        frontLegAngle = -0.2;
      }
    } else if (Math.abs(vx) > 0.5) {
      // Running: scissor leg stride with knee bend
      backLegAngle = Math.sin(legCycle) * 0.75;
      frontLegAngle = -Math.sin(legCycle) * 0.75;
    } else {
      // Idle breathing stance
      backLegAngle = Math.sin(Date.now() * 0.004) * 0.05;
      frontLegAngle = -backLegAngle;
    }

    // Draw Back Leg
    ctx.save();
    ctx.translate(-size * 0.4, size * 0.2 + crouchDrop);
    ctx.rotate(backLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.3, size * 0.4);
    ctx.lineTo(-size * 0.1, size * 0.85);
    ctx.stroke();
    // Foot
    ctx.beginPath();
    ctx.arc(-size * 0.1, size * 0.85, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. MAIN BODY (With breathing & crouch motion)
    ctx.save();
    ctx.translate(0, crouchDrop);
    
    // Torso / Abdomen
    const bodyGrad = ctx.createRadialGradient(0, 0, size * 0.2, 0, size * 0.1, size * 1.1);
    bodyGrad.addColorStop(0, '#4ade80');
    bodyGrad.addColorStop(0.7, bodyColor);
    bodyGrad.addColorStop(1, limbColor);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Abdomen tail segments behind
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.ellipse(-size * 0.7, size * 0.4, size * 0.35, size * 0.55, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Leaf Martial Arts Badge
    ctx.fillStyle = '#12d58a';
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, size * 0.3, 4, 6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Martial Arts Belt (Sash with shiny buckle)
    ctx.fillStyle = '#12d58a';
    ctx.fillRect(-size + 1, size - 13, size * 2 - 2, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, size - 13, 8, 7);
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, size - 13, 8, 7);

    // Neck Collar Ring
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(0, -size + 14, size * 0.95, Math.PI, 2 * Math.PI);
    ctx.fill();

    // 4. HEAD (With eye glances and glossy anime eyes)
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Antennae (Sensors waving with air currents)
    const antennaWiggle = isAirborne ? Math.sin(Date.now() * 0.02) * 3 : Math.sin(Date.now() * 0.005) * 1.5;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-size * 0.4 + antennaWiggle, -size - 2, 12, Math.PI, Math.PI * 1.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.4 + antennaWiggle, -size - 2, 12, Math.PI * 1.45, Math.PI * 2);
    ctx.stroke();

    // Giant Glossy Bug Eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(-size * 0.35, -size + 9, 6, 8, -Math.PI / 10, 0, Math.PI * 2);
    ctx.ellipse(size * 0.35, -size + 9, 6, 8, Math.PI / 10, 0, Math.PI * 2);
    ctx.fill();

    // Eye Highlights (Sparkles)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size + 7, 2.2, 0, Math.PI * 2);
    ctx.arc(size * 0.28, -size + 7, 2.2, 0, Math.PI * 2);
    ctx.arc(-size * 0.36, -size + 11, 1, 0, Math.PI * 2);
    ctx.arc(size * 0.36, -size + 11, 1, 0, Math.PI * 2);
    ctx.fill();

    // 5. NINJA HEADBAND (Floating ribbons waving with wind speed)
    const ribbonWave = isAirborne ? (Math.sin(Date.now() * 0.025) * 8) : (Math.sin(legCycle * 2) * 4);
    ctx.fillStyle = '#12d58a';
    ctx.fillRect(-size * 0.8, -size - 4, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 1);
    ctx.lineTo(-size * 0.7 - 14, -size + 5 + ribbonWave);
    ctx.lineTo(-size * 0.7 - 20, -size + 3 + ribbonWave * 1.2);
    ctx.lineTo(-size * 0.7 - 12, -size + 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // Restore body translate

    // 6. FRONT LEGS (Natural Walking / Jumping Leg Motion)
    ctx.save();
    ctx.translate(size * 0.3, size * 0.2 + crouchDrop);
    ctx.rotate(frontLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.35, size * 0.4);
    ctx.lineTo(size * 0.15, size * 0.85);
    ctx.stroke();
    // Foot
    ctx.beginPath();
    ctx.arc(size * 0.15, size * 0.85, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. FRONT ARMS / PRAYING MANTIS SCYTHES
    ctx.save();
    ctx.translate(size * 0.4, size * 0.1 + crouchDrop);
    const armWiggle = isAirborne ? -0.4 : Math.sin(legCycle) * 0.3;
    ctx.rotate(armWiggle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.35, size * 0.3);
    ctx.lineTo(size * 0.15, size * 0.6);
    ctx.stroke();
    ctx.restore();
  } else if (charId === 2) { // 2. เด็กเนิร์ดนำโชค (Fortune Sage) - Dynamic Walking & Jumping
    const skinColor = '#fed7aa'; // Light Peach skin
    const hairColor = '#451a03'; // Brown hair
    const clothesColor = '#1d4ed8'; // Royal Blue shirt
    const limbColor = '#1c1e22';
    
    // Movement animation variables
    const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
    const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
    const isAnticipating = (typeof player !== 'undefined' && player && player.jumpAnticipationTimer > 0);
    let legCycle = runCycle * 1.8;
    let crouchDrop = isAnticipating ? 5 : 0;

    let backLegAngle = 0;
    let frontLegAngle = 0;
    let armAngle = 0;

    if (isAirborne) {
      if (pVy < 0) {
        // Jumping up: legs tucked, arms raising with excitement
        backLegAngle = -0.5;
        frontLegAngle = 0.45;
        armAngle = -0.7;
      } else {
        // Falling down: legs spread to land
        backLegAngle = 0.25;
        frontLegAngle = -0.25;
        armAngle = 0.3;
      }
    } else if (Math.abs(vx) > 0.5) {
      // Natural walking stride
      backLegAngle = Math.sin(legCycle) * 0.7;
      frontLegAngle = -Math.sin(legCycle) * 0.7;
      armAngle = Math.sin(legCycle) * 0.6;
    } else {
      // Idle breathing
      backLegAngle = Math.sin(Date.now() * 0.004) * 0.05;
      frontLegAngle = -backLegAngle;
    }

    // 1. Back Arm (behind body)
    ctx.save();
    ctx.translate(-size * 0.2, -size * 0.1 + crouchDrop);
    ctx.rotate(-armAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.3, size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-size * 0.3, size * 0.4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Back Leg (behind body)
    ctx.save();
    ctx.translate(-size * 0.35, size * 0.3 + crouchDrop);
    ctx.rotate(backLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.15, size * 0.45);
    ctx.lineTo(-size * 0.05, size * 0.8);
    ctx.stroke();
    // Shoe
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(-size * 0.05, size * 0.8, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Body (Torso with shirt & gold coin)
    ctx.save();
    ctx.translate(0, crouchDrop);
    ctx.fillStyle = clothesColor;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gold Coin icon on shirt
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.5, -1.5, 3, 3);

    // Sash (Gold belt)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-size + 1, size - 13, size * 2 - 2, 7);
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(-4, size - 13, 8, 7);

    // Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(-size * 0.3, -size + 8, size * 0.6, 8);

    // 4. Head & Face
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -size + 6, size * 0.85, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.fillRect(-size * 0.8, -size - 2, size * 1.6, 7);

    // Big Nerd Glasses
    ctx.strokeStyle = '#1e293b'; // Black frame
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ffffff';
    
    // Left Lens
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size + 11, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Lens
    ctx.beginPath();
    ctx.arc(size * 0.35, -size + 11, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glasses bridge connection
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size + 11);
    ctx.lineTo(size * 0.1, -size + 11);
    ctx.stroke();

    // Eyes inside glasses (glances in air)
    const eyeLookY = isAirborne ? (pVy < 0 ? -2 : 1) : 0;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size + 11 + eyeLookY, 2.2, 0, Math.PI * 2);
    ctx.arc(size * 0.35, -size + 11 + eyeLookY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.arc(-size * 0.55, -size + 17, 3, 0, Math.PI * 2);
    ctx.arc(size * 0.55, -size + 17, 3, 0, Math.PI * 2);
    ctx.fill();

    // 5. Headband Ribbons waving
    const nerdRibbon = isAirborne ? (Math.sin(Date.now() * 0.02) * 7) : (Math.sin(legCycle * 2) * 4);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-size * 0.8, -size - 6, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 3);
    ctx.lineTo(-size * 0.7 - 14, -size + 3 + nerdRibbon);
    ctx.lineTo(-size * 0.7 - 20, -size + 1 + nerdRibbon * 1.2);
    ctx.lineTo(-size * 0.7 - 12, -size - 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // Restore body translate

    // 6. Front Leg (Walking Stride)
    ctx.save();
    ctx.translate(size * 0.3, size * 0.3 + crouchDrop);
    ctx.rotate(frontLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.2, size * 0.45);
    ctx.lineTo(size * 0.1, size * 0.8);
    ctx.stroke();
    // Shoe
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(size * 0.1, size * 0.8, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Front Arm (Swinging / Pointing)
    ctx.save();
    ctx.translate(size * 0.35, -size * 0.05 + crouchDrop);
    ctx.rotate(armAngle);
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.3, size * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (charId === 3) { // 3. ปู่เต่าอายุยืน (Longevity Master) - Dynamic Walking & Shell Tuck Jump
    const shellColor = '#78350f'; // Brown shell
    const shellPatternColor = '#b45309'; // Lighter brown patterns
    const skinColor = '#84cc16'; // Lime/Olive Green
    const limbColor = '#4d7c0f'; // Dark green
    
    const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
    const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
    const isAnticipating = (typeof player !== 'undefined' && player && player.jumpAnticipationTimer > 0);
    let legCycle = runCycle * 1.5;
    let crouchDrop = isAnticipating ? 7 : 0; // Grand turtle deeply crouches into shell!

    let backLegAngle = 0;
    let frontLegAngle = 0;

    if (isAirborne) {
      if (pVy < 0) {
        // Leaping up: limbs tucked near shell
        backLegAngle = -0.4;
        frontLegAngle = 0.3;
      } else {
        // Descending: limbs stretching out
        backLegAngle = 0.3;
        frontLegAngle = -0.2;
      }
    } else if (Math.abs(vx) > 0.5) {
      // Stately, deliberate turtle stride
      backLegAngle = Math.sin(legCycle) * 0.65;
      frontLegAngle = -Math.sin(legCycle) * 0.65;
    } else {
      // Resting stance
      backLegAngle = Math.sin(Date.now() * 0.003) * 0.04;
      frontLegAngle = -backLegAngle;
    }

    // 1. Turtle Shell (Behind body)
    ctx.save();
    ctx.translate(0, crouchDrop);
    ctx.fillStyle = shellColor;
    ctx.beginPath();
    ctx.arc(-size * 0.3, 0, size * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shell patterns (Hexagon crosslines)
    ctx.strokeStyle = shellPatternColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-size * 0.3, 0, size * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.7);
    ctx.lineTo(-size * 0.3, size * 0.7);
    ctx.moveTo(-size * 1.0, 0);
    ctx.lineTo(size * 0.4, 0);
    ctx.stroke();
    ctx.restore();

    // 2. Back Leg (Walking Stride)
    ctx.save();
    ctx.translate(-size * 0.45, size * 0.35 + crouchDrop);
    ctx.rotate(backLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.2, size * 0.45);
    ctx.stroke();
    // Padded turtle foot
    ctx.beginPath();
    ctx.arc(-size * 0.2, size * 0.45, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Main Body & Chest
    ctx.save();
    ctx.translate(0, crouchDrop);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size * 0.2, 5, 0, Math.PI*2);
    ctx.arc(size * 0.4, -size * 0.2, 5, 0, Math.PI*2);
    ctx.fill();

    // Sash
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(-size + 3, size - 13, size * 1.8, 7);
    ctx.fillStyle = '#eab308'; 
    ctx.fillRect(-4, size - 13, 8, 7);

    // Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(-size * 0.25, -size + 6, size * 0.5, 8);

    // 4. Head & Wise Face
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.25, -size + 10, 3, 0, Math.PI * 2);
    ctx.arc(size * 0.25, -size + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // White reflections
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.23, -size + 9, 1, 0, Math.PI * 2);
    ctx.arc(size * 0.27, -size + 9, 1, 0, Math.PI * 2);
    ctx.fill();

    // Small happy mouth
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -size + 14, 3, 0, Math.PI);
    ctx.stroke();

    // 5. Headband Ribbons waving
    const turtleRibbon = isAirborne ? (Math.sin(Date.now() * 0.02) * 6) : (Math.sin(legCycle * 2) * 3);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(-size * 0.75, -size - 4, size * 1.5, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.65, -size - 1);
    ctx.lineTo(-size * 0.65 - 14, -size + 5 + turtleRibbon);
    ctx.lineTo(-size * 0.65 - 20, -size + 3 + turtleRibbon * 1.2);
    ctx.lineTo(-size * 0.65 - 12, -size + 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // Restore body translate

    // 6. Front Leg (Walking Stride)
    ctx.save();
    ctx.translate(size * 0.35, size * 0.35 + crouchDrop);
    ctx.rotate(frontLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.2, size * 0.45);
    ctx.stroke();
    // Padded foot
    ctx.beginPath();
    ctx.arc(size * 0.2, size * 0.45, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Front Arm
    ctx.save();
    ctx.translate(size * 0.35, -size * 0.05 + crouchDrop);
    const turtleArm = isAirborne ? -0.5 : Math.sin(legCycle) * 0.4;
    ctx.rotate(turtleArm);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.3, size * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.35, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (charId === 4) { // 4. แพนด้ากายแกร่ง (Iron Body) - Powerful Martial Arts Stride & Leap
    const bodyColor = '#ffffff';
    const limbColor = '#1f2937'; // Slate Black
    const sashColor = '#dc2626'; // Crimson
    const buckleColor = '#eab308'; // Gold
    const headbandColor = '#dc2626';
    
    const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
    const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
    const isAnticipating = (typeof player !== 'undefined' && player && player.jumpAnticipationTimer > 0);
    let legCycle = runCycle * 1.8;
    let crouchDrop = isAnticipating ? 6 : 0;

    let backLegAngle = 0;
    let frontLegAngle = 0;
    let armAngle = 0;

    if (isAirborne) {
      if (pVy < 0) {
        // Kung Fu Jump Kick / Ascension
        backLegAngle = -0.65;
        frontLegAngle = 0.55;
        armAngle = -0.75;
      } else {
        // Heavy Stomp Descent
        backLegAngle = 0.3;
        frontLegAngle = -0.3;
        armAngle = 0.4;
      }
    } else if (Math.abs(vx) > 0.5) {
      // Heavy Kung Fu running stride
      backLegAngle = Math.sin(legCycle) * 0.8;
      frontLegAngle = -Math.sin(legCycle) * 0.8;
      armAngle = Math.sin(legCycle) * 0.7;
    } else {
      // Martial Arts ready stance
      backLegAngle = Math.sin(Date.now() * 0.004) * 0.05;
      frontLegAngle = -backLegAngle;
    }

    // 1. Back Arm (behind body)
    ctx.save();
    ctx.translate(-size * 0.25, -size * 0.1 + crouchDrop);
    ctx.rotate(-armAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.35, size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-size * 0.35, size * 0.4, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Back Leg (behind body)
    ctx.save();
    ctx.translate(-size * 0.4, size * 0.3 + crouchDrop);
    ctx.rotate(backLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.2, size * 0.45);
    ctx.lineTo(-size * 0.1, size * 0.85);
    ctx.stroke();
    // Strong Panda Paw
    ctx.beginPath();
    ctx.arc(-size * 0.1, size * 0.85, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Main Body (Torso & Armor)
    ctx.save();
    ctx.translate(0, crouchDrop);
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Armor chestplate stripe
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, 0);
    ctx.lineTo(size * 0.7, 0);
    ctx.stroke();

    // Sash
    ctx.fillStyle = sashColor;
    ctx.fillRect(-size + 1, size - 13, size * 2 - 2, 7);
    ctx.fillStyle = buckleColor; 
    ctx.fillRect(-4, size - 13, 8, 7);

    // Chest / shoulders ring
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(0, -size + 14, size * 0.95, Math.PI, 2 * Math.PI);
    ctx.fill();

    // 4. Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ears
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size * 0.65, -size * 0.1, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.65, -size * 0.1, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eye Patches
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.3, -size + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Inner eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size + 10, 1.8, 0, Math.PI * 2);
    ctx.arc(size * 0.28, -size + 10, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.ellipse(0, -size + 14, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Headband Ribbons waving
    const pandaRibbon = isAirborne ? (Math.sin(Date.now() * 0.025) * 8) : (Math.sin(legCycle * 2) * 4);
    ctx.fillStyle = headbandColor;
    ctx.fillRect(-size * 0.8, -size - 4, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 1);
    ctx.lineTo(-size * 0.7 - 14, -size + 5 + pandaRibbon);
    ctx.lineTo(-size * 0.7 - 20, -size + 3 + pandaRibbon * 1.2);
    ctx.lineTo(-size * 0.7 - 12, -size + 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // Restore body translate

    // 6. Front Leg (Walking Stride)
    ctx.save();
    ctx.translate(size * 0.3, size * 0.3 + crouchDrop);
    ctx.rotate(frontLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.25, size * 0.45);
    ctx.lineTo(size * 0.15, size * 0.85);
    ctx.stroke();
    // Panda Paw
    ctx.beginPath();
    ctx.arc(size * 0.15, size * 0.85, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Front Arm / Kung Fu Fist
    ctx.save();
    ctx.translate(size * 0.4, -size * 0.05 + crouchDrop);
    ctx.rotate(armAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.35, size * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.35, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (charId === 5) { // 5. ลิงเมฆา (Cloud Master) - Agility Monkey Stride & Swishing Cloud Tail
    const bodyColor = '#d97706'; // Golden Brown monkey body
    const faceColor = '#ffedd5'; // Light peach/cream face
    const limbColor = '#78350f'; // Dark Brown limbs
    const sashColor = '#06b6d4'; // Cyan
    const headbandColor = '#06b6d4';
    
    const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
    const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
    const isAnticipating = (typeof player !== 'undefined' && player && player.jumpAnticipationTimer > 0);
    let legCycle = runCycle * 2.0; // Fast monkey scamper
    let crouchDrop = isAnticipating ? 6 : 0;

    let backLegAngle = 0;
    let frontLegAngle = 0;
    let armAngle = 0;

    if (isAirborne) {
      if (pVy < 0) {
        // Leaping into the clouds: acrobatic flip/reach
        backLegAngle = -0.7;
        frontLegAngle = 0.6;
        armAngle = -0.8;
      } else {
        // Floating on air currents
        backLegAngle = 0.3;
        frontLegAngle = -0.25;
        armAngle = 0.3;
      }
    } else if (Math.abs(vx) > 0.5) {
      // Nimble monkey scampering
      backLegAngle = Math.sin(legCycle) * 0.85;
      frontLegAngle = -Math.sin(legCycle) * 0.85;
      armAngle = Math.sin(legCycle) * 0.75;
    } else {
      // Playful idle stance
      backLegAngle = Math.sin(Date.now() * 0.005) * 0.06;
      frontLegAngle = -backLegAngle;
    }

    // 1. Swishing Monkey Tail (Dynamic curl waving in air)
    const tailWave = isAirborne ? (Math.sin(Date.now() * 0.02) * 0.4) : (Math.sin(legCycle) * 0.3);
    ctx.save();
    ctx.translate(-size * 0.8, size * 0.2 + crouchDrop);
    ctx.rotate(tailWave);
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-size * 0.4, 0, 11, Math.PI * 0.5, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();

    // 2. Back Arm
    ctx.save();
    ctx.translate(-size * 0.2, -size * 0.1 + crouchDrop);
    ctx.rotate(-armAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.35, size * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-size * 0.35, size * 0.35, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Back Leg (behind)
    ctx.save();
    ctx.translate(-size * 0.35, size * 0.3 + crouchDrop);
    ctx.rotate(backLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.2, size * 0.45);
    ctx.lineTo(-size * 0.1, size * 0.8);
    ctx.stroke();
    // Monkey paw
    ctx.beginPath();
    ctx.arc(-size * 0.1, size * 0.8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Main Body & Belly
    ctx.save();
    ctx.translate(0, crouchDrop);
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Belly patch
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.arc(0, size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Cloud swirl on belly
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.arc(-size * 0.2, size * 0.3, 4, 0, Math.PI * 2);
    ctx.arc(0, size * 0.3, 5, 0, Math.PI * 2);
    ctx.arc(size * 0.2, size * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sash
    ctx.fillStyle = sashColor;
    ctx.fillRect(-size + 1, size - 13, size * 2 - 2, 7);
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(-4, size - 13, 8, 7);

    // Neck ring
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(0, -size + 14, size * 0.95, Math.PI, 2 * Math.PI);
    ctx.fill();

    // 5. Head & Monkey Mask
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Monkey Face Mask (peach heart shape)
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.arc(-size * 0.2, -size + 8, size * 0.35, 0, Math.PI * 2);
    ctx.arc(size * 0.2, -size + 8, size * 0.35, 0, Math.PI * 2);
    ctx.arc(0, -size + 13, size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Large ears at sides of head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(-size * 0.8, -size + 10, 8, 0, Math.PI * 2);
    ctx.arc(size * 0.8, -size + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Inner ear
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.arc(-size * 0.8, -size + 10, 5, 0, Math.PI * 2);
    ctx.arc(size * 0.8, -size + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Monkey Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.22, -size + 9, 3, 0, Math.PI * 2);
    ctx.arc(size * 0.22, -size + 9, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Reflections
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.2, -size + 8, 1, 0, Math.PI * 2);
    ctx.arc(size * 0.24, -size + 8, 1, 0, Math.PI * 2);
    ctx.fill();

    // Nose & mouth
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(0, -size + 13, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -size + 15, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // 6. Headband Ribbons waving
    const monkeyRibbon = isAirborne ? (Math.sin(Date.now() * 0.025) * 9) : (Math.sin(legCycle * 2) * 5);
    ctx.fillStyle = headbandColor;
    ctx.fillRect(-size * 0.8, -size - 4, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 1);
    ctx.lineTo(-size * 0.7 - 14, -size + 5 + monkeyRibbon);
    ctx.lineTo(-size * 0.7 - 20, -size + 3 + monkeyRibbon * 1.2);
    ctx.lineTo(-size * 0.7 - 12, -size + 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // Restore body translate

    // 7. Front Leg (Walking Stride)
    ctx.save();
    ctx.translate(size * 0.3, size * 0.3 + crouchDrop);
    ctx.rotate(frontLegAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.2, size * 0.45);
    ctx.lineTo(size * 0.1, size * 0.8);
    ctx.stroke();
    // Monkey paw
    ctx.beginPath();
    ctx.arc(size * 0.1, size * 0.8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Front Arm (Agile gesture)
    ctx.save();
    ctx.translate(size * 0.35, -size * 0.05 + crouchDrop);
    ctx.rotate(armAngle);
    ctx.fillStyle = limbColor;
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.3, size * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.35, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (charId === 6) {
    // 6. เซียนน้อยพู่กันจีน (Ink Sage) - Hand-painted Cartoon Spritesheet with Squash & Stretch
    const isAirborne = (typeof player !== 'undefined' && player && !player.grounded);
    const pVy = (typeof player !== 'undefined' && player) ? player.vy : 0;
    const isMoving = Math.abs(vx) > 0.5;

    // Sprite drawing dimensions (preserving crisp aspect ratio)
    const drawW = size * 2.8;
    const drawH = size * 2.8;
    const drawX = -drawW / 2;
    const drawY = -drawH / 2 - 4;

    if (isAirborne && charInkSageJump.complete && charInkSageJump.naturalWidth > 0) {
      // 4 Jump frames: 0 = crouch, 1 = ascend, 2 = apex, 3 = fall
      let jumpFrame = 2;
      if (pVy < -3) jumpFrame = 1;
      else if (pVy > 2) jumpFrame = 3;
      
      const frameW = 256;
      ctx.drawImage(charInkSageJump, jumpFrame * frameW, 0, frameW, 256, drawX, drawY, drawW, drawH);
    } else if (isMoving && charInkSageRun.complete && charInkSageRun.naturalWidth > 0) {
      // 6 Run frames: run cycle animation
      const runIndex = Math.floor(Math.abs(runCycle * 1.6)) % 6;
      const frameW = 256;
      ctx.drawImage(charInkSageRun, runIndex * frameW, 0, frameW, 256, drawX, drawY, drawW, drawH);
    } else if (charInkSageIdle.complete && charInkSageIdle.naturalWidth > 0) {
      // 4 Idle frames: gentle breathing animation
      const idleIndex = Math.floor((Date.now() * 0.003)) % 4;
      const frameW = 256;
      ctx.drawImage(charInkSageIdle, idleIndex * frameW, 0, frameW, 256, drawX, drawY, drawW, drawH);
    } else if (charInkSageIcon.complete && charInkSageIcon.naturalWidth > 0) {
      ctx.drawImage(charInkSageIcon, drawX, drawY, drawW, drawH);
    }

    // Calligraphy Ink Particles trailing behind
    if (typeof game !== 'undefined' && game.particles && (Math.abs(vx) > 1.2 || isAirborne)) {
      if (Math.random() < 0.22) {
        game.particles.push(
          new Particle(
            (player ? player.x + player.width/2 : 0) + (Math.random() - 0.5) * 12,
            (player ? player.y + player.height - 4 : 0),
            Math.random() < 0.5 ? 'rgba(15, 23, 42, 0.45)' : 'rgba(56, 189, 248, 0.5)',
            (Math.random() - 0.5) * 2,
            -Math.random() * 2,
            2 + Math.random() * 3,
            0.4
          )
        );
      }
    }
  }

  ctx.restore();
}


function drawCharacterOnCanvas(canvasId, charId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.save();
  const size = 25; // fixed size for character preview
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 10; // offset down a bit for headband space
  
  ctx.translate(cx, cy);
  
  // Call the shared model drawing helper (no velocity/squash for preview)
  drawCharacterModel(ctx, charId, size, false, 0, 0, 1, 1);
  
  ctx.restore();
}

function drawAllCharacterPreviews() {
  for (let i = 1; i <= 6; i++) {
    drawCharacterOnCanvas(`char-canvas-${i}`, i);
  }
}

// Init buttons
document.getElementById('btn-start').addEventListener('click', () => {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('level-select-screen').classList.remove('hidden');
});

// --- RUNNER MODE INITIALIZATION & CONTROLS ---
function startRunnerMode() {
  window.currentMode = 'runner';
  game.state = 'RUNNER';
  document.getElementById('main-menu').classList.add('hidden');

  // Hide tower climb HUD & mobile controls if visible
  const climbHud = document.querySelector('.hud-container');
  if (climbHud) climbHud.classList.add('hidden');
  const climbMobile = document.querySelector('.mobile-controls-container');
  if (climbMobile) climbMobile.classList.add('hidden');

  resizeCanvas();

  if (!runnerEngine) {
    runnerEngine = new RunnerEngine(canvas, ctx, exitRunnerMode);
  }
  runnerEngine.start();
}

function exitRunnerMode() {
  if (runnerEngine) {
    runnerEngine.stop();
  }
  window.currentMode = 'climb';
  game.state = 'MENU';

  // Ensure runner HUD and runner mobile controls are completely hidden
  const runnerHud = document.getElementById('runner-hud');
  if (runnerHud) runnerHud.classList.add('hidden');
  const runnerMobile = document.getElementById('runner-mobile-controls');
  if (runnerMobile) runnerMobile.classList.add('hidden');
  const runnerGameOver = document.getElementById('runner-game-over');
  if (runnerGameOver) runnerGameOver.classList.add('hidden');
  const runnerPause = document.getElementById('runner-pause-overlay');
  if (runnerPause) runnerPause.classList.add('hidden');

  resizeCanvas();
  document.getElementById('main-menu').classList.remove('hidden');

  // Keep climb HUD and mobile controls hidden while on main menu
  const climbHud = document.querySelector('.hud-container');
  if (climbHud) climbHud.classList.add('hidden');
  const climbMobile = document.querySelector('.mobile-controls-container');
  if (climbMobile) climbMobile.classList.add('hidden');
}

const btnStartRunner = document.getElementById('btn-start-runner');
if (btnStartRunner) {
  btnStartRunner.addEventListener('click', startRunnerMode);
}

const btnRunnerRestart = document.getElementById('btn-runner-restart');
if (btnRunnerRestart) {
  btnRunnerRestart.addEventListener('click', () => {
    if (runnerEngine) runnerEngine.start();
  });
}

const btnRunnerMenu = document.getElementById('btn-runner-menu');
if (btnRunnerMenu) {
  btnRunnerMenu.addEventListener('click', exitRunnerMode);
}

const btnRunnerPause = document.getElementById('btn-runner-pause');
if (btnRunnerPause) {
  btnRunnerPause.addEventListener('click', () => {
    if (runnerEngine) runnerEngine.togglePause();
  });
}

const btnRunnerExit = document.getElementById('btn-runner-exit');
if (btnRunnerExit) {
  btnRunnerExit.addEventListener('click', exitRunnerMode);
}

const btnRunnerResume = document.getElementById('btn-runner-resume');
if (btnRunnerResume) {
  btnRunnerResume.addEventListener('click', () => {
    if (runnerEngine) runnerEngine.togglePause();
  });
}

const btnRunnerQuit = document.getElementById('btn-runner-quit');
if (btnRunnerQuit) {
  btnRunnerQuit.addEventListener('click', () => {
    if (runnerEngine) runnerEngine.togglePause();
    exitRunnerMode();
  });
}

// --- JADE ARENA MODE INITIALIZATION & CONTROLS ---
let arenaSettings = {
  gameMode: 'battle', // 'battle' | 'adventure'
  playerCount: 2,
  botCount: 1,
  duration: 60,
  topic: 'hsk1_4',
  botDifficulty: 'hard',
  playerAssignments: []
};

const ARENA_SLOT_DEFS = [
  { id: 0, title: 'ผู้เล่น 1 (สีแดง P1)', color: '#ef4444', defaultChar: 4 },
  { id: 1, title: 'ผู้เล่น 2 (สีน้ำเงิน P2)', color: '#3b82f6', defaultChar: 5 },
  { id: 2, title: 'ผู้เล่น 3 (สีเหลือง P3)', color: '#eab308', defaultChar: 3 },
  { id: 3, title: 'ผู้เล่น 4 (สีเขียว P4)', color: '#22c55e', defaultChar: 6 }
];

function renderArenaRosterUI() {
  const container = document.getElementById('arena-roster-container');
  if (!container) return;

  const isAdventure = arenaSettings.gameMode === 'adventure';
  const totalSlots = isAdventure ? 1 : arenaSettings.playerCount;
  const humanCount = isAdventure ? 1 : (arenaSettings.playerCount - arenaSettings.botCount);
  const profiles = profileManager.getProfilesIndex();
  const activeProf = profileManager.getActiveProfile();

  if (!Array.isArray(arenaSettings.playerAssignments)) {
    arenaSettings.playerAssignments = [];
  }

  // Ensure assignments array is populated for each slot
  for (let i = 0; i < totalSlots; i++) {
    const isHuman = i < humanCount;
    const slotDef = ARENA_SLOT_DEFS[i] || ARENA_SLOT_DEFS[0];

    if (isHuman) {
      if (!arenaSettings.playerAssignments[i] || arenaSettings.playerAssignments[i].isBot) {
        let assignedId = null;
        let assignedName = `ผู้เล่น ${i + 1}`;
        let assignedAvatar = '👤';
        let defaultCharId = slotDef.defaultChar;

        if (i === 0) {
          assignedId = activeProf?.userId || (profiles[0] && profiles[0].id) || null;
          assignedName = activeProf?.name || (profiles[0] && profiles[0].name) || 'ผู้เล่น 1';
          assignedAvatar = activeProf?.avatar || (profiles[0] && profiles[0].avatar) || '🐼';
          defaultCharId = activeProf?.selectedCharacter || 4;
        } else {
          const cand = profiles[i];
          if (cand) {
            assignedId = cand.id;
            assignedName = cand.name;
            assignedAvatar = cand.avatar;
          }
        }

        const charObj = ARENA_CHARACTERS.find(c => c.id === defaultCharId) || ARENA_CHARACTERS[0];
        arenaSettings.playerAssignments[i] = {
          slot: i,
          isBot: false,
          userId: assignedId,
          userName: assignedName,
          userAvatar: assignedAvatar,
          charId: charObj.id,
          charName: charObj.name,
          charIcon: charObj.emoji
        };
      }
    } else {
      // Bot Slot
      const botNames = ['บอทมังกรฟ้า (Bot Blue)', 'บอทพยัคฆ์ทอง (Bot Yellow)', 'บอทหยกมงคล (Bot Green)'];
      const botEmojis = ['🐒', '🐢', '🖌️'];
      const botIdx = Math.max(0, i - humanCount);
      const botName = botNames[botIdx] || `บอท ${slotDef.title}`;
      const botEmoji = botEmojis[botIdx % botEmojis.length] || '🤖';
      const charObj = ARENA_CHARACTERS.find(c => c.id === slotDef.defaultChar) || ARENA_CHARACTERS[0];

      arenaSettings.playerAssignments[i] = {
        slot: i,
        isBot: true,
        userId: null,
        userName: botName,
        userAvatar: '🤖',
        charId: charObj.id,
        charName: charObj.name,
        charIcon: botEmoji
      };
    }
  }

  // Render cards
  let html = '';
  for (let i = 0; i < totalSlots; i++) {
    const isHuman = i < humanCount;
    const slotDef = ARENA_SLOT_DEFS[i] || ARENA_SLOT_DEFS[0];
    const assign = arenaSettings.playerAssignments[i];

    if (isHuman) {
      const currentUserId = assign.userId || 'guest';
      const currentCharId = assign.charId || slotDef.defaultChar;

      // Profile options
      const profileOptions = profiles.map(p => {
        const isSel = p.id === currentUserId ? 'selected' : '';
        const tag = p.authType === 'google' ? 'Google' : 'นักเรียน';
        return `<option value="${p.id}" ${isSel}>${p.avatar || '🐼'} ${p.name} (${tag})</option>`;
      }).join('');

      // Character options
      const charOptions = ARENA_CHARACTERS.map(c => {
        const isSel = c.id === currentCharId ? 'selected' : '';
        return `<option value="${c.id}" ${isSel}>${c.emoji} ${c.name}</option>`;
      }).join('');

      html += `
        <div class="arena-player-card p${i + 1}-card">
          <div class="arena-player-card-header">
            <span style="color: ${slotDef.color};">${slotDef.title}</span>
            <span style="font-size: 0.76rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 6px; font-weight: 700;">🎮 ผู้เล่น</span>
          </div>

          <div class="arena-field-row">
            <label class="arena-field-label">👤 บัญชีเซฟ (Save Profile):</label>
            <select class="arena-select-input arena-player-user-select" data-slot="${i}">
              ${profileOptions}
              <option value="guest" ${currentUserId === 'guest' ? 'selected' : ''}>👤 ผู้เล่นทั่วไป (Guest / ไม่บันทึกคะแนน)</option>
              <option value="create_new">➕ เพิ่มนักเรียนใหม่...</option>
            </select>
          </div>

          <div class="arena-field-row">
            <label class="arena-field-label">🥋 ตัวละคร (Character):</label>
            <select class="arena-select-input arena-player-char-select" data-slot="${i}">
              ${charOptions}
            </select>
          </div>
        </div>
      `;
    } else {
      // Bot Card
      const botProfile = BOT_DIFFICULTY_PROFILES[arenaSettings.botDifficulty] || { name: 'ยาก' };
      html += `
        <div class="arena-player-card p${i + 1}-card" style="background: #f8fafc; border-style: dashed;">
          <div class="arena-player-card-header">
            <span style="color: ${slotDef.color};">${slotDef.title}</span>
            <span class="arena-bot-badge">🤖 บอท AI</span>
          </div>

          <div class="arena-field-row">
            <label class="arena-field-label">ตัวละครบอท:</label>
            <div style="font-size: 0.92rem; font-weight: 700; color: #475569; padding: 4px 0;">
              ${assign.charIcon} ${assign.userName}
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">ระดับ: <strong>${botProfile.name}</strong></div>
          </div>
        </div>
      `;
    }
  }

  container.innerHTML = html;

  // Bind change handlers
  container.querySelectorAll('.arena-player-user-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const slot = parseInt(sel.getAttribute('data-slot'));
      const val = sel.value;

      if (val === 'create_new') {
        const newName = prompt('กรุณากรอกชื่อนักเรียนใหม่สำหรับบันทึกคะแนน:');
        if (newName && newName.trim()) {
          const emojis = ['🐼', '🐒', '🐢', '🐯', '🐉', '🦊', '🐰', '🦁', '🦉', '🦄'];
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          const newProfile = profileManager.createStudentProfile(newName.trim(), randomEmoji, false);
          if (newProfile) {
            arenaSettings.playerAssignments[slot] = {
              ...arenaSettings.playerAssignments[slot],
              userId: newProfile.userId,
              userName: newProfile.name,
              userAvatar: newProfile.avatar
            };
          }
        }
        renderArenaRosterUI();
        return;
      }

      if (val === 'guest') {
        arenaSettings.playerAssignments[slot] = {
          ...arenaSettings.playerAssignments[slot],
          userId: null,
          userName: `ผู้เล่น ${slot + 1}`,
          userAvatar: '👤'
        };
      } else {
        const profs = profileManager.getProfilesIndex();
        const found = profs.find(p => p.id === val);
        if (found) {
          arenaSettings.playerAssignments[slot] = {
            ...arenaSettings.playerAssignments[slot],
            userId: found.id,
            userName: found.name,
            userAvatar: found.avatar
          };
        }
      }
    });
  });

  container.querySelectorAll('.arena-player-char-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const slot = parseInt(sel.getAttribute('data-slot'));
      const charId = parseInt(sel.value);
      const charObj = ARENA_CHARACTERS.find(c => c.id === charId);
      if (charObj) {
        arenaSettings.playerAssignments[slot] = {
          ...arenaSettings.playerAssignments[slot],
          charId: charObj.id,
          charName: charObj.name,
          charIcon: charObj.emoji
        };
      }
    });
  });
}

function updateArenaLobbyUI() {
  const isAdventure = arenaSettings.gameMode === 'adventure';
  const playersGroup = document.getElementById('arena-players-group');
  const botGroup = document.getElementById('arena-bot-difficulty-group');
  const durationGroup = document.getElementById('arena-duration-group');
  const rosterLabel = document.querySelector('#arena-roster-group .arena-setting-label');
  const descEl = document.getElementById('arena-gamemode-desc');

  if (playersGroup) playersGroup.style.display = isAdventure ? 'none' : 'block';
  if (durationGroup) durationGroup.style.display = isAdventure ? 'none' : 'block';
  if (botGroup) {
    botGroup.style.display = (!isAdventure && arenaSettings.botCount > 0) ? 'block' : 'none';
  }

  if (rosterLabel) {
    rosterLabel.textContent = isAdventure 
      ? '👤 เลือกตัวละครและบัญชีผู้เล่น (Player & Character):'
      : '👥 เลือกผู้เล่นและตัวละคร (Assign Players & Characters):';
  }

  if (descEl) {
    if (isAdventure) {
      descEl.innerHTML = '🗺️ <strong>ผจญภัยตะลุยด่าน:</strong> วิ่งตอบ 5 แท่นตัวเลือกทีละด่านย่อยให้ครบทุกคำในหมวด! ⚠️ <em>หากตอบผิด จะเริ่มใหม่ที่ด่านย่อยที่ 1 ทันที</em>';
      descEl.style.borderColor = '#f59e0b';
      descEl.style.background = '#fef3c7';
      descEl.style.color = '#92400e';
    } else {
      descEl.innerHTML = '⚔️ <strong>ประลองยึดแท่น:</strong> แข่งขันยึดแท่นสีและชิงคะแนนกับผู้เล่นหรือบอทในสังเวียน';
      descEl.style.borderColor = '#e2e8f0';
      descEl.style.background = 'rgba(255,255,255,0.7)';
      descEl.style.color = '#475569';
    }
  }

  renderArenaRosterUI();
}

function openArenaLobby() {
  updateArenaLobbyUI();
  document.getElementById('arena-lobby-modal').classList.remove('hidden');
}

function closeArenaLobby() {
  document.getElementById('arena-lobby-modal').classList.add('hidden');
}

function startArenaMode() {
  window.currentMode = 'arena';
  game.state = 'ARENA';

  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('arena-lobby-modal').classList.add('hidden');
  document.getElementById('arena-game-over-modal').classList.add('hidden');
  document.getElementById('arena-hud-bar').classList.remove('hidden');

  // Hide climb HUD & mobile controls if visible
  const climbHud = document.querySelector('.hud-container');
  if (climbHud) climbHud.classList.add('hidden');
  const climbMobile = document.querySelector('.mobile-controls-container');
  if (climbMobile) climbMobile.classList.add('hidden');

  resizeCanvas();

  if (!arenaEngine) {
    arenaEngine = new ArenaEngine(canvas, ctx, exitArenaMode);
  }
  arenaEngine.config = {
    ...arenaEngine.config,
    ...arenaSettings,
    playerAssignments: arenaSettings.playerAssignments,
    gameMode: arenaSettings.gameMode || 'battle'
  };
  arenaEngine.start();
}

function exitArenaMode() {
  if (arenaEngine) {
    arenaEngine.stop();
  }
  window.currentMode = 'climb';
  game.state = 'MENU';

  const arenaHud = document.getElementById('arena-hud-bar');
  if (arenaHud) arenaHud.classList.add('hidden');
  const arenaLobby = document.getElementById('arena-lobby-modal');
  if (arenaLobby) arenaLobby.classList.add('hidden');
  const arenaGameOver = document.getElementById('arena-game-over-modal');
  if (arenaGameOver) arenaGameOver.classList.add('hidden');

  resizeCanvas();
  document.getElementById('main-menu').classList.remove('hidden');

  // Keep climb HUD and mobile controls hidden while on main menu
  const climbHud = document.querySelector('.hud-container');
  if (climbHud) climbHud.classList.add('hidden');
  const climbMobile = document.querySelector('.mobile-controls-container');
  if (climbMobile) climbMobile.classList.add('hidden');
}

// Arena Button Event Listeners
const btnStartArena = document.getElementById('btn-start-arena');
if (btnStartArena) {
  btnStartArena.addEventListener('click', openArenaLobby);
}

const btnArenaCancel = document.getElementById('btn-arena-cancel');
if (btnArenaCancel) {
  btnArenaCancel.addEventListener('click', closeArenaLobby);
}

const btnArenaLaunch = document.getElementById('btn-arena-launch');
if (btnArenaLaunch) {
  btnArenaLaunch.addEventListener('click', startArenaMode);
}

const btnArenaExitQuick = document.getElementById('btn-arena-exit-quick');
if (btnArenaExitQuick) {
  btnArenaExitQuick.addEventListener('click', exitArenaMode);
}

const btnArenaPlayAgain = document.getElementById('btn-arena-play-again');
if (btnArenaPlayAgain) {
  btnArenaPlayAgain.addEventListener('click', startArenaMode);
}

const btnArenaChangeSettings = document.getElementById('btn-arena-change-settings');
if (btnArenaChangeSettings) {
  btnArenaChangeSettings.addEventListener('click', () => {
    exitArenaMode();
    openArenaLobby();
  });
}

const btnArenaToMenu = document.getElementById('btn-arena-to-menu');
if (btnArenaToMenu) {
  btnArenaToMenu.addEventListener('click', exitArenaMode);
}

// Arena Lobby Options Toggles
document.querySelectorAll('#arena-gamemode-options .arena-opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#arena-gamemode-options .arena-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    arenaSettings.gameMode = btn.getAttribute('data-mode') || 'battle';
    updateArenaLobbyUI();
  });
});

document.querySelectorAll('#arena-players-options .arena-opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#arena-players-options .arena-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    arenaSettings.playerCount = parseInt(btn.getAttribute('data-players'));
    arenaSettings.botCount = parseInt(btn.getAttribute('data-bots'));
    const botGroup = document.getElementById('arena-bot-difficulty-group');
    if (botGroup) {
      botGroup.style.display = arenaSettings.botCount > 0 ? 'block' : 'none';
    }
    renderArenaRosterUI();
  });
});

document.querySelectorAll('#arena-bot-difficulty-options .arena-opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#arena-bot-difficulty-options .arena-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    arenaSettings.botDifficulty = btn.getAttribute('data-bot-difficulty') || 'hard';
    renderArenaRosterUI();
  });
});

document.querySelectorAll('#arena-topic-options .arena-topic-btn, #arena-topic-options .arena-opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#arena-topic-options .arena-topic-btn, #arena-topic-options .arena-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    arenaSettings.topic = btn.getAttribute('data-topic');
  });
});

document.querySelectorAll('#arena-duration-options .arena-opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#arena-duration-options .arena-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const durVal = btn.getAttribute('data-duration');
    arenaSettings.duration = durVal === 'endless' ? 'endless' : parseInt(durVal);
  });
});

// Level Selection Back Buttons
function returnToMainMenuFromLevelSelect() {
  document.getElementById('level-select-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

const btnLevelSelectBack = document.getElementById('btn-level-select-back');
const btnLevelSelectBackBottom = document.getElementById('btn-level-select-back-bottom');
if (btnLevelSelectBack) btnLevelSelectBack.addEventListener('click', returnToMainMenuFromLevelSelect);
if (btnLevelSelectBackBottom) btnLevelSelectBackBottom.addEventListener('click', returnToMainMenuFromLevelSelect);

// Character Selection Back Buttons
function returnToLevelSelectFromCharSelect() {
  document.getElementById('char-select-screen').classList.add('hidden');
  document.getElementById('level-select-screen').classList.remove('hidden');
}

const btnCharSelectBack = document.getElementById('btn-char-select-back');
const btnCharSelectBackBottom = document.getElementById('btn-char-select-back-bottom');
if (btnCharSelectBack) btnCharSelectBack.addEventListener('click', returnToLevelSelectFromCharSelect);
if (btnCharSelectBackBottom) btnCharSelectBackBottom.addEventListener('click', returnToLevelSelectFromCharSelect);

// Level Selection Setup
document.querySelectorAll('.btn-select-level').forEach(btn => {
  btn.addEventListener('click', () => {
    const level = parseInt(btn.getAttribute('data-level'));
    game.pendingLevel = level;
    document.getElementById('level-select-screen').classList.add('hidden');
    document.getElementById('char-select-screen').classList.remove('hidden');
    drawAllCharacterPreviews();
  });
});

// Character Selection Setup
document.querySelectorAll('.btn-select-char').forEach(btn => {
  btn.addEventListener('click', () => {
    const charId = parseInt(btn.getAttribute('data-char'));
    game.selectedCharacter = charId;
    
    document.getElementById('char-select-screen').classList.add('hidden');
    startGame();
  });
});

document.getElementById('btn-restart').addEventListener('click', restartGame);
document.getElementById('btn-next-level').addEventListener('click', startNextLevel);

document.getElementById('btn-game-over-restart').addEventListener('click', () => {
  document.getElementById('game-over-screen').classList.add('hidden');
  document.getElementById('level-select-screen').classList.remove('hidden');
});

// --- MODE 4: TAOIST SANCTUARY INITIALIZATION & CONTROLS ---
function startSanctuaryMode() {
  window.currentMode = 'sanctuary';
  game.state = 'SANCTUARY';
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('sanctuary-screen').classList.remove('hidden');

  // Hide tower climb HUD & mobile controls if visible
  const climbHud = document.querySelector('.hud-container');
  if (climbHud) climbHud.classList.add('hidden');
  const climbMobile = document.querySelector('.mobile-controls-container');
  if (climbMobile) climbMobile.classList.add('hidden');

  sanctuaryManager.init(exitSanctuaryMode);
}

function exitSanctuaryMode() {
  sanctuaryManager.destroy();
  document.getElementById('sanctuary-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
  window.currentMode = 'climb';
  game.state = 'MENU';
  resizeCanvas();
}

const btnStartSanctuary = document.getElementById('btn-start-sanctuary');
if (btnStartSanctuary) {
  btnStartSanctuary.addEventListener('click', startSanctuaryMode);
}

const btnSanctuaryBack = document.getElementById('btn-sanctuary-back');
if (btnSanctuaryBack) {
  btnSanctuaryBack.addEventListener('click', exitSanctuaryMode);
}

// Deep linking to modes via URL hash
window.addEventListener('load', () => {
  if (location.hash === '#sanctuary') {
    setTimeout(() => {
      startSanctuaryMode();
    }, 200);
  }
});

// --- PROFILE MANAGER & GOOGLE SIGN-IN UI CONTROLLER ---
let selectedNewStudentAvatar = '🐼';

function updateProfileUI(profile) {
  if (!profile) return;

  // 1. Top bar display
  const avatarEl = document.getElementById('user-avatar-display');
  const nameEl = document.getElementById('user-name-display');
  const typeEl = document.getElementById('user-type-display');
  const jadeEl = document.getElementById('user-jade-display');

  if (avatarEl) {
    if (profile.avatar && (profile.avatar.startsWith('http://') || profile.avatar.startsWith('https://') || profile.avatar.startsWith('data:'))) {
      avatarEl.innerHTML = `<img src="${profile.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarEl.innerHTML = `<span class="avatar-emoji">${profile.avatar || '🐼'}</span>`;
    }
  }

  if (nameEl) nameEl.textContent = profile.name || 'นักเรียนเซียน';
  if (typeEl) {
    typeEl.textContent = '🏫 นักเรียน';
    typeEl.className = 'user-type-tag type-student';
  }
  if (jadeEl) jadeEl.textContent = profile.jade || 0;

  // 2. Profile modal current card
  const currentAvatarEl = document.getElementById('current-profile-avatar');
  const currentNameEl = document.getElementById('current-profile-name');
  const currentMetaEl = document.getElementById('current-profile-meta');

  if (currentAvatarEl) {
    if (profile.avatar && (profile.avatar.startsWith('http://') || profile.avatar.startsWith('https://') || profile.avatar.startsWith('data:'))) {
      currentAvatarEl.innerHTML = `<img src="${profile.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      currentAvatarEl.innerHTML = `<span class="avatar-emoji">${profile.avatar || '🐼'}</span>`;
    }
  }

  if (currentNameEl) currentNameEl.textContent = profile.name || 'นักเรียนเซียน';
  if (currentMetaEl) {
    currentMetaEl.textContent = `โปรไฟล์ห้องเรียน • หยกสะสม ${profile.jade || 0} 🟢`;
  }

  // 4. Sanctuary header jade
  const sanctuaryJadeEl = document.getElementById('sanctuary-jade-display');
  if (sanctuaryJadeEl) sanctuaryJadeEl.textContent = profile.jade || 0;

  // 5. Sync to game state if in menu
  if (game.state === 'MENU') {
    game.jadeCount = profile.jade || 0;
    if (profile.upgrades) {
      game.upgrades = { ...profile.upgrades };
    }
  }

  // 6. Refresh modal profile list
  renderProfilesModalList();
}

function renderProfilesModalList() {
  const container = document.getElementById('profiles-list-container');
  if (!container) return;

  const profiles = profileManager.getProfilesIndex();
  const activeProfile = profileManager.getActiveProfile();
  const activeId = activeProfile ? activeProfile.userId : null;

  if (profiles.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8; font-size:0.85rem; padding:10px;">ยังไม่มีโปรไฟล์นักเรียน</div>';
    return;
  }

  container.innerHTML = profiles.map(p => {
    const isActive = p.id === activeId;
    const isGoogle = p.authType === 'google';
    const isImage = p.avatar && (p.avatar.startsWith('http://') || p.avatar.startsWith('https://') || p.avatar.startsWith('data:'));
    const avatarHtml = isImage
      ? `<img src="${p.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
      : `<span style="font-size:1.6rem;">${p.avatar || '🐼'}</span>`;

    const rawName = p.name || 'นักเรียน';
    const escapedName = rawName.replace(/"/g, '&quot;');
    const avatarVal = p.avatar || '🐼';

    return `
      <div class="profile-item-card ${isActive ? 'active-profile' : ''}">
        <div class="profile-item-avatar">${avatarHtml}</div>
        <div class="profile-item-info">
          <div class="profile-item-name">${escapedName}</div>
          <div class="profile-item-tag">🏫 นักเรียนห้องเรียน</div>
        </div>
        <div class="profile-item-actions">
          <button class="btn-item-edit" data-user-id="${p.id}" data-user-name="${escapedName}" data-user-avatar="${avatarVal}" title="แก้ไขชื่อและรูปประจำตัว">✏️</button>
          ${isActive 
            ? `<span class="profile-active-badge">✓ กำลังใช้</span>`
            : `<button class="btn-item-switch" data-user-id="${p.id}">สลับใช้ ➔</button>`
          }
          ${(!isActive && profiles.length > 1) 
            ? `<button class="btn-item-delete" data-user-id="${p.id}" title="ลบโปรไฟล์นี้">🗑️</button>`
            : ''
          }
        </div>
      </div>
    `;
  }).join('');

  // Wire up edit buttons
  container.querySelectorAll('.btn-item-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-user-id');
      const name = btn.getAttribute('data-user-name');
      const avatar = btn.getAttribute('data-user-avatar');
      if (uid) {
        openEditProfileModal(uid, name, avatar);
      }
    });
  });

  // Wire up switch buttons
  container.querySelectorAll('.btn-item-switch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-user-id');
      if (uid) {
        profileManager.switchProfile(uid);
      }
    });
  });

  // Wire up delete buttons
  container.querySelectorAll('.btn-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-user-id');
      if (uid && confirm('ต้องการลบโปรไฟล์นี้ออกจากเครื่องใช่หรือไม่?')) {
        profileManager.deleteProfile(uid);
      }
    });
  });
}

function renderAvatarSelectOptions() {
  const container = document.getElementById('avatar-select-options');
  if (!container) return;

  container.innerHTML = DEFAULT_AVATARS.map((av) => `
    <button type="button" class="avatar-opt-btn ${av.emoji === selectedNewStudentAvatar ? 'selected' : ''}" data-emoji="${av.emoji}" title="${av.name}">
      <span style="font-size: 1.5rem;">${av.emoji}</span>
      <span style="font-size: 0.75rem; color: #475569; font-weight: 700;">${av.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.avatar-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      container.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedNewStudentAvatar = btn.getAttribute('data-emoji') || '🐼';
    });
  });
}

// --- EDIT PROFILE MODAL STATE & HANDLERS ---
let editingTargetUserId = null;
let selectedEditAvatar = '🐼';

function openEditProfileModal(userId, currentName, currentAvatar) {
  const modal = document.getElementById('edit-profile-modal');
  const inputTargetId = document.getElementById('input-edit-target-id');
  const inputName = document.getElementById('input-edit-profile-name');
  const previewSpan = document.getElementById('edit-avatar-current-preview');

  if (!modal || !inputName) return;

  editingTargetUserId = userId;
  selectedEditAvatar = currentAvatar || '🐼';

  if (inputTargetId) inputTargetId.value = userId;
  inputName.value = currentName || '';
  if (previewSpan) previewSpan.textContent = `รูปที่เลือก: ${selectedEditAvatar}`;

  renderEditAvatarSelectOptions();
  modal.classList.remove('hidden');
  setTimeout(() => inputName.focus(), 60);
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.add('hidden');
  editingTargetUserId = null;
}

function renderEditAvatarSelectOptions() {
  const container = document.getElementById('edit-avatar-select-options');
  if (!container) return;

  container.innerHTML = DEFAULT_AVATARS.map((av) => `
    <button type="button" class="avatar-opt-btn ${av.emoji === selectedEditAvatar ? 'selected' : ''}" data-emoji="${av.emoji}" title="${av.name}">
      <span style="font-size: 1.5rem;">${av.emoji}</span>
      <span style="font-size: 0.75rem; color: #475569; font-weight: 700;">${av.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.avatar-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      container.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEditAvatar = btn.getAttribute('data-emoji') || '🐼';
      const previewSpan = document.getElementById('edit-avatar-current-preview');
      if (previewSpan) previewSpan.textContent = `รูปที่เลือก: ${selectedEditAvatar}`;
    });
  });
}

function setupProfileModalListeners() {
  // Open / Close Profile modal
  const btnOpenProfile = document.getElementById('btn-open-profile');
  const btnCloseProfile = document.getElementById('btn-close-profile');
  const profileModal = document.getElementById('profile-modal');

  if (btnOpenProfile && profileModal) {
    btnOpenProfile.addEventListener('click', () => {
      profileModal.classList.remove('hidden');
      renderProfilesModalList();
      renderAvatarSelectOptions();
    });
  }

  if (btnCloseProfile && profileModal) {
    btnCloseProfile.addEventListener('click', () => {
      profileModal.classList.add('hidden');
    });
  }

  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        profileModal.classList.add('hidden');
      }
    });
  }

  // Edit Profile Triggers & Modal Listeners
  const btnEditCurrentProfile = document.getElementById('btn-edit-current-profile');
  if (btnEditCurrentProfile) {
    btnEditCurrentProfile.addEventListener('click', () => {
      const active = profileManager.getActiveProfile();
      if (active) {
        openEditProfileModal(active.userId, active.name, active.avatar);
      }
    });
  }

  const btnCloseEditProfile = document.getElementById('btn-close-edit-profile');
  const btnCancelEditProfile = document.getElementById('btn-cancel-edit-profile');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const btnConfirmEditProfile = document.getElementById('btn-confirm-edit-profile');
  const inputEditProfileName = document.getElementById('input-edit-profile-name');

  if (btnCloseEditProfile) btnCloseEditProfile.addEventListener('click', closeEditProfileModal);
  if (btnCancelEditProfile) btnCancelEditProfile.addEventListener('click', closeEditProfileModal);
  if (editProfileModal) {
    editProfileModal.addEventListener('click', (e) => {
      if (e.target === editProfileModal) closeEditProfileModal();
    });
  }

  const handleSaveProfileEdit = () => {
    if (!editingTargetUserId) return;
    const newName = inputEditProfileName ? inputEditProfileName.value.trim() : '';
    if (!newName) {
      alert('กรุณากรอกชื่อนักเรียนก่อนครับ');
      if (inputEditProfileName) inputEditProfileName.focus();
      return;
    }

    profileManager.updateProfileDetails(editingTargetUserId, {
      name: newName,
      avatar: selectedEditAvatar
    });

    closeEditProfileModal();
    renderProfilesModalList();
  };

  if (btnConfirmEditProfile) {
    btnConfirmEditProfile.addEventListener('click', handleSaveProfileEdit);
  }
  if (inputEditProfileName) {
    inputEditProfileName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveProfileEdit();
      }
    });
  }

  // Toggle Add Student Form
  const btnToggleAddStudent = document.getElementById('btn-toggle-add-student');
  const addStudentForm = document.getElementById('add-student-form');
  const btnCancelAddStudent = document.getElementById('btn-cancel-add-student');
  const btnConfirmAddStudent = document.getElementById('btn-confirm-add-student');
  const inputNewStudentName = document.getElementById('input-new-student-name');

  if (btnToggleAddStudent && addStudentForm) {
    btnToggleAddStudent.addEventListener('click', () => {
      addStudentForm.classList.toggle('hidden');
      if (!addStudentForm.classList.contains('hidden')) {
        renderAvatarSelectOptions();
        if (inputNewStudentName) inputNewStudentName.focus();
      }
    });
  }

  if (btnCancelAddStudent && addStudentForm) {
    btnCancelAddStudent.addEventListener('click', () => {
      addStudentForm.classList.add('hidden');
    });
  }

  if (btnConfirmAddStudent) {
    btnConfirmAddStudent.addEventListener('click', () => {
      const name = inputNewStudentName ? inputNewStudentName.value.trim() : '';
      if (!name) {
        alert('กรุณากรอกชื่อนักเรียนก่อนครับ');
        if (inputNewStudentName) inputNewStudentName.focus();
        return;
      }
      profileManager.createStudentProfile(name, selectedNewStudentAvatar);
      if (inputNewStudentName) inputNewStudentName.value = '';
      if (addStudentForm) addStudentForm.classList.add('hidden');
    });
  }

  // Backup & Restore Save File
  const btnExportSave = document.getElementById('btn-export-save');
  const btnImportSave = document.getElementById('btn-import-save');
  const fileImportSave = document.getElementById('file-import-save');

  if (btnExportSave) {
    btnExportSave.addEventListener('click', () => {
      profileManager.exportSaveData();
    });
  }

  if (btnImportSave && fileImportSave) {
    btnImportSave.addEventListener('click', () => {
      fileImportSave.value = '';
      fileImportSave.click();
    });

    fileImportSave.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (profileManager.importSaveData(text)) {
          alert('นำเข้าไฟล์บันทึกสำเร็จเรียบร้อยแล้ว! ข้อมูลหยกและด่านได้รับการอัปเดต');
        }
      };
      reader.readAsText(file);
    });
  }
}


// --- PARALLAX BACKGROUND RENDER ---
function drawParallaxBackgrounds() {
  const camY = camera.y;
  const lvl = game.currentLevel;

  if (lvl === 1) {
    // Level 1: Bamboo Valley (🎋)
    if (bgLoaded.bamboo) {
      const py = -camY * 0.2 % V_HEIGHT;
      ctx.drawImage(bgImages.bamboo, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.bamboo, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#101614');
      grad.addColorStop(1, '#1b2922');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 2) {
    // Level 2: Cloud Temple (☁️)
    if (bgLoaded.clouds) {
      const py = -camY * 0.15 % V_HEIGHT;
      ctx.drawImage(bgImages.clouds, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.clouds, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#36182c');
      grad.addColorStop(0.5, '#6a2a4b');
      grad.addColorStop(1, '#a85058');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 3) {
    // Level 3: Cosmic Tao (🌌)
    if (bgLoaded.cosmic) {
      const py = -camY * 0.08 % V_HEIGHT;
      ctx.drawImage(bgImages.cosmic, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.cosmic, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#040508');
      grad.addColorStop(0.7, '#0b0f19');
      grad.addColorStop(1, '#1b1424');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
      
      // Draw procedural fallback stars
      ctx.fillStyle = '#ffffff';
      const rand = new SeededRandom(999);
      for (let i = 0; i < 40; i++) {
        const starX = rand.nextRange(0, V_WIDTH);
        const starY = (rand.nextRange(0, V_HEIGHT) - camY * 0.1) % V_HEIGHT;
        const size = rand.nextRange(1, 2.5);
        ctx.beginPath();
        ctx.arc(starX, starY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (lvl === 4) {
    // Level 4: High Heavens (⚡)
    if (bgLoaded.heavens) {
      const py = -camY * 0.12 % V_HEIGHT;
      ctx.drawImage(bgImages.heavens, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.heavens, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#0f0c1b');
      grad.addColorStop(0.5, '#201a30');
      grad.addColorStop(1, '#2f2b5c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }

    // Dynamic lightning flashes on Level 4
    if (Math.random() < 0.008) {
      ctx.fillStyle = 'rgba(235, 245, 255, 0.4)';
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 10) {
    // Level 10: Worldwide Special (🌍)
    if (bgLoaded.worldwide) {
      const py = -camY * 0.12 % V_HEIGHT;
      ctx.drawImage(bgImages.worldwide, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.worldwide, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#0d1b2a');
      grad.addColorStop(0.5, '#1b263b');
      grad.addColorStop(1, '#415a77');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 11) {
    // Level 11: Electric Appliances Special (⚡🔌)
    if (bgLoaded.appliances) {
      const py = -camY * 0.12 % V_HEIGHT;
      ctx.drawImage(bgImages.appliances, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.appliances, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }

    // Dynamic Electric sparks & Cyber flashes on Level 11
    if (Math.random() < 0.012) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 5) {
    // Level 5: Infinite Summit (🐉)
    if (bgLoaded.summit) {
      const py = -camY * 0.1 % V_HEIGHT;
      ctx.drawImage(bgImages.summit, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.summit, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#2d1502');
      grad.addColorStop(0.5, '#5c3d0b');
      grad.addColorStop(1, '#b08a33');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 12) {
    // Level 12: Daily Life Special (🌅🏠)
    if (bgLoaded.dailylife) {
      const py = -camY * 0.1 % V_HEIGHT;
      ctx.drawImage(bgImages.dailylife, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.dailylife, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#fdf2f8');
      grad.addColorStop(0.4, '#fce7f3');
      grad.addColorStop(0.7, '#fbcfe8');
      grad.addColorStop(1, '#f9a8d4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 13) {
    // Level 13: Hobbies Special (🎨⚽🎮)
    if (bgLoaded.hobbies) {
      const py = -camY * 0.12 % V_HEIGHT;
      ctx.drawImage(bgImages.hobbies, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.hobbies, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.35, '#312e81');
      grad.addColorStop(0.7, '#4338ca');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 14 || lvl === 16) {
    // Level 14: HSK1 - บท 3 (📜👨‍🏫🇨🇳) & Level 16: HSK1 - บท 4 (👨‍👩‍👧🏠)
    if (bgLoaded.hsk1_3) {
      const py = -camY * 0.12 % V_HEIGHT;
      ctx.drawImage(bgImages.hsk1_3, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.hsk1_3, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#7f1d1d');
      grad.addColorStop(0.35, '#991b1b');
      grad.addColorStop(0.7, '#b45309');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  } else if (lvl === 15) {
    // Level 15: Special Objects (📱🪑💻)
    if (bgLoaded.special_items) {
      const py = -camY * 0.12 % V_HEIGHT;
      ctx.drawImage(bgImages.special_items, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.special_items, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#0c4a6e');
      grad.addColorStop(0.35, '#0369a1');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  }

  // --- 2.5D ATMOSPHERIC DEPTH & LIGHTING ---
  ctx.save();
  
  // 1. Subtle Volumetric Sunbeams / Heavenly Light Shafts
  const rayGrad = ctx.createLinearGradient(0, 0, V_WIDTH * 0.75, V_HEIGHT);
  if (lvl === 1 || lvl === 9 || lvl === 12 || lvl === 13 || lvl === 14 || lvl === 15 || lvl === 16) {
    // Warm verdant & creative sunrise beams
    rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.09)');
    rayGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.03)');
    rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else if (lvl === 3 || lvl === 4) {
    // Celestial cosmic / ethereal beams
    rayGrad.addColorStop(0, 'rgba(192, 132, 252, 0.08)');
    rayGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.03)');
    rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    // Temple & summit golden rays
    rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0.08)');
    rayGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.025)');
    rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = rayGrad;
  
  // Ray 1
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(240, 0);
  ctx.lineTo(440, V_HEIGHT);
  ctx.lineTo(130, V_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Ray 2
  ctx.beginPath();
  ctx.moveTo(330, 0);
  ctx.lineTo(520, 0);
  ctx.lineTo(760, V_HEIGHT);
  ctx.lineTo(470, V_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // 2. Bottom Atmospheric Depth Mist
  const mistGrad = ctx.createLinearGradient(0, V_HEIGHT - 130, 0, V_HEIGHT);
  mistGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
  mistGrad.addColorStop(1, 'rgba(15, 23, 42, 0.22)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, V_HEIGHT - 130, V_WIDTH, 130);

  ctx.restore();
}

// --- RENDER GAME SCENE ---
function render() {
  // Clear Virtual Canvas
  ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

  // 1. Draw Background Parallax
  drawParallaxBackgrounds();

  // Apply Camera Translation Offset to world coordinates
  ctx.save();
  ctx.translate(0, -camera.y);

  // 2. Draw Gong Checkpoints
  for (let cp of game.checkpoints) {
    // Only render if visible on screen to save draw calls
    if (cp.y + cp.height > camera.y && cp.y < camera.y + V_HEIGHT) {
      cp.draw(ctx);
    }
  }

  // 3. Draw Platforms
  for (let platform of game.platforms) {
    if (platform.y + platform.height > camera.y && platform.y < camera.y + V_HEIGHT) {
      platform.draw(ctx);
    }
  }

  // 4. Draw Collectibles
  for (let shard of game.shards) {
    if (shard.y + shard.height > camera.y && shard.y < camera.y + V_HEIGHT) {
      shard.draw(ctx);
    }
  }

  // 5. Draw Particles
  for (let particle of game.particles) {
    if (particle.y + 10 > camera.y && particle.y - 10 < camera.y + V_HEIGHT) {
      particle.draw(ctx);
    }
  }

  // 6. Draw Enemies
  if (game.enemies) {
    for (let enemy of game.enemies) {
      if (!enemy.alive && !enemy.dying) continue;
      if (enemy.y + enemy.height > camera.y && enemy.y < camera.y + V_HEIGHT) {
        enemy.draw(ctx);
      }
    }
  }

  // Draw Boss
  if (game.boss) {
    if ((game.boss.alive || game.boss.dying) && game.boss.y + game.boss.height > camera.y && game.boss.y < camera.y + V_HEIGHT) {
      game.boss.draw(ctx);
    }
  }

  // Draw Boss Projectiles
  if (game.bossProjectiles) {
    for (let bp of game.bossProjectiles) {
      if (bp.y + bp.height > camera.y && bp.y < camera.y + V_HEIGHT) {
        bp.draw(ctx);
      }
    }
  }

  // 6b. Draw Projectiles
  if (game.projectiles) {
    for (let proj of game.projectiles) {
      if (proj.y + proj.height > camera.y && proj.y < camera.y + V_HEIGHT) {
        proj.draw(ctx);
      }
    }
  }

  // 7. Draw Player Monk (blink when invincible)
  if (player.invincibleTimer <= 0 || Math.floor(player.invincibleTimer * 10) % 2 === 0) {
    player.draw(ctx);
  }

  // 8. Draw floating reward texts
  if (game.floatingTexts) {
    for (let ft of game.floatingTexts) {
      ft.draw(ctx);
    }
  }

  ctx.restore();
}

// --- CORE GAME LOOP ---
let lastTime = 0;
function gameLoop(timestamp) {
  if (window.currentMode === 'runner' || window.currentMode === 'arena') {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!lastTime) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Clamp dt to avoid massive physics jumps on lag spikes (e.g. backgrounding tab)
  if (dt > 0.1) dt = 0.1;

  if (game.state === 'PLAYING') {
    // Update game physics if shop is closed and question is not active
    if (!game.shopOpen && !game.isQuestionActive) {
      // 1. Player Physics & Input
      player.update(dt, keys);
      
      // 2. Platform Movements
      for (let platform of game.platforms) {
        platform.update(dt);
      }

      // 3. Collectibles float bobs
      for (let shard of game.shards) {
        if (!shard.collected) shard.update(dt);
      }

      // 4. Checkpoints glow pulsations
      for (let cp of game.checkpoints) {
        cp.update(dt);
      }

      // 4b. Update enemies
      if (game.enemies) {
        for (let enemy of game.enemies) {
          enemy.update(dt);
        }
      }

      // Update Boss
      if (game.boss) {
        game.boss.update(dt);
      }

      // Update Boss Projectiles
      if (game.bossProjectiles) {
        for (let i = game.bossProjectiles.length - 1; i >= 0; i--) {
          const bp = game.bossProjectiles[i];
          bp.update(dt);
          if (!bp.alive) {
            game.bossProjectiles.splice(i, 1);
          }
        }
      }

      // 4c. Update projectiles
      if (game.projectiles) {
        for (let i = game.projectiles.length - 1; i >= 0; i--) {
          const proj = game.projectiles[i];
          proj.update(dt);
          if (!proj.alive) {
            game.projectiles.splice(i, 1);
          }
        }
      }

      // 5. Collision checks
      handleCollisions(dt);

      // 5b. Player-enemy collision
      if (game.enemies) {
        checkEnemyCollisions(dt);
      }

      // 5c. Tick player invincibility
      if (player.invincibleTimer > 0) {
        player.invincibleTimer -= dt;
        if (player.invincibleTimer < 0) player.invincibleTimer = 0;
      }

      // 6. Check if player fell below starting area and update altitude height
      // If player falls below -120 (start ground platform top is -100), check they wrap or fall to bottom
      if (player.y > camera.y + V_HEIGHT || player.y > 100) {
        // Fell off bottom/viewport! Always lose 1 heart and restart stage
        triggerFallDamage(50); // Force 1 heart of damage (50m+)
        if (player.health > 0) {
          respawnAtCheckpoint();
        }
      }
      
      updateHUD();

      // Trigger Chinese Question Gate every 50m
      const targetMilestone = game.lastQuestionClearedHeight + 50;
      if (game.altitude >= targetMilestone) {
        triggerQuestion(targetMilestone);
      }
    }

    // 7. Update Particles (runs even when shop is open for visual feedback)
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i];
      p.update(dt);
      if (p.life <= 0) {
        game.particles.splice(i, 1);
      }
    }

    // 7b. Update floating texts
    if (game.floatingTexts) {
      for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
        game.floatingTexts[i].update(dt);
        if (game.floatingTexts[i].life <= 0) game.floatingTexts.splice(i, 1);
      }
    }

    // 8. Update Camera Smooth tracking (runs when shop is open too)
    camera.update(player.y, dt);

    // 9. Render everything onto virtual canvas
    render();
  }

  requestAnimationFrame(gameLoop);
}

// Canvas Sizing Layout Scaling
function resizeCanvas() {
  const container = document.querySelector('.canvas-container');
  if (!container) return;

  const isRunner = window.currentMode === 'runner';
  const isArena = window.currentMode === 'arena';
  const targetW = isRunner ? 1200 : (isArena ? 1200 : V_WIDTH);
  const targetH = isRunner ? 675 : (isArena ? 800 : V_HEIGHT);
  const aspectRatio = targetW / targetH;
  
  let w = container.clientWidth;
  let h = container.clientHeight;
  
  if (w / h > aspectRatio) {
    w = h * aspectRatio;
  } else {
    h = w / aspectRatio;
  }
  
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  
  // Keep internal standard resolution
  canvas.width = targetW;
  canvas.height = targetH;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Ambient Falling Cherry Blossom Petals Builder (pure CSS animation injections)
function spawnCherryBlossomPetals() {
  const container = document.getElementById('blossom-container');
  if (!container) return;

  const count = 35;
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    // Random sizes, delay, and positioning
    const size = 6 + Math.random() * 10;
    const left = Math.random() * 100;
    const dur = 6 + Math.random() * 10;
    const delay = Math.random() * -12; // Start immediately offset
    
    petal.style.width = size + 'px';
    petal.style.height = size * 1.3 + 'px';
    petal.style.left = left + '%';
    petal.style.animationDuration = dur + 's, ' + (3 + Math.random() * 3) + 's';
    petal.style.animationDelay = delay + 's, ' + delay + 's';
    
    // Vary tilt angle
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    container.appendChild(petal);
  }
}

// Boot up
window.game = game;
window.player = player;
window.camera = camera;
window.respawnAtCheckpoint = respawnAtCheckpoint;
window.drawCharacterModel = drawCharacterModel;
window.bgImages = bgImages;
window.bgLoaded = bgLoaded;

window.addEventListener('load', () => {
  const runnerHud = document.getElementById('runner-hud');
  if (runnerHud) runnerHud.classList.add('hidden');
  const runnerMobile = document.getElementById('runner-mobile-controls');
  if (runnerMobile) runnerMobile.classList.add('hidden');

  // Claybound tactile switch click sound for buttons and cards
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, .btn, .mode-card, .level-card, .char-card')) {
      if (window.audio && window.audio.playClick) {
        window.audio.playClick();
      }
    }
  });

  // Initialize Profile Manager & Sync State with Google and Classroom
  profileManager.onProfileChange(updateProfileUI);
  profileManager.init();
  setupProfileModalListeners();

  resizeCanvas();
  spawnCherryBlossomPetals();
  drawAllCharacterPreviews();
  requestAnimationFrame(gameLoop);
});
