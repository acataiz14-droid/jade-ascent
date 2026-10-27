/* ============================================================
   JADE RUNNER: SIDE-SCROLLING AUTO-RUNNER (COOKIE RUN MODE)
   ============================================================ */
import { profileManager } from './auth.js';

export class RunnerEngine {
  constructor(canvas, ctx, onExit) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onExit = onExit;

    this.V_WIDTH = 1200;
    this.V_HEIGHT = 675;
    this.GROUND_Y = 540;

    this.running = false;
    this.paused = false;
    this.animationFrameId = null;
    this.lastTime = 0;

    // Game stats
    this.distance = 0; // in meters (1m = 40px)
    this.speed = 420; // px/sec
    this.baseSpeed = 420;
    this.maxSpeed = 750;
    this.jadeCollected = 0;
    this.score = 0;

    // Chinese Word Fever system: Default to Hotel Stage (โรงแรม: 酒店, 房间, 预订, 入住, 退房, 护照)
    this.stageId = 'hotel';
    this.feverWords = ['酒店', '房间', '预订', '入住', '退房', '护照'];
    this.feverMeanings = {
      '酒店': 'jiǔdiàn • Hotel (โรงแรม)',
      '房间': 'fángjiān • Room (ห้องพัก)',
      '预订': 'yùdìng • Reservation / Book (จอง)',
      '入住': 'rùzhù • Check in (เช็คอิน)',
      '退房': 'tuìfáng • Check out (เช็คเอาท์)',
      '护照': 'hùzhào • Passport (พาสปอร์ต)'
    };
    this.feverCollected = this.feverWords.map(() => false);
    this.feverActive = false;
    this.feverTimer = 0;
    this.feverDuration = 8.0;

    // Player state
    this.player = {
      x: 180,
      y: this.GROUND_Y - 76,
      vx: 0,
      vy: 0,
      width: 58,
      height: 76,
      normalHeight: 76,
      slideHeight: 38,
      isGrounded: true,
      isSliding: false,
      jumpCount: 0,
      maxJumps: 2,
      hp: 3,
      maxHp: 3,
      invulnerableTimer: 0,
      shieldActive: false,
      magnetTimer: 0,
      shootCooldown: 0,
      animTime: 0
    };

    // World entities
    this.platforms = [];
    this.obstacles = [];
    this.enemies = [];
    this.collectibles = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Background layers (Parallax)
    this.bgOffsets = [0, 0, 0, 0];

    // Spawner tracker
    this.spawnCursor = 0;

    // Inputs
    this.keys = {
      jump: false,
      slide: false,
      shoot: false
    };

    // Character preview sprite
    this.charSprite = new Image();
    this.charSprite.src = 'assets/char_wind_seeker.png';
    this.charSpriteLoaded = false;
    this.charSprite.onload = () => { this.charSpriteLoaded = true; };

    // Claybound audio assets
    this.sfx = {
      jump: new Audio('assets/claybound/jump-gY1Z4E5y.wav'),
      collect: new Audio('assets/claybound/coin-pickup-d4kv-Dau.wav'),
      stomp: new Audio('assets/claybound/enemy-head-impact-BL9Yhh1v.wav'),
      collapse: new Audio('assets/claybound/ledge-collapse-C7RKcUyF.wav'),
      burst: new Audio('assets/claybound/spore-balloon-burst-B7lFEp6K.wav'),
      death: new Audio('assets/claybound/fall-death-zzpRFwdL.wav'),
      slide: new Audio('assets/claybound/zip-grind-1-dHGrHIVz.wav'),
      fever: new Audio('assets/claybound/flower-victory-4bT9WopA.wav'),
      step1: new Audio('assets/claybound/clay-step-1-CZ4QxAA3.wav'),
      step2: new Audio('assets/claybound/clay-step-2-D0YV6ALZ.wav'),
      step3: new Audio('assets/claybound/clay-step-3-bl24qCii.wav')
    };

    // Claybound energetic soundtrack
    this.runnerBgm = new Audio('assets/claybound/happier-harmonic-twist-BtoDku43.mp3');
    this.runnerBgm.loop = true;
    this.runnerBgm.volume = 0.55;

    // Claybound visual assets
    this.clayBeadImg = new Image();
    this.clayBeadImg.src = 'assets/claybound/bead-BuU2NiVW.webp';
    this.clayBeadLoaded = false;
    this.clayBeadImg.onload = () => { this.clayBeadLoaded = true; };

    this.clayFlowerImg = new Image();
    this.clayFlowerImg.src = 'assets/claybound/flower-DjewNXX7.webp';
    this.clayFlowerLoaded = false;
    this.clayFlowerImg.onload = () => { this.clayFlowerLoaded = true; };

    this.clayWorldBg = new Image();
    this.clayWorldBg.src = 'assets/claybound/og-card.jpg';
    this.clayWorldBgLoaded = false;
    this.clayWorldBg.onload = () => { this.clayWorldBgLoaded = true; };

    this.stepSoundTimer = 0;

