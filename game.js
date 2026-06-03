/* ==========================================
   JADE ASCENT: CORE GAME PHYSICS & LOOP
   ========================================== */

// Virtual Game Constants
const V_WIDTH = 800;
const V_HEIGHT = 950;

const LEVELS_CONFIG = {
  1: { name: "ด่าน 1: หุบเขาไม้ไผ่ (Bamboo Valley)", heightMeters: 500, emoji: "🎋" },
  2: { name: "ด่าน 2: วิหารลอยฟ้า (Cloud Temple)", heightMeters: 1000, emoji: "☁️" },
  3: { name: "ด่าน 3: เต๋าแห่งจักรวาล (Cosmic Tao)", heightMeters: 1500, emoji: "🌌" },
  4: { name: "ด่าน 4: แดนสวรรค์เบื้องบน (High Heavens)", heightMeters: 2500, emoji: "⚡" },
  5: { name: "ด่าน 5: ยอดเขาไร้สิ้นสุด (Infinite Summit)", heightMeters: 5000, emoji: "🐉" }
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
  cosmic: new Image()
};
bgImages.bamboo.src = 'assets/bg_bamboo.png';
bgImages.clouds.src = 'assets/bg_clouds.png';
bgImages.cosmic.src = 'assets/bg_cosmic.png';

