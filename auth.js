/**
 * auth.js
 * Jade Ascent: Google Authentication, Student Profile Manager, and Cloud/Local Save System
 */

const SAVE_KEY_PREFIX = 'jade_save_';
const PROFILES_INDEX_KEY = 'jade_profiles_index';
const ACTIVE_PROFILE_KEY = 'jade_active_profile_id';
const GOOGLE_CLIENT_ID_KEY = 'jade_google_client_id';

// Default Google OAuth Client ID (Can be overridden by teacher via settings modal)
export const DEFAULT_GOOGLE_CLIENT_ID = '33182604085-sample.apps.googleusercontent.com';

export const DEFAULT_AVATARS = [
  { id: 'panda', name: 'แพนด้า', emoji: '🐼', color: '#10b981' },
  { id: 'monkey', name: 'วานรเมฆา', emoji: '🐒', color: '#f59e0b' },
  { id: 'turtle', name: 'ปู่เต่าเซียน', emoji: '🐢', color: '#3b82f6' },
  { id: 'tiger', name: 'พยัคฆ์ขาว', emoji: '🐯', color: '#ef4444' },
  { id: 'dragon', name: 'มังกรหยก', emoji: '🐉', color: '#8b5cf6' },
  { id: 'fox', name: 'จิ้งจอกเก้าหาง', emoji: '🦊', color: '#f97316' },
  { id: 'rabbit', name: 'กระต่ายจันทร์', emoji: '🐰', color: '#ec4899' },
  { id: 'cat', name: 'แมวกวัก', emoji: '🐱', color: '#eab308' },
  { id: 'lion', name: 'สิงโตมงคล', emoji: '🦁', color: '#d97706' },
  { id: 'crane', name: 'กระเรียนขาว', emoji: '🪿', color: '#06b6d4' },
  { id: 'frog', name: 'คางคกทอง', emoji: '🐸', color: '#84cc16' },
  { id: 'fish', name: 'ปลาหลี่ฮื้อ', emoji: '🐟', color: '#0ea5e9' },
  { id: 'butterfly', name: 'ผีเสื้อเซียน', emoji: '🦋', color: '#a855f7' },
  { id: 'peacock', name: 'นกยูงสวรรค์', emoji: '🦚', color: '#14b8a6' },
  { id: 'owl', name: 'นกฮูกปราชญ์', emoji: '🦉', color: '#64748b' },
  { id: 'eagle', name: 'อินทรีเวหา', emoji: '🦅', color: '#78350f' },
  { id: 'horse', name: 'ม้าพันลี้', emoji: '🐎', color: '#b45309' },
  { id: 'bear', name: 'หมีภูผา', emoji: '🐻', color: '#92400e' },
  { id: 'dog', name: 'ชิบะนำโชค', emoji: '🐶', color: '#f59e0b' },
  { id: 'qilin', name: 'กิเลนสวรรค์', emoji: '🦄', color: '#6366f1' },
  { id: 'sage', name: 'เซียนพู่กัน', emoji: '🖌️', color: '#ec4899' },
  { id: 'lantern', name: 'โคมเต็งลั้ง', emoji: '🏮', color: '#dc2626' },
  { id: 'fan', name: 'พัดวิเศษ', emoji: '🪭', color: '#e11d48' },
  { id: 'bamboo', name: 'ไผ่มงคล', emoji: '🎋', color: '#16a34a' },
  { id: 'peach', name: 'ท้อสวรรค์', emoji: '🍑', color: '#fb7185' }
];

export function createDefaultSaveData(userId, name, authType = 'student', avatar = '🐼') {
  return {
    userId,
    name: name || 'นักเรียนเซียน',
    authType, // 'student' | 'google'
    avatar: avatar || '🐼',
    createdAt: Date.now(),
    lastLogin: Date.now(),
    jade: 0,
    levelProgress: {
      unlockedLevel: 1,
      highestMilestone: 0
    },
    upgrades: {
      jump: 0,
      speed: 0,
      doublejump: 0,
      float: 0,
      shooting: 0
    },
    selectedCharacter: 1,
    unlockedCharacters: [1, 2, 3, 4, 5, 6],
    runnerStats: {
      highScore: 0,
      totalRuns: 0
    },
    arenaStats: {
      matchesPlayed: 0,
      wins: 0,
      adventureCleared: []
    },
    sanctuary: {
      innLevel: 1,
      lastHarvestTime: Date.now(),
      unlockedPets: ['baby_panda'],
      activePet: 'baby_panda',
      decorations: ['lantern'],
      learnedVocab: []
    }
  };
}

export class ProfileManager {
  constructor() {
    this.activeProfile = null;
    this.changeListeners = [];
    this.gisLoaded = false;
  }

  init() {
    // 1. Ensure at least one default student profile exists if empty
    let index = this.getProfilesIndex();
    let activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);