    // Setup input listeners
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundLoop = this.loop.bind(this);
  }

  playSFX(name, vol = 0.65) {
    if (window.audio && window.audio.muted) return;
    try {
      const sound = this.sfx[name];
      if (sound) {
        sound.currentTime = 0;
        sound.volume = vol;
        sound.play().catch(() => {});
      }
    } catch (e) {}
  }

  start() {
    this.running = true;
    this.paused = false;
    this.reset();

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Setup Runner Mobile Controls
    this.setupMobileControls();

    // Show Runner HUD
    const hud = document.getElementById('runner-hud');
    if (hud) hud.classList.remove('hidden');

    const mobileControls = document.getElementById('runner-mobile-controls');
    if (mobileControls) mobileControls.classList.remove('hidden');

    const gameOverScreen = document.getElementById('runner-game-over');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');

    // Start Claybound energetic soundtrack
    if (window.audio && !window.audio.muted) {
      try {
        this.runnerBgm.currentTime = 0;
        this.runnerBgm.play().catch(() => {});
      } catch (e) {}
    }

    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.boundLoop);
  }

  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Stop Runner BGM
    if (this.runnerBgm) {
      try {
        this.runnerBgm.pause();
      } catch (e) {}
    }

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);

    // Hide Runner HUD & Mobile controls
    const hud = document.getElementById('runner-hud');
    if (hud) hud.classList.add('hidden');

    const mobileControls = document.getElementById('runner-mobile-controls');
    if (mobileControls) mobileControls.classList.add('hidden');

    const gameOverScreen = document.getElementById('runner-game-over');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
  }

  setStage(stageId = 'hotel') {
    this.stageId = stageId;
    if (stageId === 'classic') {
      this.feverWords = ['风', '火', '雷', '龙', '玉'];
    } else {
      this.feverWords = ['酒店', '房间', '预订', '入住', '退房', '护照'];
    }
    this.feverCollected = this.feverWords.map(() => false);
  }

  reset() {
    this.distance = 0;
    this.speed = this.baseSpeed;
    this.jadeCollected = 0;
    this.score = 0;
    this.feverCollected = this.feverWords.map(() => false);
    this.feverActive = false;
    this.feverTimer = 0;

    this.player.y = this.GROUND_Y - this.player.normalHeight;
    this.player.vy = 0;
    this.player.height = this.player.normalHeight;
    this.player.isGrounded = true;
    this.player.isSliding = false;
    this.player.jumpCount = 0;

    // Pet Bonus: Spirit Turtle gives +1 starting Max HP
    let petHp = 0;
    const activeProf = profileManager.getActiveProfile();
    if (activeProf && activeProf.sanctuary && activeProf.sanctuary.activePet === 'turtle') {
      petHp = 1;
    }
    this.player.maxHp = 3 + petHp;
    this.player.hp = this.player.maxHp;
    this.player.invulnerableTimer = 0;
    this.player.shieldActive = false;
    this.player.magnetTimer = 0;
    this.player.shootCooldown = 0;

    this.platforms = [];
    this.obstacles = [];
    this.enemies = [];
    this.collectibles = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Initial flat ground
    this.platforms.push({
      x: 0,
      y: this.GROUND_Y,
      width: 1600,
      height: 140
    });
    this.spawnCursor = 1600;

    this.updateHUD();
  }

  handleKeyDown(e) {
    if (!this.running) return;

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.triggerJump();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      this.setSlide(true);
    } else if (e.code === 'KeyJ' || e.code === 'KeyF' || e.code === 'KeyX') {
      e.preventDefault();
      this.triggerShoot();
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      this.togglePause();
    }
  }

  handleKeyUp(e) {
    if (!this.running) return;

    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.setSlide(false);
    }
  }

  setupMobileControls() {
    const btnJump = document.getElementById('runner-btn-jump');
    const btnSlide = document.getElementById('runner-btn-slide');
    const btnShoot = document.getElementById('runner-btn-shoot');

    if (btnJump) {
      btnJump.style.touchAction = 'none';
      btnJump.onpointerdown = (e) => {
        if (e.cancelable) e.preventDefault();
        this.triggerJump();
      };
    }

    if (btnSlide) {
      btnSlide.style.touchAction = 'none';
      btnSlide.onpointerdown = (e) => {
        if (e.cancelable) e.preventDefault();
        try { if (e.target && e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId); } catch (_) {}
        this.setSlide(true);
      };
      const releaseSlide = (e) => {
        if (e.cancelable) e.preventDefault();
        try { if (e.target && e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId); } catch (_) {}
        this.setSlide(false);
      };
      btnSlide.onpointerup = releaseSlide;
      btnSlide.onpointercancel = releaseSlide;
    }

    if (btnShoot) {
      btnShoot.style.touchAction = 'none';
      btnShoot.onpointerdown = (e) => {
        if (e.cancelable) e.preventDefault();
        this.triggerShoot();
      };
    }
  }

  triggerJump() {
    if (this.player.isSliding) {
      this.setSlide(false);
    }

    // Pet Bonus: Celestial Crane gives +12% jump height
    let jumpMult = 1.0;
    const activeProf = profileManager.getActiveProfile();
    if (activeProf && activeProf.sanctuary && activeProf.sanctuary.activePet === 'crane') {
      jumpMult = 1.12;
    }

    if (this.player.jumpCount < this.player.maxJumps) {
      if (this.player.jumpCount === 0) {
        // First jump
        this.player.vy = -680 * jumpMult;
        this.player.isGrounded = false;
        this.player.jumpCount = 1;
        this.playSFX('jump', 0.7);
        this.spawnJumpParticles();
      } else {
        // Double jump
        this.player.vy = -640 * jumpMult;
        this.player.jumpCount = 2;
        this.playSFX('jump', 0.85);
        this.spawnDoubleJumpRing();
      }
    }
  }

  setSlide(sliding) {
    if (sliding && !this.player.isSliding) {
      this.player.isSliding = true;
      this.player.height = this.player.slideHeight;
      if (this.player.isGrounded) {
        this.player.y = this.GROUND_Y - this.player.slideHeight;
      }
      this.playSFX('slide', 0.6);
      this.spawnSlideSparks();
    } else if (!sliding && this.player.isSliding) {
      this.player.isSliding = false;
      this.player.height = this.player.normalHeight;
      if (this.player.isGrounded) {
        this.player.y = this.GROUND_Y - this.player.normalHeight;
      }
    }
  }

  triggerShoot() {
    if (this.player.shootCooldown > 0) return;
    this.player.shootCooldown = 0.25;

    // Spawn talisman projectile
    const projY = this.player.isSliding ? this.player.y + 15 : this.player.y + 35;
    this.projectiles.push({
      x: this.player.x + 50,
      y: projY,
      vx: 850,
      width: 32,
      height: 18,
      life: 1.5
    });

    this.playSFX('burst', 0.65);

    // Muzzle flash particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x + 50,
        y: projY,
        vx: 100 + Math.random() * 150,
        vy: (Math.random() - 0.5) * 120,
        color: '#fbbf24',
        size: 3 + Math.random() * 3,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  togglePause() {
    this.paused = !this.paused;
    const pauseOverlay = document.getElementById('runner-pause-overlay');
    if (pauseOverlay) {
      if (this.paused) pauseOverlay.classList.remove('hidden');
      else pauseOverlay.classList.add('hidden');
    }

    if (this.runnerBgm) {
      if (this.paused) {
        try { this.runnerBgm.pause(); } catch (e) {}
      } else if (window.audio && !window.audio.muted) {
        try { this.runnerBgm.play().catch(() => {}); } catch (e) {}
      }
    }
  }

  loop(currentTime) {
    if (!this.running) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    if (!this.paused) {
      this.update(dt);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame(this.boundLoop);
  }

  update(dt) {
    this.gameTime = (this.gameTime || 0) + dt;

    // 1. Fever Mode countdown
    if (this.feverActive) {
      this.feverTimer -= dt;
      this.speed = this.baseSpeed * 1.35;
      if (this.feverTimer <= 0) {
        this.feverActive = false;
        this.feverCollected = this.feverWords.map(() => false);
        this.speed = this.baseSpeed + Math.min(this.distance * 0.15, this.maxSpeed - this.baseSpeed);
        this.updateHUD();
      }
    } else {
      // Speed scales gently with distance
      this.speed = Math.min(this.baseSpeed + (this.distance * 0.12), this.maxSpeed);
    }

    // 2. Advance distance & score
    const deltaDist = (this.speed * dt) / 30; // ~meters
    this.distance += deltaDist;
    this.score += Math.round(deltaDist * 10);

    // 3. Update player physics
    const p = this.player;
    p.animTime += dt;
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.shootCooldown > 0) p.shootCooldown -= dt;
    if (p.magnetTimer > 0) p.magnetTimer -= dt;

    if (this.feverActive) {
      // In fever mode, player hovers smoothly and cannot fall
      p.isGrounded = false;
      const targetY = this.GROUND_Y - 140 + Math.sin(p.animTime * 6) * 25;
      p.y += (targetY - p.y) * dt * 8;
      p.vy = 0;
      // Spawn fever rainbow particles
      this.particles.push({
        x: p.x - 10,
        y: p.y + 20 + Math.random() * 30,
        vx: -this.speed * 0.6,
        vy: (Math.random() - 0.5) * 50,
        color: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
        size: 5 + Math.random() * 5,
        life: 0.4,
        maxLife: 0.4
      });
    } else {
      // 3b. Rock-Solid Platform Physics (Zero Shaking)
      if (p.isGrounded) {
        p.vy = 0;

        // Check if player has run off current platform edge into a pit
        let stillGrounded = false;
        for (const plat of this.platforms) {
          if (p.x + p.width * 0.7 > plat.x && p.x + p.width * 0.3 < plat.x + plat.width) {
            if (Math.abs((p.y + p.height) - plat.y) < 18) {
              p.y = plat.y - p.height;
              stillGrounded = true;
              break;
            }
          }
        }
        if (!stillGrounded) {
          p.isGrounded = false;
        }
      } else {
        // Airborne: apply gravity
        const gravity = 1750;
        p.vy += gravity * dt;
        p.y += p.vy * dt;

        // Check landing on platform
        const playerBottom = p.y + p.height;
        const prevBottom = playerBottom - p.vy * dt;

        for (const plat of this.platforms) {
          if (p.x + p.width * 0.75 > plat.x && p.x + p.width * 0.25 < plat.x + plat.width) {
            if (p.vy >= 0 && playerBottom >= plat.y && prevBottom <= plat.y + 18) {
              p.y = plat.y - p.height;
              p.vy = 0;
              p.isGrounded = true;
              p.jumpCount = 0;
              break;
            }
          }
        }
      }

      // Check pit fall
      if (p.y > this.V_HEIGHT + 60) {
        this.takeDamage(3, 'fell_into_pit');
        return;
      }
    }

    // Foot dust & clay footstep sound while running
    if (p.isGrounded && !p.isSliding) {
      this.stepSoundTimer = (this.stepSoundTimer || 0) + dt;
      if (this.stepSoundTimer > 0.28) {
        this.stepSoundTimer = 0;
        const stepNum = Math.floor(Math.random() * 3) + 1;
        this.playSFX('step' + stepNum, 0.25);
      }
      if (Math.random() < 0.35) {
        this.particles.push({
          x: p.x + 10,
          y: p.y + p.height - 4,
          vx: -150 - Math.random() * 80,
          vy: -20 - Math.random() * 30,
          color: '#d6d3d1',
          size: 3 + Math.random() * 4,
          life: 0.3,
          maxLife: 0.3
        });
      }
    }

    // Slide trail particles
    if (p.isSliding && p.isGrounded) {
      this.particles.push({
        x: p.x + 10,
        y: p.y + p.height - 2,
        vx: -220 - Math.random() * 100,
        vy: -10 - Math.random() * 20,
        color: '#f59e0b',
        size: 4 + Math.random() * 4,
        life: 0.25,
        maxLife: 0.25
      });
    }

    // 4. Scroll world & entities
    const scrollAmount = this.speed * dt;

    // Scroll platforms
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      this.platforms[i].x -= scrollAmount;
      if (this.platforms[i].x + this.platforms[i].width < -200) {
        this.platforms.splice(i, 1);
      }
    }
    this.spawnCursor -= scrollAmount;

    // Scroll & check obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= scrollAmount;
      if (obs.type === 'boulder') {
        obs.rollAngle = (obs.rollAngle || 0) + (this.speed / 24) * dt;
      }

      // Collision with player
      if (!this.feverActive && p.invulnerableTimer <= 0) {
        if (this.checkAABB(p, obs)) {
          if (p.shieldActive) {
            p.shieldActive = false;
            p.invulnerableTimer = 1.0;
            this.spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#38bdf8');
            this.playSFX('collapse', 0.6);
            this.obstacles.splice(i, 1);
            continue;
          } else {
            this.takeDamage(1, 'hit_obstacle');
            this.spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#ef4444');
            this.obstacles.splice(i, 1);
            continue;
          }
        }
      } else if (this.feverActive) {
        // Fever smash!
        if (this.checkAABB(p, obs)) {
          this.spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#fbbf24');
          this.playSFX('burst', 0.6);
          this.score += 200;
          this.floatingTexts.push({ x: obs.x, y: obs.y, text: '+200 FEVER!', color: '#fbbf24', life: 0.8 });
          this.obstacles.splice(i, 1);
          continue;
        }
      }

      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }

    // Scroll & update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.x -= scrollAmount + (en.vx || 0) * dt;
      if (en.type === 'flying') {
        if (en.baseY === undefined) en.baseY = en.y;
        en.y = en.baseY + Math.sin(this.gameTime * 3.5 + (en.seed || 0)) * 24;
      }

      // Check hit by projectiles
      let enemyDestroyed = false;
      for (let pj = this.projectiles.length - 1; pj >= 0; pj--) {
        const proj = this.projectiles[pj];
        if (this.checkAABB(proj, en)) {
          this.spawnExplosion(en.x + en.width / 2, en.y + en.height / 2, '#fbbf24');
          this.playSFX('burst', 0.65);
          this.projectiles.splice(pj, 1);
          enemyDestroyed = true;
          this.score += 350;
          this.jadeCollected += 2;
          this.floatingTexts.push({ x: en.x, y: en.y, text: '+2 JADE 🟢', color: '#10b981', life: 0.9 });
          break;
        }
      }

      if (enemyDestroyed) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Player collision with enemy
      if (!this.feverActive) {
        if (p.invulnerableTimer <= 0 && this.checkAABB(p, en)) {
          // If falling from above, stomp enemy!
          if (p.vy > 100 && p.y + p.height - en.y < 28) {
            p.vy = -520; // Stomp bounce
            this.spawnExplosion(en.x + en.width / 2, en.y + en.height / 2, '#10b981');
            this.playSFX('stomp', 0.85);
            this.score += 300;
            this.jadeCollected += 1;
            this.enemies.splice(i, 1);
            continue;
          } else {
            // Hit by enemy
            if (p.shieldActive) {
              p.shieldActive = false;
              p.invulnerableTimer = 1.0;
              this.enemies.splice(i, 1);
            } else {
              this.takeDamage(1, 'hit_enemy');
              this.enemies.splice(i, 1);
            }
            continue;
          }
        }
      } else {
        // Fever smash enemy
        if (this.checkAABB(p, en)) {
          this.spawnExplosion(en.x + en.width / 2, en.y + en.height / 2, '#fbbf24');
          this.score += 500;
          this.jadeCollected += 3;
          this.enemies.splice(i, 1);
          continue;
        }
      }

      if (en.x + en.width < -100) {
        this.enemies.splice(i, 1);
      }
    }

    // Scroll & check collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= scrollAmount;

      // Magnet effect (either fever or power-up)
      if (this.feverActive || p.magnetTimer > 0) {
        const dx = p.x + p.width / 2 - col.x;
        const dy = p.y + p.height / 2 - col.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 420) {
          col.x += (dx / dist) * 750 * dt;
          col.y += (dy / dist) * 750 * dt;
        }
      }

      // Collect item
      if (this.checkAABB(p, col)) {
        if (col.type === 'jade') {
          this.jadeCollected += 1;
          this.score += 100;
          this.playSFX('collect', 0.65);
          this.spawnCollectSparkles(col.x, col.y, '#10b981');
        } else if (col.type === 'big_jade') {
          this.jadeCollected += 5;
          this.score += 500;
          this.playSFX('collect', 0.85);
          this.spawnCollectSparkles(col.x, col.y, '#fbbf24');
          this.floatingTexts.push({ x: col.x, y: col.y - 15, text: '+5 JADE!', color: '#fbbf24', life: 0.8 });
        } else if (col.type === 'word') {
          // Chinese word medallion
          const idx = col.wordIndex;
          if (!this.feverCollected[idx]) {
            this.feverCollected[idx] = true;
            this.score += 1000;
            const wordChar = this.feverWords[idx];
            profileManager.recordLearnedVocab(wordChar);
            const meaningLabel = (this.feverMeanings && this.feverMeanings[wordChar])
              ? `${wordChar} (${this.feverMeanings[wordChar]})`
              : `【${wordChar}】`;
            this.floatingTexts.push({ x: col.x, y: col.y - 20, text: meaningLabel, color: '#f59e0b', life: 1.4 });
            this.playSFX('collect', 0.9);
            this.spawnCollectSparkles(col.x, col.y, '#f59e0b');

            // Check if all words collected!
            if (this.feverCollected.every(Boolean)) {
              this.activateFever();
            }
          }
        } else if (col.type === 'shield') {
          p.shieldActive = true;
          this.playSFX('collect', 0.7);
          this.floatingTexts.push({ x: col.x, y: col.y, text: 'SHIELD!', color: '#38bdf8', life: 0.8 });
        } else if (col.type === 'magnet') {
          p.magnetTimer = 8.0;
          this.playSFX('collect', 0.7);
          this.floatingTexts.push({ x: col.x, y: col.y, text: 'MAGNET!', color: '#a855f7', life: 0.8 });
        } else if (col.type === 'heart') {
          if (p.hp < p.maxHp) p.hp++;
          this.playSFX('collect', 0.7);
          this.floatingTexts.push({ x: col.x, y: col.y, text: '+1 HP ❤️', color: '#ef4444', life: 0.8 });
        }

        this.collectibles.splice(i, 1);
        this.updateHUD();
        continue;
      }

      if (col.x + col.width < -100) {
        this.collectibles.splice(i, 1);
      }
    }

    // Scroll & update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.life -= dt;
      if (proj.life <= 0 || proj.x > this.V_WIDTH + 50) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 30 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 5. World Generation Spawner
    this.spawnChunks();

    // 6. Update HUD Display
    this.updateHUD();
  }

  activateFever() {
    this.feverActive = true;
    this.feverTimer = this.feverDuration;
    this.playSFX('fever', 0.9);

    // Spawn celebration burst
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: this.player.x + 20,
        y: this.player.y + 20,
        vx: (Math.random() - 0.5) * 600,
        vy: (Math.random() - 0.5) * 600,
        color: ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#ec4899'][Math.floor(Math.random() * 5)],
        size: 5 + Math.random() * 6,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.0
      });
    }

    // Spawn bonus fever jade trail right in front
    let startX = this.player.x + 250;
    for (let i = 0; i < 28; i++) {
      this.collectibles.push({
        type: i % 5 === 0 ? 'big_jade' : 'jade',
        x: startX + i * 45,
        y: this.GROUND_Y - 140 + Math.sin(i * 0.4) * 60,
        width: 26,
        height: 26,
        seed: i * 0.3
      });
    }

    this.floatingTexts.push({
      x: this.player.x + 60,
      y: this.player.y - 40,
      text: '⚡ FEVER TIME! ⚡',
      color: '#f59e0b',
      life: 1.5
    });
  }

  spawnChunks() {
    while (this.spawnCursor < this.V_WIDTH + 1400) {
      const chunkLen = 800 + Math.random() * 400;
      const isPit = Math.random() < 0.28 && this.distance > 80;

      if (isPit) {
        // Pit gap
        const pitWidth = 160 + Math.random() * 80;
        this.spawnCursor += pitWidth;

        // Platform after pit
        this.platforms.push({
          x: this.spawnCursor,
          y: this.GROUND_Y,
          width: chunkLen,
          height: 140
        });

        // Add jade arc over pit
        const arcCount = 6;
        for (let i = 0; i < arcCount; i++) {
          const t = i / (arcCount - 1);
          const jx = this.spawnCursor - pitWidth + 20 + t * (pitWidth - 40);
          const jy = this.GROUND_Y - 40 - Math.sin(t * Math.PI) * 110;
          this.collectibles.push({
            type: 'jade',
            x: jx,
            y: jy,
            width: 24,
            height: 24,
            seed: i * 0.4
          });
        }
      } else {
        // Flat ground or stepped platform
        const yPos = (Math.random() < 0.2 && this.distance > 150) ? this.GROUND_Y - 75 : this.GROUND_Y;
        this.platforms.push({
          x: this.spawnCursor,
          y: yPos,
          width: chunkLen,
          height: 140
        });

        // Place hazards, obstacles and collectibles on this platform
        this.populatePlatform(this.spawnCursor, chunkLen, yPos);
      }

      this.spawnCursor += chunkLen;
    }
  }

  populatePlatform(startX, length, groundY) {
    let cursor = startX + 150;
    const endX = startX + length - 150;

    while (cursor < endX) {
      const pattern = Math.floor(Math.random() * 5);

      if (pattern === 0) {
        // Ground Hazard: Clay Spore Urchin or Rolling Clay Boulder (Must Jump)
        const isBoulder = Math.random() < 0.45;
        this.obstacles.push({
          type: isBoulder ? 'boulder' : 'spike',
          x: cursor,
          y: isBoulder ? groundY - 48 : groundY - 44,
          width: isBoulder ? 48 : 52,
          height: isBoulder ? 48 : 44,
          rollAngle: 0
        });
        // Jades above hazard
        this.collectibles.push({
          type: 'jade',
          x: cursor + 12,
          y: groundY - 110,
          width: 24,
          height: 24,
          seed: Math.random() * Math.PI * 2
        });
        cursor += 240;
      } else if (pattern === 1) {
        // Overhead Barrier / Low Ceiling (MUST SLIDE!)
        this.obstacles.push({
          type: 'overhead_spike',
          x: cursor,
          y: groundY - 120,
          width: 140,
          height: 72
        });
        // Jades low to ground under barrier
        for (let j = 0; j < 3; j++) {
          this.collectibles.push({
            type: 'jade',
            x: cursor + 15 + j * 42,
            y: groundY - 24,
            width: 22,
            height: 22,
            seed: Math.random() * Math.PI * 2
          });
        }
        cursor += 280;
      } else if (pattern === 2) {
        // Ground Enemy (Bot or Walking Clay)
        this.enemies.push({
          type: 'ground',
          x: cursor,
          y: groundY - 58,
          width: 50,
          height: 58,
          vx: 30,
          seed: Math.random() * Math.PI * 2
        });
        cursor += 260;
      } else if (pattern === 3) {
        // Flying Enemy (Mid height, can slide or shoot)
        this.enemies.push({
          type: 'flying',
          x: cursor,
          y: groundY - 110,
          baseY: groundY - 110,
          width: 48,
          height: 40,
          vx: 0,
          seed: Math.random() * Math.PI * 2
        });
        cursor += 280;
      } else {
        // Chinese Word Letter / Powerup
        const uncollectedIndices = this.feverCollected
          .map((c, i) => (!c ? i : -1))
          .filter(i => i !== -1);

        if (uncollectedIndices.length > 0 && Math.random() < 0.6) {
          const chosenIdx = uncollectedIndices[Math.floor(Math.random() * uncollectedIndices.length)];
          this.collectibles.push({
            type: 'word',
            wordIndex: chosenIdx,
            char: this.feverWords[chosenIdx],
            x: cursor,
            y: groundY - 80,
            width: 38,
            height: 38,
            seed: Math.random() * Math.PI * 2
          });
        } else {
          // Normal Jade straight line
          for (let j = 0; j < 4; j++) {
            this.collectibles.push({
              type: 'jade',
              x: cursor + j * 36,
              y: groundY - 50,
              width: 24,
              height: 24,
              seed: j * 0.4
            });
          }
        }
        cursor += 240;
      }
    }
  }

  takeDamage(amount, reason) {
    if (this.feverActive || this.player.invulnerableTimer > 0) return;

    this.player.hp -= amount;
    this.player.invulnerableTimer = 1.2;

    this.playSFX('collapse', 0.7);

    // Red screen flash
    const overlay = document.getElementById('runner-damage-flash');
    if (overlay) {
      overlay.classList.add('flash');
      setTimeout(() => overlay.classList.remove('flash'), 300);
    }

    this.updateHUD();

    if (this.player.hp <= 0) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    this.running = false;
    if (this.runnerBgm) {
      try { this.runnerBgm.pause(); } catch (e) {}
    }
    this.playSFX('death', 0.85);

    // Sync collected Jade to the active student/Google profile
    if (this.jadeCollected > 0) {
      profileManager.addJade(this.jadeCollected);
    }
    const prof = profileManager.getActiveProfile();
    if (prof) {
      if (!prof.runnerStats) prof.runnerStats = { highScore: 0, totalRuns: 0 };
      prof.runnerStats.totalRuns = (prof.runnerStats.totalRuns || 0) + 1;
      if (this.score > (prof.runnerStats.highScore || 0)) {
        prof.runnerStats.highScore = this.score;
      }
      profileManager.saveUserData(prof);
    }

    // Show Game Over Modal
    const screen = document.getElementById('runner-game-over');
    if (screen) {
      screen.classList.remove('hidden');
      const distEl = document.getElementById('runner-final-dist');
      const jadeEl = document.getElementById('runner-final-jade');
      const scoreEl = document.getElementById('runner-final-score');
      if (distEl) distEl.textContent = `${Math.floor(this.distance)}m`;
      if (jadeEl) jadeEl.textContent = `${this.jadeCollected} 🟢`;
      if (scoreEl) scoreEl.textContent = `${this.score}`;
    }
  }

  checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  spawnJumpParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + 20,
        y: this.player.y + this.player.height,
        vx: (Math.random() - 0.5) * 160,
        vy: -20 - Math.random() * 50,
        color: '#e5e7eb',
        size: 3 + Math.random() * 3,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  spawnDoubleJumpRing() {
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      this.particles.push({
        x: this.player.x + 24,
        y: this.player.y + this.player.height - 10,
        vx: Math.cos(ang) * 180,
        vy: Math.sin(ang) * 90 + 20,
        color: '#38bdf8',
        size: 4 + Math.random() * 3,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  spawnSlideSparks() {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y + this.player.height,
        vx: -180 - Math.random() * 100,
        vy: -30 - Math.random() * 50,
        color: '#fbbf24',
        size: 3 + Math.random() * 3,
        life: 0.2,
        maxLife: 0.2
      });
    }
  }

  spawnCollectSparkles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: 3 + Math.random() * 3,
        life: 0.3,
        maxLife: 0.3
      });
    }
  }

  spawnExplosion(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 120 + Math.random() * 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: 4 + Math.random() * 4,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  updateHUD() {
    const distEl = document.getElementById('runner-dist-val');
    const jadeEl = document.getElementById('runner-jade-val');
    const hpEl = document.getElementById('runner-hp-val');

    if (distEl) distEl.textContent = `${Math.floor(this.distance)}m`;
    if (jadeEl) jadeEl.textContent = `${this.jadeCollected}`;
    if (hpEl) {
      let hearts = '';
      for (let i = 0; i < this.player.maxHp; i++) {
        hearts += i < this.player.hp ? '❤️' : '🖤';
      }
      hpEl.textContent = hearts;
    }

    // Update Fever Letter Badges (0..5)
    for (let idx = 0; idx < 6; idx++) {
      const badge = document.getElementById(`runner-letter-${idx}`);
      if (!badge) continue;
      if (idx < this.feverWords.length) {
        badge.style.display = 'inline-flex';
        badge.textContent = this.feverWords[idx];
        if (this.feverCollected[idx]) {
          badge.classList.add('collected');
        } else {
          badge.classList.remove('collected');
        }
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // --- RENDER PIPELINE ---
  render() {
    const ctx = this.ctx;
    const W = this.V_WIDTH;
    const H = this.V_HEIGHT;

    ctx.clearRect(0, 0, W, H);
    ctx.save();

    // 1. Sky & 2.5D Parallax Backgrounds
    this.drawBackground(ctx, W, H);

    // 2. 2.5D Textured Platforms & Ground
    this.drawPlatforms(ctx);

    // 3. 2.5D Obstacles (Bamboo Stakes & Ancient Lintel Traps)
    this.drawObstacles(ctx);

    // 4. 2.5D Faceted Crystal Jades & Golden Word Medallions
    this.drawCollectibles(ctx);

    // 5. 2.5D Animated Enemies
    this.drawEnemies(ctx);

    // 6. Talisman Projectiles
    this.drawProjectiles(ctx);

    // 7. Full 2.5D Character Model
    this.drawPlayer(ctx);

    // 8. Particles
    this.drawParticles(ctx);

    // 9. Floating texts
    this.drawFloatingTexts(ctx);

    // 10. Fever Rainbow Aura
    if (this.feverActive) {
      ctx.save();
      const hue = (performance.now() * 0.3) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 55%, 0.8)`;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      ctx.restore();
    }

    ctx.restore();
  }

  drawBackground(ctx, W, H) {
    // 1. Authentic Claybound Pastel Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#7bc4e2');    // Soft bright azure sky
    skyGrad.addColorStop(0.35, '#a5d8ea'); // Pastel cyan
    skyGrad.addColorStop(0.7, '#fed7aa');  // Warm peach horizon glow
    skyGrad.addColorStop(1, '#fff7ed');    // Warm dough cream
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Claybound World Art Panorama Parallax (0.15x speed)
    if (this.clayWorldBgLoaded && this.clayWorldBg) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      const bgW = Math.round(H * (this.clayWorldBg.width / this.clayWorldBg.height));
      const bgX = Math.round(-((this.distance * 18) % bgW));
      ctx.drawImage(this.clayWorldBg, bgX, 0, bgW, H);
      ctx.drawImage(this.clayWorldBg, bgX + bgW, 0, bgW, H);
      if (bgX + bgW < W) ctx.drawImage(this.clayWorldBg, bgX + bgW * 2, 0, bgW, H);
      ctx.restore();
    }

    // 3. Distant Rolling Clay Dunes (Pastel Lavender Layer, 0.25x speed)
    ctx.save();
    ctx.fillStyle = 'rgba(216, 180, 228, 0.65)'; // Soft pastel lavender
    ctx.beginPath();
    const lOffset = (this.distance * 32) % 360;
    ctx.moveTo(0, H - 280);
    for (let x = -60; x <= W + 120; x += 120) {
      const hillX = x - lOffset;
      ctx.quadraticCurveTo(hillX + 60, H - 350 + Math.sin((x + this.distance * 10) * 0.008) * 35, hillX + 120, H - 280);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Mid-Ground Rolling Dough Hills (Warm Apricot / Terracotta Clay, 0.5x speed)
    ctx.save();
    ctx.fillStyle = 'rgba(251, 146, 60, 0.45)'; // Warm clay peach/apricot
    ctx.beginPath();
    const mOffset = (this.distance * 64) % 280;
    ctx.moveTo(0, H - 200);
    for (let x = -70; x <= W + 140; x += 140) {
      const hillX = x - mOffset;
      ctx.quadraticCurveTo(hillX + 70, H - 250 + Math.cos(x * 0.012) * 28, hillX + 140, H - 200);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 5. Soft Claybound Warm Atmospheric Haze
    const hazeGrad = ctx.createLinearGradient(0, H - 180, 0, H);
    hazeGrad.addColorStop(0, 'rgba(255, 247, 237, 0)');
    hazeGrad.addColorStop(1, 'rgba(254, 215, 170, 0.5)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, H - 180, W, 180);
  }

  drawPlatforms(ctx) {
    for (const plat of this.platforms) {
      ctx.save();
      const px = Math.round(plat.x);
      const py = Math.round(plat.y);
      const pw = Math.round(plat.width);
      const ph = Math.round(plat.height);

      // 1. Soft Outer Clay Drop Shadow: box-shadow: 0 24px 40px rgba(15,23,42, .18)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.roundRect(px, py + 10, pw, ph, 18);
      ctx.fill();

      // 2. Sculpted Terracotta Modeling Clay Base
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 18);
      ctx.clip();

      const clayEarthGrad = ctx.createLinearGradient(px, py, px, py + ph);
      clayEarthGrad.addColorStop(0, '#ea580c'); // Warm terracotta clay
      clayEarthGrad.addColorStop(0.35, '#c2410c');
      clayEarthGrad.addColorStop(0.75, '#9a3412');
      clayEarthGrad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = clayEarthGrad;
      ctx.fillRect(px, py, pw, ph);

      // Horizontal clay strata bands (modeling clay dough layers)
      ctx.fillStyle = 'rgba(254, 215, 170, 0.18)';
      ctx.fillRect(px, py + 34, pw, 12);
      ctx.fillStyle = 'rgba(67, 20, 7, 0.22)';
      ctx.fillRect(px, py + 46, pw, 8);
      ctx.fillStyle = 'rgba(254, 215, 170, 0.12)';
      ctx.fillRect(px, py + 78, pw, 14);

      // Embedded smooth rounded pastel clay pebbles
      const pebbleColors = ['#fef08a', '#a7f3d0', '#fed7aa', '#fbcfe8', '#bae6fd'];
      for (let bx = px + 35; bx < px + pw - 25; bx += 65) {
        const pby = py + 42 + Math.sin(bx * 0.08) * 16;
        const colIdx = Math.abs(Math.floor(Math.sin(bx) * 5)) % 5;
        ctx.fillStyle = pebbleColors[colIdx];
        ctx.beginPath();
        ctx.ellipse(bx, pby, 7, 4.5, Math.sin(bx) * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Pebble inner light highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(bx - 2, pby - 1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dual inner shadows for clay depth:
      const botInner = ctx.createLinearGradient(px, py + ph - 24, px, py + ph);
      botInner.addColorStop(0, 'rgba(67, 20, 7, 0)');
      botInner.addColorStop(1, 'rgba(67, 20, 7, 0.4)');
      ctx.fillStyle = botInner;
      ctx.fillRect(px, py + ph - 24, pw, 24);

      ctx.restore(); // end clip

      // 3. Pillowy Rounded Clay Moss Cushion on Top (Overlapping soft dough mounds, NO sharp spikes!)
      const moundR = 14;
      ctx.save();
      const mossGrad = ctx.createLinearGradient(px, py - 4, px, py + 22);
      mossGrad.addColorStop(0, '#86efac'); // pastel mint/light green
      mossGrad.addColorStop(0.5, '#4ade80');
      mossGrad.addColorStop(1, '#16a34a');
      ctx.fillStyle = mossGrad;

      // Puffy overlapping rounded dough mounds
      ctx.beginPath();
      ctx.moveTo(px, py + 22);
      ctx.lineTo(px, py + 4);
      for (let mx = px; mx <= px + pw; mx += moundR * 1.6) {
        ctx.quadraticCurveTo(mx + moundR * 0.8, py - 8, mx + moundR * 1.6, py + 4);
      }
      ctx.lineTo(px + pw, py + 22);
      ctx.closePath();
      ctx.fill();

      // Top specular highlight along the puffy mounds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let mx = px + 3; mx <= px + pw - moundR; mx += moundR * 1.6) {
        ctx.moveTo(mx + 2, py);
        ctx.quadraticCurveTo(mx + moundR * 0.8, py - 6, mx + moundR * 1.4, py);
      }
      ctx.stroke();

      // Moss bottom dark rim
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py + 22);
      ctx.lineTo(px + pw, py + 22);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    }
  }

  drawObstacles(ctx) {
    for (const obs of this.obstacles) {
      ctx.save();
      const ox = Math.round(obs.x);
      const oy = Math.round(obs.y);
      const ow = Math.round(obs.width);
      const oh = Math.round(obs.height);

      if (obs.type === 'spike') {
        // --- AUTHENTIC CLAYBOUND SPORE URCHIN / PUFFY BRIAR POD ---
        // Plump doughy cushion base + 5 bulbous puffy clay horns with soft rounded tips and glowing spore center
        const cx = ox + ow / 2;
        const cy = oy + oh - 8;
        const breath = Math.sin(this.gameTime * 4.5 + ox * 0.05) * 2;

        // 1. Soft outer drop shadow: box-shadow: 0 16px 28px rgba(15,23,42,0.18)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx, oy + oh + 2, ow * 0.55, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bulbous Puffy Clay Horns (5 radiating organic dough horns)
        const hornConfigs = [
          { angle: -Math.PI * 0.85, len: oh * 0.65, baseW: 14, tipR: 4.5 },
          { angle: -Math.PI * 0.65, len: oh * 0.95 + breath, baseW: 16, tipR: 5.5 },
          { angle: -Math.PI * 0.5,  len: oh + breath * 1.2, baseW: 18, tipR: 6 },
          { angle: -Math.PI * 0.35, len: oh * 0.95 + breath, baseW: 16, tipR: 5.5 },
          { angle: -Math.PI * 0.15, len: oh * 0.65, baseW: 14, tipR: 4.5 }
        ];

        for (const h of hornConfigs) {
          ctx.save();
          const tipX = cx + Math.cos(h.angle) * h.len;
          const tipY = cy + Math.sin(h.angle) * h.len;
          const perp = h.angle + Math.PI / 2;
          const baseL = { x: cx + Math.cos(perp) * (h.baseW / 2), y: cy + Math.sin(perp) * (h.baseW / 2) };
          const baseR = { x: cx - Math.cos(perp) * (h.baseW / 2), y: cy - Math.sin(perp) * (h.baseW / 2) };

          ctx.beginPath();
          ctx.moveTo(baseL.x, baseL.y);
          ctx.quadraticCurveTo(cx + Math.cos(h.angle) * (h.len * 0.5) + Math.cos(perp) * 6,
                              cy + Math.sin(h.angle) * (h.len * 0.5) + Math.sin(perp) * 6,
                              tipX + Math.cos(perp) * h.tipR, tipY + Math.sin(perp) * h.tipR);
          ctx.arc(tipX, tipY, h.tipR, perp, perp + Math.PI);
          ctx.quadraticCurveTo(cx + Math.cos(h.angle) * (h.len * 0.5) - Math.cos(perp) * 6,
                              cy + Math.sin(h.angle) * (h.len * 0.5) - Math.sin(perp) * 6,
                              baseR.x, baseR.y);
          ctx.closePath();

          // Pastel Strawberry / Raspberry Clay Gradient
          const hornGrad = ctx.createLinearGradient(cx, cy, tipX, tipY);
          hornGrad.addColorStop(0, '#f43f5e');
          hornGrad.addColorStop(0.6, '#fb7185');
          hornGrad.addColorStop(1, '#fda4af');
          ctx.fillStyle = hornGrad;
          ctx.fill();

          // Top specular highlight along the horn
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(h.angle) * 10, cy + Math.sin(h.angle) * 10);
          ctx.lineTo(tipX - Math.cos(h.angle) * 3, tipY - Math.sin(h.angle) * 3);
          ctx.stroke();

          // Outline contour
          ctx.strokeStyle = '#be185d';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // 3. Central Dough Cushion Pod
        ctx.save();
        const baseGrad = ctx.createRadialGradient(cx - 3, cy - 6, 2, cx, cy, ow * 0.45);
        baseGrad.addColorStop(0, '#fda4af');
        baseGrad.addColorStop(0.5, '#f43f5e');
        baseGrad.addColorStop(1, '#9f1239');
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, ow * 0.42, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 4. Central Glowing Spore Nucleus / Bead
        const sporePulse = 6 + Math.sin(this.gameTime * 5 + ox) * 1.5;
        const sporeGrad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, sporePulse);
        sporeGrad.addColorStop(0, '#ffffff');
        sporeGrad.addColorStop(0.4, '#fef08a');
        sporeGrad.addColorStop(0.8, '#f59e0b');
        sporeGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = sporeGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, sporePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Porous clay dimples on the pod
        const dimples = [
          { dx: -12, dy: -2 },
          { dx: 13, dy: -1 },
          { dx: -6, dy: 6 },
          { dx: 8, dy: 7 }
        ];
        for (const d of dimples) {
          ctx.fillStyle = 'rgba(159, 18, 57, 0.45)';
          ctx.beginPath();
          ctx.arc(cx + d.dx, cy + d.dy, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(cx + d.dx - 0.7, cy + d.dy - 0.7, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

      } else if (obs.type === 'boulder') {
        // --- AUTHENTIC CLAYBOUND MARBLED CANYON BOULDER ---
        // Rolling layered clay sphere with terracotta & peach marbled swirls, soft drop shadow, and rotation
        const cx = ox + ow / 2;
        const cy = oy + oh / 2;
        const r = ow * 0.48;
        const roll = obs.rollAngle || 0;

        // 1. Soft outer drop shadow beneath rolling boulder
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.beginPath();
        ctx.ellipse(cx, oy + oh + 2, r * 1.05, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rolling Marbled Clay Sphere
        ctx.save();
        ctx.translate(cx, cy);

        // Body clip for sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.clip();

        // Base clay gradient
        const bGrad = ctx.createLinearGradient(-r, -r, r, r);
        bGrad.addColorStop(0, '#fdba74'); // warm peach
        bGrad.addColorStop(0.5, '#ea580c'); // terracotta clay
        bGrad.addColorStop(1, '#9a3412'); // burnt earth
        ctx.fillStyle = bGrad;
        ctx.fillRect(-r, -r, r * 2, r * 2);

        // Rotating marbled clay dough layers
        ctx.save();
        ctx.rotate(roll);
        ctx.strokeStyle = '#fef08a'; // custard cream swirl
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.8, r * 0.45, 0.4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#7c2d12'; // deep chocolate clay vein
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.65, r * 0.25, -0.3, 0, Math.PI * 2);
        ctx.stroke();

        // Clay dimples that rotate
        ctx.fillStyle = 'rgba(124, 45, 18, 0.5)';
        ctx.beginPath();
        ctx.arc(-8, -6, 3, 0, Math.PI * 2);
        ctx.arc(9, 7, 3.5, 0, Math.PI * 2);
        ctx.arc(4, -12, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. Two Inner Shadows (Claymorphic lighting stays fixed to world light source):
        // Inner shadow top specular highlight: inset 0 8px 16px rgba(255,255,255,.55)
        const bTopLight = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r);
        bTopLight.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        bTopLight.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
        bTopLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = bTopLight;
        ctx.fillRect(-r, -r, r * 2, r * 2);

        // Inner shadow bottom darker shade: inset 0 -8px 16px rgba(0,0,0,.15)
        const bBotShade = ctx.createRadialGradient(r * 0.3, r * 0.4, 2, 0, 0, r);
        bBotShade.addColorStop(0, 'rgba(67, 20, 7, 0.45)');
        bBotShade.addColorStop(0.6, 'rgba(67, 20, 7, 0.15)');
        bBotShade.addColorStop(1, 'rgba(67, 20, 7, 0)');
        ctx.fillStyle = bBotShade;
        ctx.fillRect(-r, -r, r * 2, r * 2);

        ctx.restore(); // end clip

        // Outline contour
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

      } else if (obs.type === 'overhead_spike') {
        // --- AUTHENTIC CLAYBOUND OVERHEAD LINTEL & HANGING BEADS ---
        // Chunky clay lintel with 22px oversized corner radii + real Claybound beads hanging on bouncy cords
        const rad = 18;
        const beamH = 26;

        // 1. Soft outer drop shadow: box-shadow: 0 20px 32px rgba(15,23,42,0.18)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.roundRect(ox, oy + 8, ow, beamH, rad);
        ctx.fill();

        // 2. Base Pastel Clay Lintel (Soft Bubblegum / Strawberry)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(ox, oy, ow, beamH, rad);

        const beamGrad = ctx.createLinearGradient(ox, oy, ox, oy + beamH);
        beamGrad.addColorStop(0, '#fbcfe8');
        beamGrad.addColorStop(0.5, '#f472b6');
        beamGrad.addColorStop(1, '#db2777');
        ctx.fillStyle = beamGrad;
        ctx.fill();

        // Top inner highlight: inset 0 8px 16px rgba(255,255,255,.55)
        const beamTopGrad = ctx.createLinearGradient(ox, oy, ox, oy + 12);
        beamTopGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        beamTopGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamTopGrad;
        ctx.fill();

        // Bottom inner shadow: inset 0 -8px 16px rgba(0,0,0,.15)
        const beamBotGrad = ctx.createLinearGradient(ox, oy + 14, ox, oy + beamH);
        beamBotGrad.addColorStop(0, 'rgba(131, 24, 67, 0)');
        beamBotGrad.addColorStop(1, 'rgba(131, 24, 67, 0.3)');
        ctx.fillStyle = beamBotGrad;
        ctx.fill();

        ctx.strokeStyle = '#be185d';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();

        // 3. Hanging Claybound Beads / Dough Bells (must slide under!)
        const count = 3;
        const step = ow / count;
        for (let i = 0; i < count; i++) {
          const hx = Math.round(ox + step * (i + 0.5));
          const sway = Math.sin(this.gameTime * 3.5 + i * 1.2) * 4;

          // Clay dough cord
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(hx, oy + beamH);
          ctx.lineTo(hx + sway, oy + oh - 20);
          ctx.stroke();

          // Render real Claybound Bead if available, or glowing clay bell
          const dropR = 13;
          const dropY = oy + oh - dropR - 2;

          // Shadow for hanging bead
          ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
          ctx.beginPath();
          ctx.ellipse(hx + sway, dropY + dropR + 2, dropR * 0.9, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          if (this.clayBeadLoaded && this.clayBeadImg) {
            const bSize = dropR * 2.2;
            ctx.save();
            ctx.translate(hx + sway, dropY);
            ctx.drawImage(this.clayBeadImg, -bSize / 2, -bSize / 2, bSize, bSize);
            ctx.restore();
          } else {
            const ballGrad = ctx.createRadialGradient(hx + sway - 3, dropY - 3, 2, hx + sway, dropY, dropR);
            ballGrad.addColorStop(0, '#fef9c3');
            ballGrad.addColorStop(0.4, '#fde047');
            ballGrad.addColorStop(1, '#ca8a04');
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(hx + sway, dropY, dropR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#a16207';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(hx + sway, dropY + dropR - 1, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 4. Chunky Clay Button Badge: "⬇️ SLIDE / มุด"
        // Oversized corner radius (14px on 26px height), pastel butter-yellow, high contrast chunky text
        const badgeW = 96;
        const badgeH = 26;
        const badgeX = ox + ow / 2 - badgeW / 2;
        const badgeY = oy - 4;

        // Outer drop shadow for badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY + 4, badgeW, badgeH, 13);
        ctx.fill();

        // Badge base (Pastel Butter Yellow #fef08a)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
        const btnGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
        btnGrad.addColorStop(0, '#fffbeb');
        btnGrad.addColorStop(0.5, '#fef08a');
        btnGrad.addColorStop(1, '#fde047');
        ctx.fillStyle = btnGrad;
        ctx.fill();

        // Top inner highlight: inset 0 8px 16px rgba(255,255,255,.55)
        const btnTopLight = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + 10);
        btnTopLight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        btnTopLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = btnTopLight;
        ctx.fill();

        // Bottom inner shadow: inset 0 -8px 16px rgba(0,0,0,.15)
        const btnBotShade = ctx.createLinearGradient(badgeX, badgeY + 14, badgeX, badgeY + badgeH);
        btnBotShade.addColorStop(0, 'rgba(180, 83, 9, 0)');
        btnBotShade.addColorStop(1, 'rgba(180, 83, 9, 0.25)');
        ctx.fillStyle = btnBotShade;
        ctx.fill();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Chunky friendly typography with 4.5:1 contrast (#78350f on yellow = 7.2:1 contrast!)
        ctx.fillStyle = '#78350f';
        ctx.font = '900 13px "Mali", "Patrick Hand", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⬇️ SLIDE / มุด', ox + ow / 2, badgeY + badgeH / 2 + 1);
      }

      ctx.restore();
    }
  }

  drawCollectibles(ctx) {
    for (const col of this.collectibles) {
      ctx.save();

      const seed = col.seed || 0;
      const bob = Math.sin(this.gameTime * 3.5 + seed) * 5;
      const cx = Math.round(col.x + col.width / 2);
      const cy = Math.round(col.y + col.height / 2 + bob);

      if (col.type === 'jade' || col.type === 'big_jade') {
        // AUTHENTIC 2.5D SPINNING FACETED CRYSTAL (From JadeShard.draw)
        const isBig = col.type === 'big_jade';
        const spin = this.gameTime * 3.2 + seed;
        const spinCos = Math.cos(spin);

        // 1. Perspective drop shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.ellipse(cx, this.GROUND_Y - 2, isBig ? 14 : 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Glowing celestial jade halo
        const glowRad = isBig ? 24 : 16;
        const haloGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, glowRad);
        if (isBig) {
          haloGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
          haloGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          haloGrad.addColorStop(0, 'rgba(52, 211, 153, 0.65)');
          haloGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // 3. Render Authentic Claybound Bead or 2.5D Faceted Crystal Gemstone
        if (this.clayBeadLoaded) {
          const beadSize = isBig ? 32 : 22;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(Math.sin(this.gameTime * 2.5 + seed) * 0.14);
          ctx.drawImage(this.clayBeadImg, -beadSize / 2, -beadSize / 2, beadSize, beadSize);
          ctx.restore();
        } else {
          const halfW = isBig ? 15 : 10;
          const halfH = isBig ? 20 : 14;
          const ridgeX = cx + spinCos * halfW;
          const topY = cy - halfH;
          const botY = cy + halfH;
          const leftX = cx - halfW;
          const rightX = cx + halfW;
          const midY = cy + Math.sin(spin) * 2;

          // Left Facet
          const leftGrad = ctx.createLinearGradient(leftX, topY, ridgeX, botY);
          if (isBig) {
            leftGrad.addColorStop(0, '#b45309');
            leftGrad.addColorStop(0.5, '#f59e0b');
            leftGrad.addColorStop(1, '#d97706');
          } else {
            leftGrad.addColorStop(0, '#065f46');
            leftGrad.addColorStop(0.5, '#10b981');
            leftGrad.addColorStop(1, '#047857');
          }
          ctx.fillStyle = leftGrad;
          ctx.beginPath();
          ctx.moveTo(cx, topY);
          ctx.lineTo(leftX, midY);
          ctx.lineTo(cx, botY);
          ctx.lineTo(ridgeX, midY);
          ctx.closePath();
          ctx.fill();

          // Right Facet
          const rightGrad = ctx.createLinearGradient(ridgeX, topY, rightX, botY);
          if (isBig) {
            rightGrad.addColorStop(0, '#fef08a');
            rightGrad.addColorStop(0.5, '#fbbf24');
            rightGrad.addColorStop(1, '#d97706');
          } else {
            rightGrad.addColorStop(0, '#6ee7b7');
            rightGrad.addColorStop(0.5, '#34d399');
            rightGrad.addColorStop(1, '#059669');
          }
          ctx.fillStyle = rightGrad;
          ctx.beginPath();
          ctx.moveTo(cx, topY);
          ctx.lineTo(ridgeX, midY);
          ctx.lineTo(cx, botY);
          ctx.lineTo(rightX, midY);
          ctx.closePath();
          ctx.fill();

          // Edge highlights
          ctx.strokeStyle = isBig ? '#fef08a' : '#a7f3d0';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx, topY);
          ctx.lineTo(ridgeX, midY);
          ctx.lineTo(cx, botY);
          ctx.stroke();
        }
      } else if (col.type === 'word') {
        // 2.5D GOLDEN TAOIST MEDALLION ORB
        const pulse = 1 + Math.sin(this.gameTime * 4 + seed) * 0.06;

        // Golden aura
        const aGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 32);
        aGrad.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
        aGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
        aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();

        // Outer coin disk
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(cx, cy, 21 * pulse, 0, Math.PI * 2);
        ctx.fill();

        const goldGrad = ctx.createLinearGradient(cx - 18, cy - 18, cx + 18, cy + 18);
        goldGrad.addColorStop(0, '#fef08a');
        goldGrad.addColorStop(0.4, '#f59e0b');
        goldGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = goldGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Chinese character inside
        ctx.fillStyle = '#451a03';
        ctx.font = `bold ${Math.floor(22 * pulse)}px "Kalam", "Mali", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(col.char, cx, cy + 1);
      }

      ctx.restore();
    }
  }

  drawEnemies(ctx) {
    for (const en of this.enemies) {
      ctx.save();
      const cx = Math.round(en.x + en.width / 2);
      const cy = Math.round(en.y + en.height / 2);
      const seed = en.seed || 0;

      if (en.type === 'ground') {
        // --- AUTHENTIC CLAYBOUND SPORE PUFFLING ---
        // Pillowy, squishy mint dough creature with cute clay sprout/flower bud on head,
        // bouncy walking feet, glossy bead eyes, and pink blush cheeks (NO clockwork toy parts!)
        const hop = Math.abs(Math.sin(this.gameTime * 7 + seed)) * 10;
        const squashX = 1 + (hop > 2 ? -0.1 : 0.14);
        const squashY = 1 + (hop > 2 ? 0.1 : -0.14);
        const r = 24;

        // 1. Dynamic ground shadow that scales with hop height
        const shadowScale = Math.max(0.4, 1 - hop / 25);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx, this.GROUND_Y - 2, en.width * 0.48 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(cx, Math.round(cy - hop));
        ctx.scale(squashX, squashY);

        // 2. Stubby Clay Feet (Pattering / stepping along)
        const stepCycle = Math.sin(this.gameTime * 14 + seed);
        ctx.fillStyle = '#059669';
        // Left foot
        ctx.beginPath();
        ctx.ellipse(-9, r - 2 + stepCycle * 3, 6, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Right foot
        ctx.beginPath();
        ctx.ellipse(9, r - 2 - stepCycle * 3, 6, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3. Base Pastel Mint Body Fill
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);

        const clayGrad = ctx.createLinearGradient(0, -r, 0, r);
        clayGrad.addColorStop(0, '#a7f3d0'); // pastel mint highlight
        clayGrad.addColorStop(0.5, '#6ee7b7');
        clayGrad.addColorStop(1, '#10b981'); // warm dough base
        ctx.fillStyle = clayGrad;
        ctx.fill();

        // 4. Two Inner Shadows (Defining Claymorphic Signal):
        // A) Bottom Inner Shadow: inset 0 -8px 16px rgba(x, .15)
        const botInnerGrad = ctx.createRadialGradient(0, r * 0.7, 2, 0, 0, r);
        botInnerGrad.addColorStop(0, 'rgba(4, 120, 87, 0.35)');
        botInnerGrad.addColorStop(0.6, 'rgba(4, 120, 87, 0.12)');
        botInnerGrad.addColorStop(1, 'rgba(4, 120, 87, 0)');
        ctx.fillStyle = botInnerGrad;
        ctx.fill();

        // B) Top Inner Specular Highlight: inset 0 8px 16px rgba(255,255,255, .55)
        const topInnerGrad = ctx.createRadialGradient(-7, -10, 2, 0, 0, r);
        topInnerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        topInnerGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
        topInnerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = topInnerGrad;
        ctx.fill();

        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();

        // 5. Head Sprout / Spore Bulb (Living dough creature from Claybound!)
        ctx.save();
        const sway = Math.sin(this.gameTime * 7 + seed) * 4;
        // Sprout green stem
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -r + 2);
        ctx.quadraticCurveTo(sway * 0.5, -r - 8, sway, -r - 14);
        ctx.stroke();

        // Two little rounded clay leaves
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.ellipse(sway - 4, -r - 9, 4.5, 2.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(sway + 4, -r - 9, 4.5, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glowing spore flower bud / clay bead atop head
        const budGrad = ctx.createRadialGradient(sway - 1, -r - 16, 1, sway, -r - 15, 6);
        budGrad.addColorStop(0, '#fef08a');
        budGrad.addColorStop(0.5, '#f43f5e');
        budGrad.addColorStop(1, '#be185d');
        ctx.fillStyle = budGrad;
        ctx.beginPath();
        ctx.arc(sway, -r - 15, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // 6. Chunky Friendly Eyes & Cheeks
        // Glossy black clay bead eyes with dual white reflections
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(7, -3, 4.2, 0, Math.PI * 2);
        ctx.fill();
        // White specular reflections
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8.5, -4.5, 1.7, 0, Math.PI * 2);
        ctx.arc(6, -1.8, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Sweet pastel pink blush cheek
        ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
        ctx.beginPath();
        ctx.ellipse(10, 5, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute smiling dough mouth
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(6, 2, 3.5, 0.1 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

      } else if (en.type === 'flying') {
        // --- AUTHENTIC CLAYBOUND CLAY BAT / SPORE DRIFTER ---
        // Puffy pastel lavender / lilac clay body with thick doughy scalloped wings
        const flap = Math.sin(this.gameTime * 11 + seed) * 11;
        ctx.translate(cx, cy);

        // 1. Chunky Rounded Dough Wings (Oversized rounded scalloped lobes)
        ctx.save();
        const wingGrad = ctx.createLinearGradient(0, -15, 0, 15);
        wingGrad.addColorStop(0, '#f5d0fe');
        wingGrad.addColorStop(0.5, '#e879f9');
        wingGrad.addColorStop(1, '#c026d3');
        ctx.fillStyle = wingGrad;

        // Left rounded scalloped wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-18, flap - 14, -32, flap * 0.5);
        ctx.quadraticCurveTo(-26, 12, -14, 8);
        ctx.quadraticCurveTo(-6, 6, 0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#a21caf';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Right rounded scalloped wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(18, flap - 14, 32, flap * 0.5);
        ctx.quadraticCurveTo(26, 12, 14, 8);
        ctx.quadraticCurveTo(6, 6, 0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#a21caf';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();

        // 2. Chunky Pastel Lavender Body (radius 17)
        const br = 17;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, br, 0, Math.PI * 2);

        const bodyGrad = ctx.createLinearGradient(0, -br, 0, br);
        bodyGrad.addColorStop(0, '#e9d5ff'); // pastel lilac top
        bodyGrad.addColorStop(0.5, '#c084fc');
        bodyGrad.addColorStop(1, '#9333ea');
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Dual Inner Shadows:
        const fBotGrad = ctx.createRadialGradient(0, br * 0.6, 2, 0, 0, br);
        fBotGrad.addColorStop(0, 'rgba(88, 28, 135, 0.35)');
        fBotGrad.addColorStop(0.6, 'rgba(88, 28, 135, 0.12)');
        fBotGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');
        ctx.fillStyle = fBotGrad;
        ctx.fill();

        const fTopGrad = ctx.createRadialGradient(-5, -6, 1, 0, 0, br);
        fTopGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        fTopGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
        fTopGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = fTopGrad;
        ctx.fill();

        ctx.strokeStyle = '#7e22ce';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();

        // Cream dough belly patch
        ctx.fillStyle = '#faf5ff';
        ctx.beginPath();
        ctx.ellipse(0, 4, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8b4e2';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Cute rounded clay bat ears with inner pink folds
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(-8, -br + 3, 5, 0, Math.PI * 2);
        ctx.arc(8, -br + 3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7e22ce';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(-8, -br + 3, 2.5, 0, Math.PI * 2);
        ctx.arc(8, -br + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Chunky Friendly Eyes & Cheeks
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(5, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        // White glossy sparkles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6.5, -3.5, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Pastel blush
        ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
        ctx.beginPath();
        ctx.ellipse(7, 4, 4, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow beneath drifter
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, this.GROUND_Y - cy - 2, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawProjectiles(ctx) {
    for (const proj of this.projectiles) {
      ctx.save();
      const px = Math.round(proj.x);
      const py = Math.round(proj.y);

      // Glowing Taoist Energy Talisman
      const pGrad = ctx.createLinearGradient(px, py, px + proj.width, py);
      pGrad.addColorStop(0, '#fef08a');
      pGrad.addColorStop(0.5, '#f59e0b');
      pGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = pGrad;

      ctx.beginPath();
      ctx.roundRect(px, py, proj.width, proj.height, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cinnabar symbol
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px + 6, py + 4, proj.width - 12, proj.height - 8);

      ctx.restore();
    }
  }

  drawPlayer(ctx) {
    const p = this.player;
    ctx.save();

    // Damage flicker
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 12) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const cx = Math.round(p.x + p.width / 2);
    const cy = Math.round(p.y + p.height / 2);

    // 1. Perspective Drop Shadow beneath player
    const shadowDist = Math.max(0, this.GROUND_Y - (p.y + p.height));
    const shadowScale = Math.max(0.3, 1 - shadowDist / 140);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, Math.min(this.GROUND_Y, Math.round(p.y + p.height)) + 2, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Shield Bubble
    if (p.shieldActive) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render High-Quality 2.5D Character Model
    if (typeof window.drawCharacterModel === 'function') {
      ctx.save();
      ctx.translate(cx, cy);

      const charId = (window.game && window.game.selectedCharacter) ? window.game.selectedCharacter : 1;
      const size = 26;

      if (p.isSliding) {
        // Sleek forward slide posture with lowered center of gravity
        ctx.translate(0, 10);
        ctx.rotate(0.38);
        window.drawCharacterModel(ctx, charId, size * 0.95, false, 0, 0, 1.25, 0.65);
      } else if (!p.isGrounded) {
        // Jumping squash and stretch
        window.drawCharacterModel(ctx, charId, size, false, this.gameTime * 8, 0, 0.88, 1.18);
      } else {
        // Running gait with bouncing cycle - use gameTime for smooth continuous stride
        const runCycle = this.gameTime * 14;
        const sqX = 1 + Math.sin(runCycle) * 0.05;
        const sqY = 1 - Math.sin(runCycle) * 0.05;
        window.drawCharacterModel(ctx, charId, size, false, runCycle, 2.0, sqX, sqY);
      }
      ctx.restore();
    } else {
      // Fallback toon body
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(Math.round(p.x), Math.round(p.y), p.width, p.height, 14);
      ctx.fill();
    }

    ctx.restore();
  }

  drawParticles(ctx) {
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = 'bold 20px "Kalam", "Patrick Hand", "Mali", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