const bgLoaded = { bamboo: false, clouds: false, cosmic: false };
bgImages.bamboo.onload = () => bgLoaded.bamboo = true;
bgImages.clouds.onload = () => bgLoaded.clouds = true;
bgImages.cosmic.onload = () => bgLoaded.cosmic = true;

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
    this.type = type; // 'normal', 'moving', 'crumbly', 'bouncy', 'slippery'
    
    // Physics fields
    this.vx = 0;
    this.range = 0;
    this.originalX = x;
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.crumbleTimer = 0;
    this.crumbled = false;
    this.respawnTimer = 0;

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
  }

  draw(ctx) {
    if (this.type === 'crumbly' && this.crumbled) return;

    ctx.save();
    
    if (this.type === 'normal') {
      // Bamboo Log
      ctx.fillStyle = '#8c5a3c'; // Bamboo brown
      ctx.strokeStyle = '#4e3321';
      ctx.lineWidth = 3;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 6, true, true);
      // Segment lines
      ctx.strokeStyle = '#5a3d29';
      ctx.lineWidth = 2;
      for (let i = 25; i < this.width; i += 35) {
        ctx.beginPath();
        ctx.moveTo(this.x + i, this.y + 1);
        ctx.lineTo(this.x + i, this.y + this.height - 1);
        ctx.stroke();
      }
    } else if (this.type === 'moving') {
      // Red Imperial Platform
      ctx.fillStyle = '#c8102e'; // Crimson
      ctx.strokeStyle = '#ffd700'; // Gold border
      ctx.lineWidth = 3;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 8, true, true);
      
      // Gold highlights
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(this.x + 12, this.y + this.height - 4, 10, 4);
      ctx.fillRect(this.x + this.width - 22, this.y + this.height - 4, 10, 4);
    } else if (this.type === 'crumbly') {
      // Fluffy clouds
      let alpha = 0.8;
      if (this.crumbleTimer > 0) {
        alpha = Math.max(0.1, 0.8 * (1 - this.crumbleTimer / 0.4));
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(255, 183, 197, ${alpha})`;
      ctx.lineWidth = 2;
      
      // Cloud bubble drawing
      const r = this.height * 0.7;
      ctx.beginPath();
      ctx.arc(this.x + r, this.y + r - 3, r, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.arc(this.x + this.width / 3, this.y + r - 10, r + 4, 1 * Math.PI, 2 * Math.PI);
      ctx.arc(this.x + (this.width / 3) * 2, this.y + r - 10, r + 4, 1 * Math.PI, 2 * Math.PI);
      ctx.arc(this.x + this.width - r, this.y + r - 3, r, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'bouncy') {
      // Traditional Chinese Red Drum
      ctx.fillStyle = '#c8102e'; // Drum walls
      ctx.strokeStyle = '#a80017';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 4, true, true);

      // Drum surface
      ctx.fillStyle = '#ffd700'; // Golden skin
      ctx.strokeStyle = '#ccac00';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, this.x + 4, this.y, this.width - 8, this.height * 0.4, 2, true, true);

      // Drum studs
      ctx.fillStyle = '#ffffff';
      for (let i = 10; i < this.width; i += 20) {
        ctx.beginPath();
        ctx.arc(this.x + i, this.y + this.height * 0.75, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'slippery') {
      // Jade Ice
      ctx.fillStyle = 'rgba(0, 168, 107, 0.65)'; // Jade green transparency
      ctx.strokeStyle = '#ffd700'; // Gold frame
      ctx.lineWidth = 3;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 5, true, true);
      
      // Glimmer highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(this.x + 8, this.y + 4, this.width - 16, 2);
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
    
    // Smooth floating animation
    const yOffset = Math.sin(this.bobOffset) * 6;
    const drawY = this.y + yOffset;
    
    // Draw glowing halo
    const glowRad = 15 + Math.sin(this.bobOffset) * 3;
    const gradient = ctx.createRadialGradient(
      this.x + 9, drawY + 12, 1, 
      this.x + 9, drawY + 12, glowRad
    );
    gradient.addColorStop(0, 'rgba(18, 213, 138, 0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x + 9, drawY + 12, glowRad, 0, Math.PI * 2);
    ctx.fill();

    // Draw diamond jade shape
    ctx.fillStyle = '#12d58a';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x + 9, drawY); // Top
    ctx.lineTo(this.x + 18, drawY + 12); // Right
    ctx.moveTo(this.x + 18, drawY + 12);
    ctx.lineTo(this.x + 9, drawY + 24); // Bottom
    ctx.lineTo(this.x, drawY + 12); // Left
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

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
      float: 0
    };

    // Upgrade costs base and multipliers
    this.upgradeCosts = {
      jump: { base: 10, mult: 1.5, max: 5 },
      speed: { base: 15, mult: 1.5, max: 5 },
      doublejump: { base: 35, mult: 1.6, max: 5 },
      float: { base: 30, mult: 1.6, max: 5 }
    };
    
    this.platforms = [];
    this.shards = [];
    this.checkpoints = [];
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
    return Math.floor(config.base * Math.pow(config.mult, lvl));
  }

  buyUpgrade(type) {
    const cost = this.getCost(type);
    if (cost === 'MAX' || this.jadeCount < cost) return false;
    
    this.jadeCount -= cost;
    this.upgrades[type]++;
    
    updateHUD();
    updateShopUI();
    return true;
  }

  buyHeart() {
    const cost = 15;
    if (this.jadeCount < cost || player.health >= player.maxHealth) return false;
    
    this.jadeCount -= cost;
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
  facingLeft: false,
  squashX: 1,
  squashY: 1,
  runCycle: 0,
  
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
    // Character 3 (อายุยืน) starts with 10 max health, others have 5
    this.maxHealth = (game.selectedCharacter === 3) ? 10 : 5;
    this.health = this.maxHealth;
    this.highestY = -140;
    this.jumpCount = 0;
    // Character 1 (วายุ) gets 3 jumps, others have 2
    this.maxJumps = (game.selectedCharacter === 1) ? 3 : 2;
    this.doubleJumpCooldownTimer = 0;
    this.tripleJumpCooldownTimer = 0;
    this.squashX = 1;
    this.squashY = 1;
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
    // Each level increases jump power by 8%
    return this.baseJumpVel * (1 + game.upgrades.jump * 0.08);
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
      this.squashX = 0.7;
      this.squashY = 1.35;
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
    
    ctx.translate(cx, cy);
    
    // Draw the main character model using shared drawCharacterModel
    drawCharacterModel(ctx, game.selectedCharacter, size, this.facingLeft, this.runCycle, this.vx, this.squashX, this.squashY);
    
    // 12. Draw Jump Cooldown / Ready Ring
    if (game.selectedCharacter === 1) {
      const maxCd = this.getTripleJumpCooldownMax();
      if (this.tripleJumpCooldownTimer > 0) {
        const pct = this.tripleJumpCooldownTimer / maxCd; // 1 to 0
        
        ctx.save();
        ctx.strokeStyle = 'rgba(18, 213, 138, 0.2)'; // faint jade-green
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
        ctx.stroke();

        // Active fill arc (jade-green ring charging up to 100%)
        ctx.strokeStyle = '#12d58a'; // bright jade-green
        ctx.lineWidth = 4;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#12d58a';
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.35, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (1 - pct)));
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
        ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
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

// Generate complete mountain level
function generateLevel() {
  const levelData = LEVELS_CONFIG[game.currentLevel];
  PEAK_HEIGHT = levelData.heightMeters * 14.5;
  TOTAL_HEIGHT = PEAK_HEIGHT + 500;

  game.platforms = [];
  game.shards = [];
  game.checkpoints = [];

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

    // Generate x coordinate (ensure fits inside screen boundaries)
    const pX = rand.nextRange(25, V_WIDTH - pWidth - 25);
    
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

    // Spawn Gong Checkpoints every ~1000px vertically (~100m)
    // Ensure it falls on a Normal platform so it isn't moving/crumbly
    const nearCheckpointMilestone = Math.floor(relativeHeight / 1200) > Math.floor((relativeHeight - Math.abs(currentY - platform.y)) / 1200);
    if (nearCheckpointMilestone && pType === 'normal' && pWidth > 80) {
      const gongX = platform.x + platform.width / 2 - 30;
      const gongY = platform.y - 70;
      game.checkpoints.push(new Checkpoint(gongX, gongY));
    }

    // Step upwards
    const stepY = rand.nextRange(minGapY, maxGapY);
    currentY -= stepY;
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
          }
        }

        // Stick to moving platform horizontal speed
        if (platform.type === 'moving') {
          player.x += platform.vx * platform.direction * dt * 60;
        }
      }
    }
  }

  // Jade collect check
  for (let shard of game.shards) {
    if (!shard.collected && checkAABB(player, shard)) {
      shard.collected = true;
      game.jadeCount++;
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
    document.getElementById('game-over-level').innerText = `ด่าน ${game.currentLevel}`;
    
    const targetMeters = LEVELS_CONFIG[game.currentLevel].heightMeters;
    let realHeight = Math.floor(Math.abs(player.y) / 14.5);
    if (realHeight < 0) realHeight = 0;
    if (realHeight > targetMeters) realHeight = targetMeters;
    document.getElementById('game-over-height').innerText = `${realHeight}m / ${targetMeters}m`;
    
    // Show Game Over overlay
    document.getElementById('game-over-screen').classList.remove('hidden');
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
  game.currentLevel = 1;
  game.jadeCount = 0;
  game.altitude = 0;
  game.upgrades = { jump: 0, speed: 0, doublejump: 0, float: 0 };
  document.getElementById('level-clear-screen').classList.add('hidden');
  
  // Reset peak and total heights back to Level 1 values
  const levelData = LEVELS_CONFIG[1];
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
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('win-screen').classList.remove('hidden');
}

function handleLevelCleared() {
  audio.playGong();
  
  if (game.currentLevel === 5) {
    // Reached peak of Level 5! Player wins the entire game!
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
  1: [ // Level 1 (Very easy - numbers, basic nouns, hello, simple pronouns)
    { id: "1_1", q: "คำศัพท์ภาษาจีนคำว่า '日' (rì) แปลว่าอะไร?", o: ["พระอาทิตย์ (Sun)", "พระจันทร์ (Moon)", "ภูเขา (Mountain)", "แม่น้ำ (River)"], a: 0 },
    { id: "1_2", q: "ตัวอักษรจีนคำว่า '八' (bā) แทนจำนวนตัวเลขใด?", o: ["เลข 6", "เลข 7", "เลข 8", "เลข 9"], a: 2 },
    { id: "1_3", q: "คำว่า '五' (wǔ) ในภาษาจีนแทนตัวเลขใด?", o: ["เลข 3", "เลข 4", "เลข 5", "เลข 2"], a: 2 },
    { id: "1_4", q: "หากต้องการทักทายว่า 'สวัสดี' ในภาษาจีน ต้องพูดว่าอย่างไร?", o: ["谢谢 (xièxie)", "你好 (nǐ hǎo)", "再见 (zài jiàn)", "对不起 (duìbuqǐ)"], a: 1 },
    { id: "1_5", q: "คำศัพท์ภาษาจีนคำว่า '大' (dà) แปลว่าอะไร?", o: ["เล็ก (Small)", "ใหญ่ (Big)", "กลาง (Medium)", "มาก (Many)"], a: 1 },
    { id: "1_6", q: "คำศัพท์คำว่า '人' (rén) แปลว่าอะไร?", o: ["คน (Person)", "นก (Bird)", "หมา (Dog)", "แมว (Cat)"], a: 0 },
    { id: "1_7", q: "คำศัพท์คำว่า '口' (kǒu) แปลว่าอะไร?", o: ["ตา (Eye)", "หู (Ear)", "ปาก (Mouth)", "จมูก (Nose)"], a: 2 },
    { id: "1_8", q: "คำศัพท์ภาษาจีนคำว่า '月' (yuè) แปลว่าอะไร?", o: ["พระอาทิตย์ (Sun)", "พระจันทร์ (Moon)", "ก้อนเมฆ (Cloud)", "ดวงดาว (Star)"], a: 1 },
    { id: "1_9", q: "คำว่า '一' (yī) ในภาษาจีนแทนเลขใด?", o: ["เลข 1", "เลข 2", "เลข 3", "เลข 4"], a: 0 },
    { id: "1_10", q: "คำศัพท์คำว่า '山' (shān) แปลว่าอะไร?", o: ["ดิน (Soil)", "น้ำ (Water)", "ภูเขา (Mountain)", "ลม (Wind)"], a: 2 },
    { id: "1_11", q: "คำศัพท์ภาษาจีนคำว่า '你' (nǐ) แปลว่าอะไร?", o: ["ฉัน (I)", "คุณ/เธอ (You)", "เขา (He)", "มัน (It)"], a: 1 },
    { id: "1_12", q: "คำศัพท์ภาษาจีนคำว่า '我' (wǒ) แปลว่าอะไร?", o: ["คุณ (You)", "เขา (He)", "พวกเรา (We)", "ฉัน (I)"], a: 3 },
    { id: "1_13", q: "คำศัพท์ภาษาจีนคำว่า '他' (tā) แปลว่าอะไร?", o: ["เขา (ผู้หญิง)", "เขา (ผู้ชาย)", "มัน", "พวกเขา"], a: 1 },
    { id: "1_14", q: "คำศัพท์ภาษาจีนคำว่า '她' (tā) แปลว่าอะไร?", o: ["เขา (ผู้ชาย)", "เขา (ผู้หญิง)", "มัน", "คุณ"], a: 1 },
    { id: "1_15", q: "ตัวอักษรจีน 'มัน' (tā) ใช้แทนข้อใด?", o: ["สัตว์หรือสิ่งของ (It)", "คุณ (You)", "ฉัน (I)", "พระอาทิตย์"], a: 0 },
    { id: "1_16", q: "คำอักษรจีนคำว่า '二' (èr) แทนตัวเลขใด?", o: ["เลข 1", "เลข 2", "เลข 3", "เลข 4"], a: 1 },
    { id: "1_17", q: "คำอักษรจีนคำว่า '三' (sān) แทนตัวเลขใด?", o: ["เลข 2", "เลข 3", "เลข 4", "เลข 5"], a: 1 },
    { id: "1_18", q: "คำอักษรจีนคำว่า '四' (sì) แทนตัวเลขใด?", o: ["เลข 3", "เลข 4", "เลข 5", "เลข 6"], a: 1 },
    { id: "1_19", q: "คำอักษรจีนคำว่า '六' (liù) แทนตัวเลขใด?", o: ["เลข 5", "เลข 6", "เลข 7", "เลข 8"], a: 1 },
    { id: "1_20", q: "คำอักษรจีนคำว่า '七' (qī) แทนตัวเลขใด?", o: ["เลข 6", "เลข 7", "เลข 8", "เลข 9"], a: 1 },
    { id: "1_21", q: "คำอักษรจีนคำว่า '九' (jiǔ) แทนตัวเลขใด?", o: ["เลข 8", "เลข 9", "เลข 10", "เลข 5"], a: 1 },
    { id: "1_22", q: "คำอักษรจีนคำว่า '十' (shí) แทนตัวเลขใด?", o: ["เลข 1", "เลข 5", "เลข 10", "เลข 100"], a: 2 },
    { id: "1_23", q: "คำอักษรจีนคำว่า '零' (líng) แทนตัวเลขใด?", o: ["เลข 0", "เลข 10", "เลข 100", "เลข 1000"], a: 0 },
    { id: "1_24", q: "คำศัพท์ภาษาจีนคำว่า '水' (shuǐ) แปลว่าอะไร?", o: ["ไฟ (Fire)", "น้ำ (Water)", "ดิน (Soil)", "ลม (Wind)"], a: 1 },
    { id: "1_25", q: "คำศัพท์ภาษาจีนคำว่า '火' (huǒ) แปลว่าอะไร?", o: ["ดิน (Soil)", "น้ำ (Water)", "ไม้ (Wood)", "ไฟ (Fire)"], a: 3 },
    { id: "1_26", q: "คำศัพท์ภาษาจีนคำว่า '土' (tǔ) แปลว่าอะไร?", o: ["ดิน (Soil)", "ทอง (Gold)", "ลม (Wind)", "ภูเขา (Mountain)"], a: 0 },
    { id: "1_27", q: "คำศัพท์ภาษาจีนคำว่า '木' (mù) แปลว่าอะไร?", o: ["แม่น้ำ (River)", "ไม้/ต้นไม้ (Wood)", "ก้อนหิน (Stone)", "ทองคำ (Gold)"], a: 1 },
    { id: "1_28", q: "คำศัพท์ภาษาจีนคำว่า '金' (jīn) แปลว่าอะไร?", o: ["ทอง/โลหะ (Gold/Metal)", "น้ำ (Water)", "ไฟ (Fire)", "ดิน (Soil)"], a: 0 },
    { id: "1_29", q: "คำศัพท์ภาษาจีนคำว่า '天' (tiān) แปลว่าอะไร?", o: ["ภูเขา (Mountain)", "แม่น้ำ (River)", "ท้องฟ้า/วัน (Sky/Day)", "ดิน (Soil)"], a: 2 },
    { id: "1_30", q: "คำศัพท์ภาษาจีนคำว่า '再见' (zài jiàn) แปลว่าอะไร?", o: ["สวัสดี (Hello)", "ขอบคุณ (Thank you)", "ยินดีต้อนรับ (Welcome)", "ลาก่อน/พบกันใหม่ (Goodbye)"], a: 3 }
  ],
  2: [ // Level 2 (Easy - family, animals, basic adjectives)
    { id: "2_1", q: "สัตว์เลี้ยงชนิดใดในภาษาจีนเรียกว่า '猫' (māo)?", o: ["สุนัข (Dog)", "นก (Bird)", "แมว (Cat)", "ปลา (Fish)"], a: 2 },
    { id: "2_2", q: "สัตว์ชนิดใดในภาษาจีนเรียกว่า '狗' (gǒu)?", o: ["แมว (Cat)", "สุนัข (Dog)", "หมู (Pig)", "ม้า (Horse)"], a: 1 },
    { id: "2_3", q: "คำว่า '爸爸' (bàba) ในภาษาจีนหมายถึงใคร?", o: ["แม่ (Mother)", "พ่อ (Father)", "พี่ชาย (Older Brother)", "ปู่ (Grandfather)"], a: 1 },
    { id: "2_4", q: "คำว่า '妈妈' (māma) ในภาษาจีนหมายถึงใคร?", o: ["ยาย (Grandmother)", "พี่สาว (Older Sister)", "แม่ (Mother)", "ป้า (Aunt)"], a: 2 },
    { id: "2_5", q: "คำศัพท์คำว่า '小' (xiǎo) แปลว่าอะไร?", o: ["ใหญ่ (Big)", "ยาว (Long)", "เล็ก (Small)", "สูง (High)"], a: 2 },
    { id: "2_6", q: "คำศัพท์คำว่า '火' (huǒ) แปลว่าอะไร?", o: ["น้ำ (Water)", "ดิน (Soil)", "ไฟ (Fire)", "ลม (Wind)"], a: 2 },
    { id: "2_7", q: "คำศัพท์คำว่า '水' (shuǐ) มีความหมายตรงกับข้อใด?", o: ["ไฟ (Fire)", "น้ำ (Water)", "ไม้ (Wood)", "ทอง (Gold)"], a: 1 },
    { id: "2_8", q: "ผลไม้ชนิดใดในภาษาจีนเรียกว่า '苹果' (píngguǒ)?", o: ["กล้วย (Banana)", "แอปเปิ้ล (Apple)", "ส้ม (Orange)", "องุ่น (Grape)"], a: 1 },
    { id: "2_9", q: "คำศัพท์คำว่า '鸟' (niǎo) แปลว่าอะไร?", o: ["ปลา (Fish)", "นก (Bird)", "ไก่ (Chicken)", "เป็ด (Duck)"], a: 1 },
    { id: "2_10", q: "คำศัพท์คำว่า '鱼' (yú) แปลว่าอะไร?", o: ["นก (Bird)", "สุนัข (Dog)", "ปลา (Fish)", "เต่า (Turtle)"], a: 2 },
    { id: "2_11", q: "คำศัพท์ภาษาจีนคำว่า '哥哥' (gēge) หมายถึงใคร?", o: ["น้องชาย", "พี่ชาย", "น้องสาว", "พี่สาว"], a: 1 },
    { id: "2_12", q: "คำศัพท์ภาษาจีนคำว่า '姐姐' (jiějie) หมายถึงใคร?", o: ["พี่สาว", "น้องสาว", "แม่", "ป้า"], a: 0 },
    { id: "2_13", q: "คำศัพท์ภาษาจีนคำว่า '弟弟' (dìdi) หมายถึงใคร?", o: ["พี่ชาย", "น้องชาย", "พ่อ", "น้าชาย"], a: 1 },
    { id: "2_14", q: "คำศัพท์ภาษาจีนคำว่า '妹妹' (mèimei) หมายถึงใคร?", o: ["น้องสาว", "พี่สาว", "น้าสาว", "ยาย"], a: 0 },
    { id: "2_15", q: "คำศัพท์ภาษาจีนคำว่า '爷爷' (yéye) หมายถึงใคร?", o: ["คุณตา", "คุณปู่", "คุณย่า", "คุณยาย"], a: 1 },
    { id: "2_16", q: "คำศัพท์ภาษาจีนคำว่า '奶奶' (nǎinai) หมายถึงใคร?", o: ["คุณยาย", "คุณย่า", "คุณปู่", "คุณตา"], a: 1 },
    { id: "2_17", q: "คำศัพท์ภาษาจีนคำว่า '外公' (wàigōng) หมายถึงใคร?", o: ["คุณปู่", "คุณตา", "คุณย่า", "คุณยาย"], a: 1 },
    { id: "2_18", q: "คำศัพท์ภาษาจีนคำว่า '外婆' (wàipó) หมายถึงใคร?", o: ["คุณย่า", "คุณยาย", "คุณตา", "คุณปู่"], a: 1 },
    { id: "2_19", q: "สัตว์ชนิดใดในภาษาจีนเรียกว่า '马' (mǎ)?", o: ["ม้า (Horse)", "วัว (Cow)", "แกะ (Sheep)", "เสือ (Tiger)"], a: 0 },
    { id: "2_20", q: "สัตว์ชนิดใดในภาษาจีนเรียกว่า '牛' (niú)?", o: ["แกะ (Sheep)", "ม้า (Horse)", "วัว (Cow)", "หมู (Pig)"], a: 2 },
    { id: "2_21", q: "สัตว์ชนิดใดในภาษาจีนเรียกว่า '羊' (yáng)?", o: ["วัว (Cow)", "แพะ/แกะ (Goat/Sheep)", "ม้า (Horse)", "แมว (Cat)"], a: 1 },
    { id: "2_22", q: "สัตว์ชนิดใดในภาษาจีนเรียกว่า '猪' (zhū)?", o: ["หมู (Pig)", "หมา (Dog)", "กระต่าย (Rabbit)", "สิงโต (Lion)"], a: 0 },
    { id: "2_23", q: "สัตว์ชนิดใดในภาษาจีนเรียกว่า '熊猫' (xióngmāo)?", o: ["หมีควาย", "หมีแพนด้า", "แมวป่า", "เสือโคร่ง"], a: 1 },
    { id: "2_24", q: "คำศัพท์ภาษาจีนคำว่า '多' (duō) แปลว่าอะไร?", o: ["น้อย (Few/Less)", "มาก (Many/Much)", "ใหญ่ (Big)", "เล็ก (Small)"], a: 1 },
    { id: "2_25", q: "คำศัพท์ภาษาจีนคำว่า '少' (shǎo) แปลว่าอะไร?", o: ["มาก (Many)", "น้อย (Few)", "สูง (High)", "ต่ำ (Low)"], a: 1 },
    { id: "2_26", q: "คำศัพท์ภาษาจีนคำว่า '高' (gāo) แปลว่าอะไร?", o: ["เตี้ย", "กว้าง", "สูง", "ยาว"], a: 2 },
    { id: "2_27", q: "คำศัพท์ภาษาจีนคำว่า '矮' (ǎi) แปลว่าอะไร?", o: ["สูง", "เตี้ย/แคระ", "สั้น", "อ้วน"], a: 1 },
    { id: "2_28", q: "คำศัพท์ภาษาจีนคำว่า '胖' (pàng) แปลว่าอะไร?", o: ["ผอม", "สูง", "อ้วน", "แข็งแรง"], a: 2 },
    { id: "2_29", q: "คำศัพท์ภาษาจีนคำว่า '瘦' (shòu) แปลว่าอะไร?", o: ["อ้วน", "ผอม", "แข็งแรง", "อ่อนแอ"], a: 1 },
    { id: "2_30", q: "คำศัพท์ภาษาจีนคำว่า '家' (jiā) แปลว่าอะไร?", o: ["โรงเรียน (School)", "บ้าน/ครอบครัว (Home/Family)", "โรงพยาบาล (Hospital)", "ตลาด (Market)"], a: 1 }
  ],
  3: [ // Level 3 (Medium - colors, simple verbs, school objects)
    { id: "3_1", q: "สีใดในภาษาจีนเรียกว่า '红色' (hóng sè)?", o: ["สีน้ำเงิน (Blue)", "สีเหลือง (Yellow)", "สีแดง (Red)", "สีเขียว (Green)"], a: 2 },
    { id: "3_2", q: "สีใดในภาษาจีนเรียกว่า '绿色' (lǜ sè)?", o: ["สีเขียว (Green)", "สีแดง (Red)", "สีขาว (White)", "สีดำ (Black)"], a: 0 },
    { id: "3_3", q: "คำกริยาภาษาจีนคำว่า '吃' (chī) แปลว่าอะไร?", o: ["ดื่ม (Drink)", "นอน (Sleep)", "กิน (Eat)", "เดิน (Walk)"], a: 2 },
    { id: "3_4", q: "คำกริยาภาษาจีนคำว่า '喝' (hē) แปลว่าอะไร?", o: ["กิน (Eat)", "ดื่ม (Drink)", "พูด (Speak)", "ฟัง (Listen)"], a: 1 },
    { id: "3_5", q: "คำว่า '老师' (lǎoshī) ในภาษาจีนหมายถึงใคร?", o: ["คุณหมอ (Doctor)", "นักเรียน (Student)", "คุณครู (Teacher)", "ตำรวจ (Police)"], a: 2 },
    { id: "3_6", q: "คำศัพท์คำว่า '学生' (xuéshēng) หมายถึงใคร?", o: ["นักเรียน (Student)", "ทหาร (Soldier)", "พ่อค้า (Merchant)", "พยาบาล (Nurse)"], a: 0 },
    { id: "3_7", q: "คำว่า '书' (shū) ในภาษาจีนแปลว่าอะไร?", o: ["ดินสอ (Pencil)", "สมุด (Notebook)", "หนังสือ (Book)", "ยางลบ (Eraser)"], a: 2 },
    { id: "3_8", q: "เมื่อต้องการกล่าวขอบคุณในภาษาจีน ต้องพูดอย่างไร?", o: ["你好 (nǐ hǎo)", "谢谢 (xièxie)", "再见 (zài jiàn)", "没关系 (méi guān xi)"], a: 1 },
    { id: "3_9", q: "คำศัพท์ภาษาจีนคำว่า '看' (kàn) แปลว่าอะไร?", o: ["เขียน (Write)", "อ่าน (Read)", "ดู/มอง (Look/See)", "ฟัง (Listen)"], a: 2 },
    { id: "3_10", q: "คำศัพท์คำว่า '多' (duō) ตรงข้ามกับคำว่า '少' (shǎo) แปลว่าอะไรตามลำดับ?", o: ["มาก - น้อย", "น้อย - มาก", "ใหญ่ - เล็ก", "สูง - ต่ำ"], a: 0 },
    { id: "3_11", q: "สีใดในภาษาจีนเรียกว่า '黄色' (huáng sè)?", o: ["สีแดง (Red)", "สีเขียว (Green)", "สีเหลือง (Yellow)", "สีส้ม (Orange)"], a: 2 },
    { id: "3_12", q: "สีใดในภาษาจีนเรียกว่า '蓝色' (lán sè)?", o: ["สีน้ำเงิน/สีฟ้า (Blue)", "สีม่วง (Purple)", "สีขาว (White)", "สีดำ (Black)"], a: 0 },
    { id: "3_13", q: "สีใดในภาษาจีนเรียกว่า '白色' (bái sè)?", o: ["สีดำ (Black)", "สีเทา (Grey)", "สีขาว (White)", "สีชมพู (Pink)"], a: 2 },
    { id: "3_14", q: "สีใดในภาษาจีนเรียกว่า '黑色' (hēi sè)?", o: ["สีขาว (White)", "สีดำ (Black)", "สีน้ำตาล (Brown)", "สีทอง (Gold)"], a: 1 },
    { id: "3_15", q: "คำกริยาภาษาจีนคำว่า '写' (xiě) แปลว่าอะไร?", o: ["อ่าน (Read)", "เขียน (Write)", "พูด (Speak)", "ฟัง (Listen)"], a: 1 },
    { id: "3_16", q: "คำกริยาภาษาจีนคำว่า '听' (tīng) แปลว่าอะไร?", o: ["ฟัง (Listen)", "ดู (Look)", "กิน (Eat)", "นอน (Sleep)"], a: 0 },
    { id: "3_17", q: "คำกริยาภาษาจีนคำว่า '说' (shuō) แปลว่าอะไร?", o: ["เขียน (Write)", "พูด (Speak)", "ร้องเพลง (Sing)", "เต้น (Dance)"], a: 1 },
    { id: "3_18", q: "คำศัพท์ภาษาจีนคำว่า '笔' (bǐ) แปลว่าอะไร?", o: ["สมุด (Notebook)", "ไม้บรรทัด (Ruler)", "หนังสือ (Book)", "ปากกา/ดินสอ (Pen/Pencil)"], a: 3 },
    { id: "3_19", q: "คำศัพท์ภาษาจีนคำว่า '本子' (běnzi) แปลว่าอะไร?", o: ["หนังสือ (Book)", "สมุดบันทึก (Notebook)", "กระเป๋า (Bag)", "ยางลบ (Eraser)"], a: 1 },
    { id: "3_20", q: "คำศัพท์ภาษาจีนคำว่า '书包' (shūbāo) แปลว่าอะไร?", o: ["กระเป๋านักเรียน (School bag)", "กล่องดินสอ (Pencil case)", "โต๊ะเรียน (Desk)", "ห้องสมุด (Library)"], a: 0 },
    { id: "3_21", q: "คำกริยาภาษาจีนคำว่า '去' (qù) แปลว่าอะไร?", o: ["มา (Come)", "ไป (Go)", "กลับ (Return)", "หยุด (Stop)"], a: 1 },
    { id: "3_22", q: "คำกริยาภาษาจีนคำว่า '来' (lái) แปลว่าอะไร?", o: ["ไป (Go)", "มา (Come)", "เดิน (Walk)", "วิ่ง (Run)"], a: 1 },
    { id: "3_23", q: "คำกริยาภาษาจีนคำว่า '买' (mǎi) แปลว่าอะไร?", o: ["ขาย (Sell)", "ซื้อ (Buy)", "เช่า (Rent)", "ยืม (Borrow)"], a: 1 },
    { id: "3_24", q: "คำกริยาภาษาจีนคำว่า '卖' (mài) แปลว่าอะไร?", o: ["ซื้อ (Buy)", "ขาย (Sell)", "แจก (Giveaway)", "แลกเปลี่ยน (Exchange)"], a: 1 },
    { id: "3_25", q: "คำศัพท์ภาษาจีนคำว่า '钱' (qián) แปลว่าอะไร?", o: ["ของขวัญ (Gift)", "เงิน (Money)", "หยก (Jade)", "ทอง (Gold)"], a: 1 },
    { id: "3_26", q: "คำศัพท์ภาษาจีนคำว่า '衣服' (yīfu) แปลว่าอะไร?", o: ["กางเกง", "หมวก", "รองเท้า", "เสื้อผ้า"], a: 3 },
    { id: "3_27", q: "คำศัพท์ภาษาจีนคำว่า '鞋' (xié) แปลว่าอะไร?", o: ["เสื้อ", "ถุงเท้า", "รองเท้า", "เข็มขัด"], a: 2 },
    { id: "3_28", q: "คำศัพท์ภาษาจีนคำว่า '热' (rè) แปลว่าอะไร?", o: ["หนาว (Cold)", "ร้อน (Hot)", "อุ่น (Warm)", "เย็น (Cool)"], a: 1 },
    { id: "3_29", q: "คำศัพท์ภาษาจีนคำว่า '冷' (lěng) แปลว่าอะไร?", o: ["ร้อน (Hot)", "อุ่น (Warm)", "หนาว (Cold)", "เย็นสบาย (Cool)"], a: 2 },
    { id: "3_30", q: "คำศัพท์ภาษาจีนคำว่า '水饺' (shuǐjiǎo) แปลว่าอะไร?", o: ["ก๋วยเตี๋ยว (Noodles)", "เกี๊ยวน้ำ/เกี๊ยวซ่า (Dumplings)", "ข้าวผัด (Fried rice)", "ซาลาเปา (Steamed bun)"], a: 1 }
  ],
  4: [ // Level 4 (Hard - places, daily actions, common sentences)
    { id: "4_1", q: "สถานที่ใดภาษาจีนเรียกว่า '学校' (xuéxiào)?", o: ["บ้าน (Home)", "โรงพยาบาล (Hospital)", "โรงเรียน (School)", "สวนสาธารณะ (Park)"], a: 2 },
    { id: "4_2", q: "สถานที่ใดภาษาจีนเรียกว่า '家' (jiā)?", o: ["โรงเรียน (School)", "บ้าน (Home)", "ร้านค้า (Shop)", "ตลาด (Market)"], a: 1 },
    { id: "4_3", q: "คำศัพท์คำว่า '高兴' (gāoxìng) แปลว่าอะไร?", o: ["โกรธ (Angry)", "ดีใจ/มีความสุข (Happy)", "เสียใจ (Sad)", "เหนื่อย (Tired)"], a: 1 },
    { id: "4_4", q: "ประโยคว่า '我喜欢猫' (wǒ xǐhuān māo) แปลว่าอะไร?", o: ["ฉันมีแมวหนึ่งตัว", "ฉันไม่ชอบแมว", "ฉันชอบแมว", "แมวชอบฉัน"], a: 2 },
    { id: "4_5", q: "คำศัพท์คำว่า '今天' (jīntiān) แปลว่าอะไร?", o: ["เมื่อวานนี้ (Yesterday)", "วันนี้ (Today)", "พรุ่งนี้ (Tomorrow)", "มะรืนนี้ (Day after tomorrow)"], a: 1 },
    { id: "4_6", q: "คำกริยาภาษาจีนคำว่า '去' (qù) แปลว่าอะไร?", o: ["มา (Come)", "ไป (Go)", "กลับ (Return)", "นั่ง (Sit)"], a: 1 },
    { id: "4_7", q: "คำศัพท์คำว่า '漂亮' (piàoliang) แปลว่าอะไร?", o: ["น่าเกลียด (Ugly)", "น่ารัก (Cute)", "สวย (Beautiful)", "หล่อ (Handsome)"], a: 2 },
    { id: "4_8", q: "คำศัพท์คำว่า '天' (tiān) แปลว่าอะไร?", o: ["ดิน (Earth)", "ท้องฟ้า/วัน (Sky/Day)", "ลม (Wind)", "น้ำ (Water)"], a: 1 },
    { id: "4_9", q: "ประโยคว่า '你去哪儿？' (nǐ qù nǎr?) แปลว่าอะไร?", o: ["คุณชื่ออะไร?", "คุณอายุเท่าไหร่?", "คุณจะไปไหน?", "คุณทำอะไรอยู่?"], a: 2 },
    { id: "4_10", q: "คำว่า '再见' (zài jiàn) แปลว่าอะไร?", o: ["สวัสดี (Hello)", "ขอบคุณ (Thank you)", "ลาก่อน/พบกันใหม่ (Goodbye)", "ขอโทษ (Sorry)"], a: 2 },
    { id: "4_11", q: "สถานที่ใดในภาษาจีนเรียกว่า '医院' (yīyuàn)?", o: ["โรงเรียน", "โรงพยาบาล", "สถานีตำรวจ", "ธนาคาร"], a: 1 },
    { id: "4_12", q: "สถานที่ใดในภาษาจีนเรียกว่า '商店' (shāngdiàn)?", o: ["ตลาด", "ร้านค้า/ร้านขายของ", "บ้าน", "บริษัท"], a: 1 },
    { id: "4_13", q: "อาชีพใดในภาษาจีนเรียกว่า '医生' (yīshēng)?", o: ["พยาบาล (Nurse)", "คุณครู (Teacher)", "วิศวกร (Engineer)", "คุณหมอ/แพทย์ (Doctor)"], a: 3 },
    { id: "4_14", q: "อาชีพใดในภาษาจีนเรียกว่า '护士' (hùshi)?", o: ["คุณหมอ (Doctor)", "พยาบาล (Nurse)", "เภสัชกร (Pharmacist)", "ทหาร (Soldier)"], a: 1 },
    { id: "4_15", q: "อาชีพใดในภาษาจีนเรียกว่า '警察' (jǐngchá)?", o: ["นักดับเพลิง", "ทหาร", "ตำรวจ", "ทนายความ"], a: 2 },
    { id: "4_16", q: "คำศัพท์ภาษาจีนคำว่า '飞机' (fēijī) แปลว่ายานพาหนะใด?", o: ["รถไฟ", "เรือดำน้ำ", "เครื่องบิน", "รถยนต์"], a: 2 },
    { id: "4_17", q: "คำศัพท์ภาษาจีนคำว่า '火车' (huǒchē) แปลว่ายานพาหนะใด?", o: ["รถจักรยานยนต์", "รถไฟ", "รถบรรทุก", "รถแท็กซี่"], a: 1 },
    { id: "4_18", q: "ยานพาหนะใดในภาษาจีนเรียกว่า '自行车' (zìxíngchē)?", o: ["รถยนต์", "รถสามล้อ", "รถจักรยาน", "รถเมล์"], a: 2 },
    { id: "4_19", q: "ประโยค '我坐出租车去学校' แปลว่าอะไร?", o: ["ฉันเดินไปโรงเรียน", "ฉันขึ้นรถไฟไปโรงเรียน", "ฉันนั่งรถแท็กซี่ไปโรงเรียน", "ฉันปั่นจักรยานไปโรงเรียน"], a: 2 },
    { id: "4_20", q: "คำศัพท์ภาษาจีนคำว่า '天气' (tiānqì) แปลว่าอะไร?", o: ["ฤดูกาล", "เวลา", "สภาพอากาศ", "อุณหภูมิ"], a: 2 },
    { id: "4_21", q: "คำศัพท์ภาษาจีนคำว่า '下雨' (xiàyǔ) หมายถึงสภาพอากาศใด?", o: ["หิมะตก", "แดดออก", "ฝนตก", "ลมแรง"], a: 2 },
    { id: "4_22", q: "คำศัพท์ภาษาจีนคำว่า '刮风' (guāfēng) หมายถึงสภาพอากาศใด?", o: ["หมอกลง", "ลมพัด/ลมแรง", "เมฆมาก", "แดดจ้า"], a: 1 },
    { id: "4_23", q: "ประโยค '你想吃什么？' (nǐ xiǎng chī shénme?) แปลว่าอะไร?", o: ["คุณชื่ออะไร?", "คุณทำงานอะไร?", "คุณอยากกินอะไร?", "คุณไปที่ไหน?"], a: 2 },
    { id: "4_24", q: "ประโยค '我会说中文' (wǒ huì shuō Zhōngwén) แปลว่าอะไร?", o: ["ฉันเขียนภาษาจีนเป็น", "ฉันแปลภาษาจีนได้", "ฉันพูดภาษาจีนได้", "ฉันชอบพูดภาษาจีน"], a: 2 },
    { id: "4_25", q: "ประโยค '这个多少钱？' (zhè ge duōshǎo qián?) แปลว่าอะไร?", o: ["นี่คืออะไร?", "อันนี้ราคาเท่าไหร่?", "คุณมีเงินเท่าไหร่?", "อันนี้ซื้อที่ไหน?"], a: 1 },
    { id: "4_26", q: "คำว่า '没关系' (méi guān xi) แปลว่าอะไร?", o: ["ไม่เป็นไร", "ขอโทษ", "ขอบคุณ", "ลาก่อน"], a: 0 },
    { id: "4_27", q: "คำว่า '对不起' (duìbuqǐ) แปลว่าอะไร?", o: ["ไม่เป็นไร", "สวัสดี", "ขอบคุณ", "ขอโทษ"], a: 3 },
    { id: "4_28", q: "คำศัพท์ภาษาจีนคำว่า '水果' (shuǐguǒ) แปลว่าอะไร?", o: ["ผัก (Vegetable)", "ผลไม้ (Fruit)", "น้ำผลไม้ (Juice)", "ของหวาน (Dessert)"], a: 1 },
    { id: "4_29", q: "ผลไม้ชนิดใดในภาษาจีนเรียกว่า '香蕉' (xiāngjiāo)?", o: ["สับปะรด (Pineapple)", "ส้ม (Orange)", "กล้วย (Banana)", "มะม่วง (Mango)"], a: 2 },
    { id: "4_30", q: "ผลไม้ชนิดใดในภาษาจีนเรียกว่า '西瓜' (xīguā)?", o: ["แตงโม (Watermelon)", "เมลอน (Melon)", "มะละกอ (Papaya)", "มะพร้าว (Coconut)"], a: 0 }
  ],
  5: [ // Level 5 (Hardest - times, simple grammar, pronouns sentence construction)
    { id: "5_1", q: "คำศัพท์ภาษาจีนคำว่า '现在' (xiànzài) แปลว่าอะไร?", o: ["เมื่อก่อน (Before)", "ตอนนี้ (Now)", "อนาคต (Future)", "สายแล้ว (Late)"], a: 1 },
    { id: "5_2", q: "คำศัพท์คำว่า '医生' (yīshēng) แปลว่าอะไร?", o: ["พยาบาล (Nurse)", "คุณหมอ (Doctor)", "คนไข้ (Patient)", "เภสัชกร (Pharmacist)"], a: 1 },
    { id: "5_3", q: "ประโยคว่า '我不吃肉' (wǒ bù chī ròu) แปลว่าอะไร?", o: ["ฉันชอบกินเนื้อ", "ฉันไม่กินเนื้อ", "ฉันกินเจ", "ฉันกินเนื้อเป็นหลัก"], a: 1 },
    { id: "5_4", q: "คำศัพท์คำว่า '明天的天气很好' (míngtiān de tiānqì hěn hǎo) แปลว่าอะไร?", o: ["วันนี้อากาศดีมาก", "เมื่อวานอากาศดีมาก", "พรุ่งนี้อากาศจะดีมาก", "อากาศไม่ดีเลย"], a: 2 },
    { id: "5_5", q: "ตัวเลขภาษาจีนคำว่า '一百' (yī bǎi) แทนจำนวนเท่าใด?", o: ["10", "50", "100", "1000"], a: 2 },
    { id: "5_6", q: "ประโยค '这是谁的书？' (zhè shì shéi de shū?) แปลว่าอะไร?", o: ["นี่คือหนังสือของฉัน", "นี่คือหนังสือของใคร?", "หนังสือเล่มนี้ราคาเท่าไหร่?", "คุณชอบอ่านหนังสือไหม?"], a: 1 },
    { id: "5_7", q: "คำศัพท์คำว่า '中国' (Zhōngguó) แปลว่าประเทศใด?", o: ["ประเทศญี่ปุ่น (Japan)", "ประเทศไทย (Thailand)", "ประเทศจีน (China)", "ประเทศเกาหลี (Korea)"], a: 2 },
    { id: "5_8", q: "คำลักษณนาม '个' (gè) ใช้ในข้อใด?", o: ["ใช้บอกจำนวนสัตว์", "ใช้บอกลักษณนามทั่วไป (ชิ้น, อัน, คน)", "ใช้บอกจำนวนหนังสือ", "ใช้บอกระดับความสูง"], a: 1 },
    { id: "5_9", q: "ประโยค '谢谢你帮我' (xièxie nǐ bāng wǒ) แปลว่าอะไร?", o: ["ขอบคุณที่ช่วยฉัน", "ขอบคุณที่มาพบฉัน", "ขอโทษที่ฉันช่วยไม่ได้", "ยินดีที่ได้ช่วยคุณ"], a: 0 },
    { id: "5_10", q: "คำศัพท์ภาษาจีนคำว่า '聪明' (cōngming) แปลว่าอะไร?", o: ["โง่ (Foolish)", "ขยัน (Diligent)", "ฉลาด (Smart)", "ใจดี (Kind)"], a: 2 },
    { id: "5_11", q: "คำศัพท์ภาษาจีนคำว่า '昨天' (zuótiān) แปลว่าอะไร?", o: ["วันนี้ (Today)", "เมื่อวานนี้ (Yesterday)", "พรุ่งนี้ (Tomorrow)", "ปีที่แล้ว (Last year)"], a: 1 },
    { id: "5_12", q: "คำศัพท์ภาษาจีนคำว่า '明天' (míngtiān) แปลว่าอะไร?", o: ["พรุ่งนี้ (Tomorrow)", "เมื่อวานนี้ (Yesterday)", "วันนี้ (Today)", "มะรืนนี้ (Day after tomorrow)"], a: 0 },
    { id: "5_13", q: "คำศัพท์ภาษาจีนคำว่า '小时' (xiǎoshí) แปลว่าหน่วยเวลาใด?", o: ["นาที (Minute)", "ชั่วโมง (Hour)", "วินาที (Second)", "วัน (Day)"], a: 1 },
    { id: "5_14", q: "คำศัพท์ภาษาจีนคำว่า '分钟' (fēnzhōng) แปลว่าหน่วยเวลาใด?", o: ["นาที (Minute)", "ชั่วโมง (Hour)", "วินาที (Second)", "เดือน (Month)"], a: 0 },
    { id: "5_15", q: "คำศัพท์ภาษาจีนคำว่า '星期' (xīngqī) แปลว่าอะไร?", o: ["สัปดาห์/วันในสัปดาห์ (Week)", "เดือน (Month)", "ปี (Year)", "ฤดูกาล (Season)"], a: 0 },
    { id: "5_16", q: "วันใดในภาษาจีนเรียกว่า '星期天' (xīngqītiān)?", o: ["วันจันทร์ (Monday)", "วันเสาร์ (Saturday)", "วันอาทิตย์ (Sunday)", "วันหยุด (Holiday)"], a: 2 },
    { id: "5_17", q: "คำศัพท์ภาษาจีนคำว่า '身体' (shēntǐ) แปลว่าอะไร?", o: ["อวัยวะ (Organ)", "ร่างกาย/สุขภาพ (Body/Health)", "ความสูง (Height)", "น้ำหนัก (Weight)"], a: 1 },
    { id: "5_18", q: "ประโยค '祝你身体健康' (zhù nǐ shēntǐ jiànkāng) แปลว่าอะไร?", o: ["ขอให้เดินทางปลอดภัย", "ขอให้โชคดี", "ขอให้สุขภาพร่างกายแข็งแรง", "ขอให้มีความสุข"], a: 2 },
    { id: "5_19", q: "คำศัพท์ภาษาจีนคำว่า '电脑' (diànnǎo) แปลว่าเครื่องใช้ไฟฟ้าใด?", o: ["โทรทัศน์ (TV)", "โทรศัพท์มือถือ (Phone)", "คอมพิวเตอร์ (Computer)", "ตู้เย็น (Fridge)"], a: 2 },
    { id: "5_20", q: "คำศัพท์ภาษาจีนคำว่า '电话' (diànhuà) แปลว่าอะไร?", o: ["โทรศัพท์/เบอร์โทรศัพท์", "ภาพยนตร์", "คอมพิวเตอร์", "วิทยุ"], a: 0 },
    { id: "5_21", q: "คำศัพท์ภาษาจีนคำว่า '电影' (diànyǐng) แปลว่าอะไร?", o: ["โทรทัศน์ (TV)", "วิทยุ (Radio)", "ภาพยนตร์/หนัง (Movie)", "ละครเวที (Play)"], a: 2 },
    { id: "5_22", q: "ประโยค '我很忙，没有时间。' (wǒ hěn máng, méiyǒu shíjiān.) แปลว่าอะไร?", o: ["ฉันมีเวลาว่างมาก", "ฉันยุ่งมาก ไม่มีเวลา", "ฉันอยากไปเที่ยว", "ฉันเหนื่อยมากตอนนี้"], a: 1 },
    { id: "5_23", q: "คำว่า '便宜' (piányi) ตรงข้ามกับ '贵' (guì) แปลว่าอะไรตามลำดับ?", o: ["แพง - ถูก", "ถูก - แพง", "ดี - เลว", "สวย - ขี้เหร่"], a: 1 },
    { id: "5_24", q: "ลักษณนาม '张' (zhāng) มักใช้กับวัตถุที่มีลักษณะอย่างไร?", o: ["วัตถุรูปทรงกลม", "วัตถุที่มีลักษณะเป็นแผ่น แบน หรือกระดาษ", "วัตถุที่มีลักษณะยาว", "ใช้กับสัตว์สี่เท้า"], a: 1 },
    { id: "5_25", q: "ลักษณนาม '本' (běn) มักใช้ในข้อใด?", o: ["ใช้บอกจำนวนแก้วน้ำ", "ใช้บอกลักษณนามหนังสือ/สมุด (เล่ม)", "ใช้บอกจำนวนกระเป๋า", "ใช้บอกจำนวนเสื้อผ้า"], a: 1 },
    { id: "5_26", q: "คำบุพบท '在' (zài) ในประโยค '我在家' แปลว่าอะไร?", o: ["กำลัง (Doing)", "ที่/อยู่ที่ (At/In)", "ทำ (Do)", "ไป (Go)"], a: 1 },
    { id: "5_27", q: "คำช่วยบอกระดับ '很' (hěn) ในประโยค '很好' แปลว่าอะไร?", o: ["มาก (Very)", "ที่สุด (Most)", "ค่อนข้าง (Quite)", "ไม่ค่อย (Hardly)"], a: 0 },
    { id: "5_28", q: "คำศัพท์ภาษาจีนคำว่า '准备' (zhǔnbèi) แปลว่าอะไร?", o: ["ทำความสะอาด", "เตรียมตัว/จัดเตรียม", "ยอมรับ", "ปฏิเสธ"], a: 1 },
    { id: "5_29", q: "ประโยค '我们要去中国旅游。' (wǒmen yào qù Zhōngguó lǚyóu.) แปลว่าอะไร?", o: ["พวกเราเรียนภาษาจีนที่โรงเรียน", "พวกเราชอบอาหารจีนมาก", "พวกเราจะไปเที่ยวประเทศจีน", "พวกเราอาศัยอยู่ที่ประเทศจีน"], a: 2 },
    { id: "5_30", q: "คำว่า '认识你很高兴' (rènshi nǐ hěn gāoxìng) แปลว่าอะไร?", o: ["ยินดีที่ได้รู้จักคุณ", "ขอบคุณที่มาพบฉัน", "คุณมีความสุขดีไหม?", "ขอให้คุณโชคดี"], a: 0 }
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
    questionSubtitle.innerText = `ตอบคำถามที่ระดับความสูง ${milestone} เมตร เพื่อผ่านขึ้นสู่ดินแดนถัดไป!`;
  }
  
  // Select pool based on current level (defaults to Level 1 if invalid)
  const questionPool = CHINESE_QUESTIONS_BY_LEVEL[game.currentLevel] || CHINESE_QUESTIONS_BY_LEVEL[1];
  
  // Filter for unused questions in the current level
  let unusedQuestions = questionPool.filter(q => !game.askedQuestionIds.has(q.id));
  
  // If we ran out of unique questions for this level, search in OTHER levels' pools
  if (unusedQuestions.length === 0) {
    let allQuestions = [];
    for (let l = 1; l <= 5; l++) {
      if (CHINESE_QUESTIONS_BY_LEVEL[l]) {
        allQuestions = allQuestions.concat(CHINESE_QUESTIONS_BY_LEVEL[l]);
      }
    }
    unusedQuestions = allQuestions.filter(q => !game.askedQuestionIds.has(q.id));
    
    // If absolutely ALL questions in the entire game are exhausted, clear history and restart pool
    if (unusedQuestions.length === 0) {
      game.askedQuestionIds.clear();
      unusedQuestions = questionPool;
    }
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

function checkQuestionAnswer(selectedIndex, clickedBtn) {
  // Disable all options to prevent double-click
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  const feedbackEl = document.getElementById('question-feedback');
  
  if (selectedIndex === currentQuestionObj.a) {
    // Correct Answer
    clickedBtn.classList.add('correct');
    let jadeReward = 5;
    if (game.selectedCharacter === 2) {
      jadeReward = 10;
    } else if (game.selectedCharacter === 1) {
      jadeReward = 3;
    }
    feedbackEl.innerText = `ถูกต้อง! 🎉 ได้รับ +${jadeReward} หยกเขียว`;
    feedbackEl.className = "feedback-text feedback-correct";
    
    game.jadeCount += jadeReward;
    audio.playCollect();
    updateHUD();
    
    // Resume and close modal after 1.5 seconds
    setTimeout(() => {
      game.lastQuestionClearedHeight = game.currentQuestionMilestone;
      game.isQuestionActive = false;
      document.getElementById('question-modal').classList.add('hidden');
    }, 1500);
  } else {
    // Incorrect Answer
    clickedBtn.classList.add('incorrect');
    feedbackEl.innerText = "คำตอบไม่ถูกต้อง! ❌ พลังชีวิตลดลง 1 หน่วย";
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
        document.getElementById('game-over-level').innerText = `ด่าน ${game.currentLevel}`;
        
        const targetMeters = LEVELS_CONFIG[game.currentLevel].heightMeters;
        let realHeight = Math.floor(Math.abs(player.y) / 14.5);
        if (realHeight < 0) realHeight = 0;
        if (realHeight > targetMeters) realHeight = targetMeters;
        document.getElementById('game-over-height').innerText = `${realHeight}m / ${targetMeters}m`;
        
        // Show Game Over overlay
        document.getElementById('game-over-screen').classList.remove('hidden');
      } else {
        // Pick another question and display
        triggerQuestion(game.currentQuestionMilestone);
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
  document.getElementById('height-val').innerText = `${realHeight}m / ${targetMeters}m (ด่าน ${game.currentLevel})`;
  
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
  const categories = ['jump', 'speed', 'doublejump', 'float'];
  
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
    const cost = 15;
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
});

window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  keys[k] = false;
  keys[e.code] = false;
});

// Mobile virtual buttons
const activeMobileControls = { left: false, right: false };

document.getElementById('btn-left').addEventListener('touchstart', e => {
  e.preventDefault();
  activeMobileControls.left = true;
});
document.getElementById('btn-left').addEventListener('touchend', e => {
  e.preventDefault();
  activeMobileControls.left = false;
});

document.getElementById('btn-right').addEventListener('touchstart', e => {
  e.preventDefault();
  activeMobileControls.right = true;
});
document.getElementById('btn-right').addEventListener('touchend', e => {
  e.preventDefault();
  activeMobileControls.right = false;
});

document.getElementById('btn-jump').addEventListener('touchstart', e => {
  e.preventDefault();
  if (game.state === 'PLAYING' && !game.shopOpen) {
    player.jump();
  }
});

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

  if (charId === 1) { // 1. ตั๊กแตน (Grasshopper) - Green Leaf theme
    const bodyColor = '#22c55e'; // Green
    const limbColor = '#15803d'; // Dark green
    const eyeColor = '#0f172a';  // Dark slate eyes
    const wingColor = 'rgba(187, 247, 208, 0.6)'; // Translucent wing green
    
    // Draw Wings (behind body)
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.ellipse(-size * 0.8, -size * 0.2, size * 0.4, size * 1.1, Math.PI / 8, 0, Math.PI * 2);
    ctx.ellipse(-size * 0.6, -size * 0.1, size * 0.3, size * 0.9, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Back Foot/Arm
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size + 6, size - 14, 6, 0, Math.PI * 2);
    ctx.arc(-size + 8, size - 3, 7, 0, Math.PI * 2);
    ctx.fill();

    // Draw Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Leaf badge decoration on body
    ctx.fillStyle = '#12d58a';
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, size * 0.3, 4, 6, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();

    // Sash (belt)
    ctx.fillStyle = '#12d58a';
    ctx.fillRect(-size + 1, size - 13, size * 2 - 2, 7);
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(-4, size - 13, 8, 7);

    // Neck ring
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(0, -size + 14, size * 0.95, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Antennae (หนวดตั๊กแตน)
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size - 2, 12, Math.PI, Math.PI * 1.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.4, -size - 2, 12, Math.PI * 1.45, Math.PI * 2);
    ctx.stroke();

    // Giant bug eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(-size * 0.35, -size + 9, 6, 8, -Math.PI / 10, 0, Math.PI * 2);
    ctx.ellipse(size * 0.35, -size + 9, 6, 8, Math.PI / 10, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size + 7, 2, 0, Math.PI * 2);
    ctx.arc(size * 0.28, -size + 7, 2, 0, Math.PI * 2);
    ctx.fill();

    // Front limbs
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(size - 8, size - 3, 7, 0, Math.PI * 2);
    ctx.arc(size - 6, size - 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.fillStyle = '#12d58a';
    ctx.fillRect(-size * 0.8, -size - 4, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 1);
    ctx.lineTo(-size * 0.7 - 12, -size + 5);
    ctx.lineTo(-size * 0.7, -size + 3);
    ctx.closePath();
    ctx.fill();

  } else if (charId === 2) { // 2. เด็กเนิร์ด (Nerd Kid) - Scholar Glasses theme
    const skinColor = '#fed7aa'; // Light Peach skin
    const hairColor = '#451a03'; // Brown hair
    const clothesColor = '#1d4ed8'; // Royal Blue shirt
    const limbColor = '#1c1e22';
    
    // Draw Back Foot/Arm
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size + 6, size - 14, 7, 0, Math.PI * 2);
    ctx.arc(-size + 8, size - 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw Body (Shirt)
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
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.5, -1.5, 3, 3);

    // Sash
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-size + 1, size - 13, size * 2 - 2, 7);
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(-4, size - 13, 8, 7);

    // Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(-size * 0.3, -size + 8, size * 0.6, 8);

    // Head (Face)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -size + 10, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hair (หน้าม้าและผมด้านข้าง)
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

    // Small eyes inside glasses
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size + 11, 2, 0, Math.PI * 2);
    ctx.arc(size * 0.35, -size + 11, 2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.arc(-size * 0.55, -size + 17, 3, 0, Math.PI * 2);
    ctx.arc(size * 0.55, -size + 17, 3, 0, Math.PI * 2);
    ctx.fill();

    // Front limbs
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(size - 8, size - 3, 8, 0, Math.PI * 2);
    ctx.arc(size - 6, size - 14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-size * 0.8, -size - 6, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 3);
    ctx.lineTo(-size * 0.7 - 12, -size + 3);
    ctx.lineTo(-size * 0.7, -size + 1);
    ctx.closePath();
    ctx.fill();

  } else if (charId === 3) { // 3. เต่า (Turtle) - Brown Shell & Green body
    const shellColor = '#78350f'; // Brown shell
    const shellPatternColor = '#b45309'; // Lighter brown patterns
    const skinColor = '#84cc16'; // Lime/Olive Green
    const limbColor = '#4d7c0f'; // Dark green
    
    // Draw Turtle Shell (Behind body)
    ctx.fillStyle = shellColor;
    ctx.beginPath();
    ctx.arc(-size * 0.3, 0, size * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = limbColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Shell patterns (Hexagon crosslines)
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

    // Draw Back Foot/Arm
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size + 6, size - 14, 8, 0, Math.PI * 2);
    ctx.arc(-size + 8, size - 3, 9, 0, Math.PI * 2);
    ctx.fill();

    // Draw Body (Green chest)
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

    // Head
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

    // Front limbs
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(size - 8, size - 3, 9, 0, Math.PI * 2);
    ctx.arc(size - 6, size - 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Headband (Pink)
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(-size * 0.75, -size - 4, size * 1.5, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.65, -size - 1);
    ctx.lineTo(-size * 0.65 - 12, -size + 5);
    ctx.lineTo(-size * 0.65, -size + 3);
    ctx.closePath();
    ctx.fill();

  } else if (charId === 4) { // 4. แพนด้าตัวเดิม (Panda Original)
    const bodyColor = '#ffffff';
    const limbColor = '#1f2937'; // Slate Black
    const sashColor = '#dc2626'; // Crimson
    const buckleColor = '#eab308'; // Gold
    const headbandColor = '#dc2626';
    
    // Draw limbs (behind)
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size + 6, size - 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-size + 8, size - 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Main body
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

    // Head
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

    // Front limbs
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(size - 8, size - 3, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size - 6, size - 14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.fillStyle = headbandColor;
    ctx.fillRect(-size * 0.8, -size - 4, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 1);
    ctx.lineTo(-size * 0.7 - 12, -size + 5);
    ctx.lineTo(-size * 0.7, -size + 3);
    ctx.closePath();
    ctx.fill();

  } else if (charId === 5) { // 5. ลิง (Monkey) - Golden Brown & Cloud details
    const bodyColor = '#d97706'; // Golden Brown monkey body
    const faceColor = '#ffedd5'; // Light peach/cream face
    const limbColor = '#78350f'; // Dark Brown limbs
    const sashColor = '#06b6d4'; // Cyan
    const headbandColor = '#06b6d4';
    
    // Draw Monkey Tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-size * 1.0, size * 0.2, 10, Math.PI * 0.5, Math.PI * 1.8);
    ctx.stroke();

    // Draw limbs (behind)
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(-size + 6, size - 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-size + 8, size - 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Main body
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

    // Head
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

    // Large ears at the sides of the head
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

    // Front limbs
    ctx.fillStyle = limbColor;
    ctx.beginPath();
    ctx.arc(size - 8, size - 3, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size - 6, size - 14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.fillStyle = headbandColor;
    ctx.fillRect(-size * 0.8, -size - 4, size * 1.6, 6);
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size - 1);
    ctx.lineTo(-size * 0.7 - 12, -size + 5);
    ctx.lineTo(-size * 0.7, -size + 3);
    ctx.closePath();
    ctx.fill();
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
  for (let i = 1; i <= 5; i++) {
    drawCharacterOnCanvas(`char-canvas-${i}`, i);
  }
}

// Init buttons
document.getElementById('btn-start').addEventListener('click', () => {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('char-select-screen').classList.remove('hidden');
  drawAllCharacterPreviews();
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
  document.getElementById('char-select-screen').classList.remove('hidden');
  drawAllCharacterPreviews();
});


// --- PARALLAX BACKGROUND RENDER ---
function drawParallaxBackgrounds() {
  const camY = camera.y;

  // Zone 1: Bamboo Forest (Red/Green Slate Gradient + Art)
  if (camY >= -TOTAL_HEIGHT * 0.4) {
    if (bgLoaded.bamboo) {
      // Infinite tiled vertical parallax
      const py = -camY * 0.2 % V_HEIGHT;
      ctx.drawImage(bgImages.bamboo, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.bamboo, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      // Fallback bamboo gradient
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#101614');
      grad.addColorStop(1, '#1b2922');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
  }

  // Zone 2: Cloud Temple (Sunset Gold/Pink clouds)
  const zone2Active = camY < -TOTAL_HEIGHT * 0.2 && camY > -TOTAL_HEIGHT * 0.8;
  if (zone2Active) {
    ctx.save();
    // Fade alpha based on range
    if (camY >= -TOTAL_HEIGHT * 0.33) {
      // Fade in from zone 1
      const alpha = Math.abs(camY + TOTAL_HEIGHT * 0.2) / (TOTAL_HEIGHT * 0.13);
      ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
    } else if (camY <= -TOTAL_HEIGHT * 0.66) {
      // Fade out to zone 3
      const alpha = 1 - (Math.abs(camY + TOTAL_HEIGHT * 0.66) / (TOTAL_HEIGHT * 0.14));
      ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
    }
    
    if (bgLoaded.clouds) {
      const py = -camY * 0.15 % V_HEIGHT;
      ctx.drawImage(bgImages.clouds, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.clouds, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      // Sunset cloud gradient
      const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      grad.addColorStop(0, '#36182c');
      grad.addColorStop(0.5, '#6a2a4b');
      grad.addColorStop(1, '#a85058');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    }
    ctx.restore();
  }

  // Zone 3: Cosmic Tao (Yin-Yang Starry Space)
  if (camY <= -TOTAL_HEIGHT * 0.6) {
    ctx.save();
    // Fade in
    if (camY >= -TOTAL_HEIGHT * 0.66) {
      const alpha = Math.abs(camY + TOTAL_HEIGHT * 0.6) / (TOTAL_HEIGHT * 0.06);
      ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
    }
    if (bgLoaded.cosmic) {
      const py = -camY * 0.08 % V_HEIGHT;
      ctx.drawImage(bgImages.cosmic, 0, py, V_WIDTH, V_HEIGHT);
      ctx.drawImage(bgImages.cosmic, 0, py - V_HEIGHT, V_WIDTH, V_HEIGHT);
    } else {
      // Cosmic Space Gradient
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
    ctx.restore();
  }
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

  // 6. Draw Player Monk
  player.draw(ctx);

  ctx.restore();
}

// --- CORE GAME LOOP ---
let lastTime = 0;
function gameLoop(timestamp) {
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

      // 5. Collision checks
      handleCollisions(dt);

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

  const aspectRatio = V_WIDTH / V_HEIGHT;
  
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
  canvas.width = V_WIDTH;
  canvas.height = V_HEIGHT;
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
window.addEventListener('load', () => {
  resizeCanvas();
  spawnCherryBlossomPetals();
  drawAllCharacterPreviews();
  requestAnimationFrame(gameLoop);
});