    if (index.length === 0) {
      const defaultUser = createDefaultSaveData('student_default', 'นักเรียนคนเก่ง', 'student', '🐼');
      this.saveUserData(defaultUser);
      index = [{ id: defaultUser.userId, name: defaultUser.name, authType: 'student', avatar: defaultUser.avatar }];
      this.saveProfilesIndex(index);
      activeId = defaultUser.userId;
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeId);
    }

    if (!activeId || !index.some(p => p.id === activeId)) {
      activeId = index[0].id;
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeId);
    }

    this.activeProfile = this.loadUserData(activeId);
    if (!this.activeProfile) {
      this.activeProfile = createDefaultSaveData(activeId, 'นักเรียนคนเก่ง', 'student', '🐼');
      this.saveUserData(this.activeProfile);
    }

    // 2. Initialize Google Identity Services if available
    this.setupGoogleIdentity();

    // 3. Sync existing profiles to backend for Parent/Admin Dashboard
    this.syncAllProfilesToServer();

    // 4. Emit initial change
    this.notifyChange();
    return this.activeProfile;
  }

  syncProfileToServer(userData) {
    if (!userData || !userData.userId) return;
    try {
      fetch('./api.php?action=sync_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userData })
      }).catch(() => {});
    } catch (_) {}
  }

  syncAllProfilesToServer() {
    try {
      const index = this.getProfilesIndex();
      index.forEach(item => {
        const fullData = this.loadUserData(item.id);
        if (fullData) {
          this.syncProfileToServer(fullData);
        }
      });
    } catch (_) {}
  }

  getProfilesIndex() {
    try {
      const raw = localStorage.getItem(PROFILES_INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  saveProfilesIndex(index) {
    localStorage.setItem(PROFILES_INDEX_KEY, JSON.stringify(index));
  }

  loadUserData(userId) {
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + userId);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Migrate defaults if fields added
      if (!data.sanctuary) {
        data.sanctuary = {
          innLevel: 1,
          lastHarvestTime: Date.now(),
          unlockedPets: ['baby_panda'],
          activePet: 'baby_panda',
          decorations: ['lantern'],
          learnedVocab: []
        };
      }
      return data;
    } catch (e) {
      console.warn('Error loading user save:', e);
      return null;
    }
  }

  saveUserData(userData) {
    if (!userData || !userData.userId) return;
    userData.lastLogin = Date.now();
    localStorage.setItem(SAVE_KEY_PREFIX + userData.userId, JSON.stringify(userData));

    // Keep index up to date
    const index = this.getProfilesIndex();
    const idx = index.findIndex(p => p.id === userData.userId);
    const summary = {
      id: userData.userId,
      name: userData.name,
      authType: userData.authType,
      avatar: userData.avatar,
      email: userData.email || ''
    };
    if (idx >= 0) {
      index[idx] = summary;
    } else {
      index.push(summary);
    }
    this.saveProfilesIndex(index);
    this.syncProfileToServer(userData);
  }

  getActiveProfile() {
    return this.activeProfile;
  }

  switchProfile(userId) {
    const data = this.loadUserData(userId);
    if (!data) return false;
    this.activeProfile = data;
    localStorage.setItem(ACTIVE_PROFILE_KEY, userId);
    this.notifyChange();
    return true;
  }

  createStudentProfile(name, avatarEmoji = '🐼', setAsActive = true) {
    const cleanName = (name || '').trim() || 'นักเรียนใหม่';
    const newId = 'student_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newProfile = createDefaultSaveData(newId, cleanName, 'student', avatarEmoji);
    this.saveUserData(newProfile);
    if (setAsActive) {
      this.switchProfile(newId);
    } else {
      this.notifyChange();
    }
    return newProfile;
  }

  deleteProfile(userId) {
    const index = this.getProfilesIndex();
    if (index.length <= 1) {
      alert('ต้องมีโปรไฟล์อย่างน้อย 1 บัญชีในเครื่องครับ');
      return false;
    }
    localStorage.removeItem(SAVE_KEY_PREFIX + userId);
    const newIndex = index.filter(p => p.id !== userId);
    this.saveProfilesIndex(newIndex);

    if (this.activeProfile && this.activeProfile.userId === userId) {
      this.switchProfile(newIndex[0].id);
    } else {
      this.notifyChange();
    }
    return true;
  }

  updateProfileDetails(userId, { name, avatar }) {
    let profile = null;
    let isActive = false;

    if (this.activeProfile && this.activeProfile.userId === userId) {
      profile = this.activeProfile;
      isActive = true;
    } else {
      profile = this.loadUserData(userId);
    }

    if (!profile) return false;

    if (name && name.trim()) {
      profile.name = name.trim();
    }
    if (avatar) {
      profile.avatar = avatar;
    }

    this.saveUserData(profile);
    this.notifyChange();
    return true;
  }

  updateProfileName(userId, newName) {
    return this.updateProfileDetails(userId, { name: newName });
  }

  updateProfileAvatar(userId, newAvatar) {
    return this.updateProfileDetails(userId, { avatar: newAvatar });
  }

  // --- GOOGLE IDENTITY SERVICES (GIS) INTEGRATION ---
  setupGoogleIdentity() {
    const clientId = localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || DEFAULT_GOOGLE_CLIENT_ID;

    const initGIS = () => {
      if (typeof window.google === 'undefined' || !window.google.accounts || !window.google.accounts.id) {
        return;
      }
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => this.handleGoogleCredential(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        this.gisLoaded = true;
        this.renderGoogleButtons();
      } catch (err) {
        console.warn('Google Identity Init Notice:', err.message);
      }
    };

    if (typeof window.google !== 'undefined' && window.google.accounts) {
      initGIS();
    } else {
      // Check every 400ms for script load
      const interval = setInterval(() => {
        if (typeof window.google !== 'undefined' && window.google.accounts) {
          clearInterval(interval);
          initGIS();
        }
      }, 400);
      setTimeout(() => clearInterval(interval), 6000);
    }
  }

  renderGoogleButtons() {
    if (!this.gisLoaded || typeof window.google === 'undefined') return;
    const containers = document.querySelectorAll('.g-signin-container');
    containers.forEach(container => {
      try {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left'
        });
      } catch (_) {}
    });
  }

  handleGoogleCredential(response) {
    try {
      const jwt = response.credential;
      const payload = this.parseJwt(jwt);
      if (!payload || !payload.sub) {
        throw new Error('Invalid JWT payload');
      }

      const googleId = 'google_' + payload.sub;
      let profile = this.loadUserData(googleId);

      if (!profile) {
        // First time Google Sign In: create profile
        profile = createDefaultSaveData(
          googleId,
          payload.name || payload.given_name || 'ผู้ใช้ Google',
          'google',
          payload.picture || '🐼'
        );
        profile.email = payload.email || '';
      } else {
        // Update name and picture from Google
        profile.name = payload.name || profile.name;
        profile.avatar = payload.picture || profile.avatar;
        profile.email = payload.email || profile.email;
      }

      this.saveUserData(profile);
      this.switchProfile(googleId);

      // Show friendly notification
      alert(`🎉 เข้าสู่ระบบ Google สำเร็จ!\nยินดีต้อนรับ ${profile.name}`);
    } catch (e) {
      console.error('Failed to parse Google login:', e);
      alert('ไม่สามารถประมวลผลการเข้าสู่ระบบ Google ได้: ' + e.message);
    }
  }

  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // --- SAVE / UPDATE UTILITIES ---
  addJade(amount, targetUserId = null) {
    if (amount <= 0) return 0;
    let target = this.activeProfile;
    let isDifferentUser = false;
    if (targetUserId && (!this.activeProfile || this.activeProfile.userId !== targetUserId)) {
      target = this.loadUserData(targetUserId);
      isDifferentUser = true;
    }
    if (!target) return 0;

    // Check if active pet gives bonus (Baby Panda gives +25% jade bonus)
    let bonusMult = 1.0;
    if (target.sanctuary && target.sanctuary.activePet === 'baby_panda') {
      bonusMult = 1.25;
    }
    const finalAmount = Math.round(amount * bonusMult);

    target.jade = (target.jade || 0) + finalAmount;
    this.saveUserData(target);
    if (!isDifferentUser) {
      this.notifyChange();
    }
    return finalAmount;
  }

  spendJade(amount) {
    if (!this.activeProfile || this.activeProfile.jade < amount) return false;
    this.activeProfile.jade -= amount;
    this.saveUserData(this.activeProfile);
    this.notifyChange();
    return true;
  }

  recordLearnedVocab(vocabChar) {
    if (!this.activeProfile || !vocabChar) return;
    if (!this.activeProfile.sanctuary) this.activeProfile.sanctuary = {};
    if (!Array.isArray(this.activeProfile.sanctuary.learnedVocab)) {
      this.activeProfile.sanctuary.learnedVocab = [];
    }
    if (!this.activeProfile.sanctuary.learnedVocab.includes(vocabChar)) {
      this.activeProfile.sanctuary.learnedVocab.push(vocabChar);
      this.saveUserData(this.activeProfile);
    }
  }

  updateProgress(patch) {
    if (!this.activeProfile) return;
    Object.assign(this.activeProfile, patch);
    this.saveUserData(this.activeProfile);
    this.notifyChange();
  }

  // Export Save File for teacher backup
  exportSaveData() {
    if (!this.activeProfile) return;
    const jsonStr = JSON.stringify(this.activeProfile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JadeAscent_Save_${this.activeProfile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import Save File
  importSaveData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.userId || data.jade === undefined) {
        throw new Error('รูปแบบไฟล์บันทึกไม่ถูกต้อง');
      }
      this.saveUserData(data);
      this.switchProfile(data.userId);
      return true;
    } catch (e) {
      alert('ไม่สามารถนำเข้าไฟล์เซฟได้: ' + e.message);
      return false;
    }
  }

  onProfileChange(cb) {
    this.changeListeners.push(cb);
  }

  notifyChange() {
    for (const cb of this.changeListeners) {
      try {
        cb(this.activeProfile);
      } catch (e) {
        console.error('Error in profile change listener:', e);
      }
    }
  }
}

export const profileManager = new ProfileManager();
