/**
 * dashboard.js
 * Standalone Student Progress & Parent/Admin Review Dashboard
 * - Parent Login Gate: Requires Gmail (@gmail.com or Google Sign-In)
 * - Admin Login Gate: ID: Toon | Pass: 141826
 * - Cross-device sync with ./api.php + localStorage fallback
 */

import { DEFAULT_AVATARS, DEFAULT_GOOGLE_CLIENT_ID, createDefaultSaveData } from './auth.js';

const SAVE_KEY_PREFIX = 'jade_save_';
const PROFILES_INDEX_KEY = 'jade_profiles_index';
const LOCAL_REVIEWS_KEY = 'jade_admin_reviews';
const DASH_SESSION_KEY = 'jade_dashboard_session';
const GOOGLE_CLIENT_ID_KEY = 'jade_google_client_id';

// Admin Credentials required by user
const ADMIN_ID = 'Toon';
const ADMIN_PASS = '141826';

// Vocabulary Catalog for tracking & display (Includes Hotel/Inn set + Core HSK)
const VOCAB_CATALOG = [
  { hanzi: '酒店', pinyin: 'jiǔdiàn', meaning: 'โรงแรม (Hotel)' },
  { hanzi: '入住', pinyin: 'rùzhù', meaning: 'เช็คอินเข้าพัก (Check in)' },
  { hanzi: '预订', pinyin: 'yùdìng', meaning: 'จองล่วงหน้า (Reservation)' },
  { hanzi: '护照', pinyin: 'hùzhào', meaning: 'หนังสือเดินทาง (Passport)' },
  { hanzi: '房间', pinyin: 'fángjiān', meaning: 'ห้องพัก (Room)' },
  { hanzi: '房卡', pinyin: 'fángkǎ', meaning: 'คีย์การ์ดห้องพัก (Room key card)' },
  { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'สวัสดี (Hello)' },
  { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'ขอบคุณ (Thank you)' },
  { hanzi: '喝茶', pinyin: 'hē chá', meaning: 'ดื่มชา (Drink tea)' },
  { hanzi: '朋友', pinyin: 'péngyou', meaning: 'เพื่อน (Friend)' },
  { hanzi: '学习', pinyin: 'xuéxí', meaning: 'เรียนรู้ (Study)' },
  { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'คุณครู (Teacher)' }
];

// Application State
const state = {
  session: null, // { role: 'parent' | 'admin', name: string, email?: string, adminId?: string, adminPass?: string }
  profiles: {},  // { [userId]: profileObj }
  reviews: {},   // { [userId]: reviewObj }
  selectedStudentId: null,
  filterMode: 'all', // 'all' | 'reviewed' | 'pending'
  searchQuery: '',
  newStudentAvatar: '🐼'
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  bindAuthEvents();
  bindDashboardEvents();
  initGoogleSignInForParents();

  // Restore active session if already logged in during this browser session
  const savedSession = sessionStorage.getItem(DASH_SESSION_KEY);
  if (savedSession) {
    try {
      state.session = JSON.parse(savedSession);
      await enterDashboard();
      return;
    } catch (_) {
      sessionStorage.removeItem(DASH_SESSION_KEY);
    }
  }
});

// ============================================================================
// AUTHENTICATION LOGIC (PARENT GMAIL & ADMIN TOON)
// ============================================================================
function bindAuthEvents() {
  const tabParentBtn = document.getElementById('tab-parent-btn');
  const tabAdminBtn = document.getElementById('tab-admin-btn');
  const panelParent = document.getElementById('panel-parent-auth');
  const panelAdmin = document.getElementById('panel-admin-auth');

  tabParentBtn.addEventListener('click', () => {
    tabParentBtn.classList.add('active');
    tabAdminBtn.classList.remove('active');
    panelParent.classList.remove('hidden');
    panelAdmin.classList.add('hidden');
  });

  tabAdminBtn.addEventListener('click', () => {
    tabAdminBtn.classList.add('active');
    tabParentBtn.classList.remove('active');
    panelAdmin.classList.remove('hidden');
    panelParent.classList.add('hidden');
  });

  // Parent Gmail Form Submit
  const parentForm = document.getElementById('parent-gmail-form');
  const parentError = document.getElementById('parent-auth-error');

  parentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    parentError.classList.add('hidden');

    const parentName = document.getElementById('parent-name-input').value.trim();
    const gmailInput = document.getElementById('parent-gmail-input').value.trim().toLowerCase();

    if (!parentName) {
      showAuthError(parentError, 'กรุณาระบุชื่อผู้ปกครอง');
      return;
    }

    // Strictly validate Gmail format (@gmail.com or @googlemail.com)
    const isGmail = /^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i.test(gmailInput);
    if (!isGmail) {
      showAuthError(parentError, 'ผู้ปกครองต้องเข้าสู่ระบบด้วยอีเมล @gmail.com เท่านั้นครับ (เช่น example@gmail.com)');
      return;
    }

    state.session = {
      role: 'parent',
      name: parentName,
      email: gmailInput,
      loginTime: Date.now()
    };
    sessionStorage.setItem(DASH_SESSION_KEY, JSON.stringify(state.session));
    await enterDashboard();
  });

  // Admin Login Form Submit (ID: Toon, Pass: 141826)
  const adminForm = document.getElementById('admin-login-form');
  const adminError = document.getElementById('admin-auth-error');

  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    adminError.classList.add('hidden');

    const idInput = document.getElementById('admin-id-input').value.trim();
    const passInput = document.getElementById('admin-pass-input').value.trim();

    if (idInput.toLowerCase() !== ADMIN_ID.toLowerCase() || passInput !== ADMIN_PASS) {
      showAuthError(adminError, 'รหัสแอดมินไม่ถูกต้อง! กรุณาตรวจสอบ Admin ID และ Password อีกครั้ง');
      return;
    }

    state.session = {
      role: 'admin',
      name: 'ครูตูน (Admin Toon)',
      adminId: ADMIN_ID,
      adminPass: ADMIN_PASS,
      loginTime: Date.now()
    };
    sessionStorage.setItem(DASH_SESSION_KEY, JSON.stringify(state.session));
    await enterDashboard();
  });
}

function showAuthError(el, msg) {
  el.textContent = '⚠️ ' + msg;
  el.classList.remove('hidden');
}

function initGoogleSignInForParents() {
  const clientId = localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || DEFAULT_GOOGLE_CLIENT_ID;
  const tryInit = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) return false;
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const payload = decodeJwtPayload(response.credential);
            if (payload && payload.email) {
              state.session = {
                role: 'parent',
                name: payload.name || 'ผู้ปกครอง',
                email: payload.email,
                loginTime: Date.now()
              };
              sessionStorage.setItem(DASH_SESSION_KEY, JSON.stringify(state.session));
              await enterDashboard();
            }
          } catch (err) {
            console.warn('Google credential decode error:', err);
          }
        },
        auto_select: false
      });

      const btnContainer = document.getElementById('dashboard-google-btn');
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          locale: 'th'
        });
      }
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!tryInit()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (tryInit() || attempts > 15) clearInterval(timer);
    }, 500);
  }
}

function decodeJwtPayload(jwt) {
  const base64Url = jwt.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// ============================================================================
// DATA SYNC & STORAGE (SERVER API + LOCALSTORAGE FALLBACK)
// ============================================================================
async function loadAllDashboardData() {
  // 1. Load local profiles and reviews first
  const localProfiles = loadLocalProfiles();
  const localReviews = loadLocalReviews();

  state.profiles = { ...localProfiles };
  state.reviews = { ...localReviews };

  // 2. Fetch cross-device profiles & reviews from ./api.php
  try {
    const res = await fetch('./api.php?action=list', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        if (data.profiles && typeof data.profiles === 'object') {
          Object.entries(data.profiles).forEach(([id, prof]) => {
            if (prof && prof.userId) {
              state.profiles[id] = prof;
            }
          });
        }
        if (data.reviews && typeof data.reviews === 'object') {
          Object.entries(data.reviews).forEach(([id, rev]) => {
            if (rev && rev.studentId) {
              state.reviews[id] = rev;
            }
          });
        }
      }
    }
  } catch (_) {
    // Offline or Vite local dev server without PHP — localStorage handles it seamlessly
  }

  // 3. Ensure at least one default student & sample review exist so dashboard is never empty
  ensureDefaultDemoData();

  // Save merged state back to local cache
  saveLocalReviews(state.reviews);
}

function loadLocalProfiles() {
  const map = {};
  try {
    const rawIndex = localStorage.getItem(PROFILES_INDEX_KEY);
    const index = rawIndex ? JSON.parse(rawIndex) : [];
    index.forEach((item) => {
      const rawUser = localStorage.getItem(SAVE_KEY_PREFIX + item.id);
      if (rawUser) {
        map[item.id] = JSON.parse(rawUser);
      }
    });
  } catch (_) {}
  return map;
}

function loadLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveLocalReviews(reviewsMap) {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviewsMap));
  } catch (_) {}
}

function ensureDefaultDemoData() {
  if (Object.keys(state.profiles).length === 0) {
    const demoStudent = createDefaultSaveData('student_default', 'นักเรียนคนเก่ง', 'student', '🐼');
    demoStudent.jade = 650;
    demoStudent.levelProgress = { unlockedLevel: 3, highestMilestone: 2 };
    demoStudent.runnerStats = { highScore: 1280, totalRuns: 4 };
    demoStudent.arenaStats = { matchesPlayed: 5, wins: 4, adventureCleared: [1, 2] };
    demoStudent.sanctuary = {
      innLevel: 2,
      lastHarvestTime: Date.now(),
      unlockedPets: ['baby_panda'],
      activePet: 'baby_panda',
      decorations: ['lantern'],
      learnedVocab: ['酒店', '入住', '预订', '护照', '房间', '房卡']
    };
    state.profiles[demoStudent.userId] = demoStudent;
  }

  // Ensure default student has an initial teacher review if no reviews exist yet
  if (Object.keys(state.reviews).length === 0) {
    const firstId = Object.keys(state.profiles)[0];
    const firstStudent = state.profiles[firstId];
    if (firstStudent) {
      state.reviews[firstId] = {
        studentId: firstId,
        badge: 'เก่งมาก จดจำคำศัพท์ได้ไว 🌟',
        stars: 5,
        skills: {
          vocab: 90,
          pinyin: 85,
          conversation: 85,
          effort: 95
        },
        strengths: 'จดจำคำศัพท์หมวดโรงเตี๊ยม (酒店, 入住, 预订, 护照, 房间, 房卡) ได้แม่นยำและตอบคำถามในสถานการณ์จำลองได้รวดเร็วมาก',
        nextSteps: 'ฝึกออกเสียงพินอินที่มีวรรณยุกต์เสียง 3 ติดกัน และลองแต่งประโยคสนทนาสั้นๆ เพิ่มเติม',
        comment: 'น้องมีความตั้งใจเรียนดีเยี่ยมครับ สามารถจำตัวอักษรจีนและพินอินในหมวดโรงเตี๊ยมเต๋าได้ครบทั้ง 6 คำหลัก และนำไปใช้ตอบคำถามแขกในโรงเตี๊ยมได้อย่างถูกต้อง พัฒนาการก้าวหน้าขึ้นชัดเจนครับ',
        reviewer: 'ครูตูน (Admin Toon)',
        updatedAt: Date.now()
      };
    }
  }
}

// ============================================================================
// ENTER DASHBOARD & RENDER UI
// ============================================================================
async function enterDashboard() {
  await loadAllDashboardData();

  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('dashboard-app').classList.remove('hidden');

  const isAdmin = state.session && state.session.role === 'admin';
  const badgeEl = document.getElementById('session-badge');

  if (isAdmin) {
    badgeEl.className = 'session-badge admin-mode';
    badgeEl.innerHTML = `👑 แอดมิน: <strong>${escapeHtml(state.session.name)}</strong> (โหมดเขียนรีวิว)`;
    document.getElementById('admin-add-student-btn').classList.remove('hidden');
    document.getElementById('admin-scroll-to-editor-btn').classList.remove('hidden');
    document.getElementById('admin-editor-section').classList.remove('hidden');
  } else {
    badgeEl.className = 'session-badge parent-mode';
    badgeEl.innerHTML = `👨‍👩‍👧 ผู้ปกครอง: <strong>${escapeHtml(state.session.name)}</strong> (${escapeHtml(state.session.email || '')})`;
    document.getElementById('admin-add-student-btn').classList.add('hidden');
    document.getElementById('admin-scroll-to-editor-btn').classList.add('hidden');
    document.getElementById('admin-editor-section').classList.add('hidden');
  }

  // Select first student by default if none selected
  const allIds = Object.keys(state.profiles);
  if (!state.selectedStudentId || !state.profiles[state.selectedStudentId]) {
    state.selectedStudentId = allIds[0] || null;
  }

  renderAll();
}

function renderAll() {
  renderKpiSummary();
  renderStudentSidebar();
  renderSelectedStudentDetail();
}

function renderKpiSummary() {
  const studentList = Object.values(state.profiles);
  const totalStudents = studentList.length;
  let reviewedCount = 0;
  let totalVocabCount = 0;
  let scoreSum = 0;

  studentList.forEach((st) => {
    const vocabArr = (st.sanctuary && Array.isArray(st.sanctuary.learnedVocab)) ? st.sanctuary.learnedVocab : [];
    totalVocabCount += vocabArr.length;

    const rev = state.reviews[st.userId];
    if (rev) {
      reviewedCount++;
      const sk = rev.skills || { vocab: 80, pinyin: 80, conversation: 80, effort: 80 };
      const avg = Math.round((Number(sk.vocab) + Number(sk.pinyin) + Number(sk.conversation) + Number(sk.effort)) / 4);
      scoreSum += avg;
    }
  });

  const overallAvg = reviewedCount > 0 ? Math.round(scoreSum / reviewedCount) + '%' : 'รอประเมิน';

  document.getElementById('kpi-total-students').textContent = `${totalStudents} คน`;
  document.getElementById('kpi-reviewed-students').textContent = `${reviewedCount} / ${totalStudents} คน`;
  document.getElementById('kpi-total-vocab').textContent = `${totalVocabCount} คำ`;
  document.getElementById('kpi-avg-score').textContent = overallAvg;
}

function renderStudentSidebar() {
  const listEl = document.getElementById('student-list');
  listEl.innerHTML = '';

  const query = state.searchQuery.toLowerCase();
  const students = Object.values(state.profiles).filter((st) => {
    const matchesName = (st.name || '').toLowerCase().includes(query);
    if (!matchesName) return false;
    const hasReview = Boolean(state.reviews[st.userId]);
    if (state.filterMode === 'reviewed') return hasReview;
    if (state.filterMode === 'pending') return !hasReview;
    return true;
  });

  if (students.length === 0) {
    listEl.innerHTML = `<div style="text-align:center; padding: 24px 10px; color: var(--text-muted); font-size: 13.5px;">ไม่พบรายชื่อนักเรียนที่ค้นหา</div>`;
    return;
  }

  students.forEach((st) => {
    const rev = state.reviews[st.userId];
    const isSelected = st.userId === state.selectedStudentId;
    const item = document.createElement('div');
    item.className = `student-item ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <div class="student-item-left">
        <div class="st-avatar">${st.avatar || '🐼'}</div>
        <div style="min-width:0;">
          <div class="st-name">${escapeHtml(st.name || 'นักเรียน')}</div>
          <div class="st-sub">💎 ${st.jade || 0} หยก • 🏮 โรงเตี๊ยม Lv.${(st.sanctuary && st.sanctuary.innLevel) || 1}</div>
        </div>
      </div>
      <span class="st-status-dot ${rev ? 'reviewed' : 'pending'}">
        ${rev ? '⭐ ' + (rev.stars || 5) + '.0' : 'รอรีวิว'}
      </span>
    `;
    item.addEventListener('click', () => {
      state.selectedStudentId = st.userId;
      renderAll();
    });
    listEl.appendChild(item);
  });
}

function renderSelectedStudentDetail() {
  const emptyState = document.getElementById('empty-student-state');
  const detailContent = document.getElementById('student-detail-content');

  const student = state.selectedStudentId ? state.profiles[state.selectedStudentId] : null;
  if (!student) {
    emptyState.classList.remove('hidden');
    detailContent.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  detailContent.classList.remove('hidden');

  const review = state.reviews[student.userId] || null;

  // 1. Banner
  document.getElementById('detail-avatar').textContent = student.avatar || '🐼';
  document.getElementById('detail-name').textContent = student.name || 'นักเรียน';
  document.getElementById('detail-level-badge').textContent = review
    ? review.badge
    : 'รอครูผู้สอนบันทึกผลการประเมิน ⏳';

  const lastTime = (review && review.updatedAt) || student.lastLogin || Date.now();
  document.getElementById('detail-last-active').textContent =
    `อัปเดตข้อมูลล่าสุด: ${formatThaiDate(lastTime)}`;

  const starsCount = review ? Number(review.stars || 5) : 0;
  document.getElementById('detail-stars').textContent =
    starsCount > 0 ? '⭐'.repeat(starsCount) : 'ยังไม่มีคะแนนดาว';

  // 2. Teacher Review Card
  const statusPill = document.getElementById('detail-review-status-pill');
  const reviewerMeta = document.getElementById('detail-reviewer-meta');
  if (review) {
    statusPill.textContent = '✅ ประเมินพัฒนาการแล้ว';
    statusPill.style.background = 'rgba(16, 185, 129, 0.2)';
    statusPill.style.color = '#6ee7b7';
    reviewerMeta.textContent = `ประเมินโดย: ${review.reviewer || 'ครูตูน (Admin Toon)'} • เมื่อ ${formatThaiDate(review.updatedAt)}`;
  } else {
    statusPill.textContent = '⏳ รอแอดมินเขียนรีวิว';
    statusPill.style.background = 'rgba(245, 158, 11, 0.2)';
    statusPill.style.color = '#fde68a';
    reviewerMeta.textContent = 'กำลังรวบรวมสถิติการเรียนเพื่อประเมินผลโดย ครูตูน (Admin Toon)';
  }

  const skills = (review && review.skills) || {
    vocab: 75,
    pinyin: 75,
    conversation: 75,
    effort: 85
  };

  setSkillBar('vocab', skills.vocab);
  setSkillBar('pinyin', skills.pinyin);
  setSkillBar('conversation', skills.conversation);
  setSkillBar('effort', skills.effort);

  document.getElementById('detail-comment-text').textContent = review
    ? review.comment
    : 'คุณครูตูนกำลังติดตามผลการเล่นและพัฒนาการของนักเรียนคนนี้อยู่ครับ ผู้ปกครองสามารถดูสถิติการจำคำศัพท์และระดับด่านที่น้องผ่านได้จากตารางด้านล่างครับ';

  document.getElementById('detail-strengths-text').textContent =
    (review && review.strengths) || 'มีความกระตือรือร้นในการเรียนรู้คำศัพท์ภาษาจีนผ่านเกม';
  document.getElementById('detail-nextsteps-text').textContent =
    (review && review.nextSteps) || 'ฝึกฝนคำศัพท์หมวดโรงเตี๊ยมและทบทวนการออกเสียงพินอินอย่างสม่ำเสมอ';

  // 3. Learned Vocabulary Chips
  const learnedSet = new Set(
    (student.sanctuary && Array.isArray(student.sanctuary.learnedVocab))
      ? student.sanctuary.learnedVocab
      : []
  );

  // If student has hotel inn level >= 1 and empty vocab list, show default learned words or allow admin to toggle
  const vocabContainer = document.getElementById('detail-vocab-list');
  vocabContainer.innerHTML = '';

  const matchedWords = VOCAB_CATALOG.filter((v) => learnedSet.has(v.hanzi));
  document.getElementById('detail-vocab-count').textContent = `${matchedWords.length} คำ`;

  if (matchedWords.length === 0) {
    vocabContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 13.5px;">กำลังเริ่มสะสมคำศัพท์จากในเกม...</span>`;
  } else {
    matchedWords.forEach((word) => {
      const chip = document.createElement('div');
      chip.className = 'vocab-chip';
      chip.innerHTML = `
        <span class="hanzi">${word.hanzi}</span>
        <div>
          <div class="pinyin">${word.pinyin}</div>
          <div class="meaning">${word.meaning}</div>
        </div>
      `;
      vocabContainer.appendChild(chip);
    });
  }

  // 4. Game Stats
  document.getElementById('stat-jade').textContent = `${student.jade || 0} หยก`;
  document.getElementById('stat-inn-level').textContent = `ระดับ ${(student.sanctuary && student.sanctuary.innLevel) || 1}`;
  document.getElementById('stat-tower-level').textContent = `ด่าน ${(student.levelProgress && student.levelProgress.unlockedLevel) || 1}`;
  document.getElementById('stat-runner-score').textContent = `${(student.runnerStats && student.runnerStats.highScore) || 0} คะแนน`;
  document.getElementById('stat-arena-wins').textContent = `${(student.arenaStats && student.arenaStats.wins) || 0} ครั้ง`;

  // 5. Populate Admin Editor Form if logged in as Admin
  if (state.session && state.session.role === 'admin') {
    populateAdminEditor(student, review);
  }
}

function setSkillBar(key, val) {
  const safeVal = Math.max(0, Math.min(100, Number(val) || 0));
  document.getElementById(`skill-val-${key}`).textContent = `${safeVal}%`;
  document.getElementById(`skill-bar-${key}`).style.width = `${safeVal}%`;
}

// ============================================================================
// ADMIN EDITOR & STUDENT MANAGEMENT (ID: Toon / Pass: 141826)
// ============================================================================
function populateAdminEditor(student, review) {
  document.getElementById('editor-student-name').textContent = student.name || 'นักเรียน';

  const badgeSelect = document.getElementById('review-badge-select');
  const starsSelect = document.getElementById('review-stars-select');
  const sliderVocab = document.getElementById('slider-vocab');
  const sliderPinyin = document.getElementById('slider-pinyin');
  const sliderConv = document.getElementById('slider-conv');
  const sliderEffort = document.getElementById('slider-effort');

  if (review) {
    badgeSelect.value = review.badge || 'พัฒนาต่อเนื่องดีมาก 📈';
    starsSelect.value = String(review.stars || 5);
    sliderVocab.value = (review.skills && review.skills.vocab) || 85;
    sliderPinyin.value = (review.skills && review.skills.pinyin) || 80;
    sliderConv.value = (review.skills && review.skills.conversation) || 85;
    sliderEffort.value = (review.skills && review.skills.effort) || 90;
    document.getElementById('review-strengths-input').value = review.strengths || '';
    document.getElementById('review-nextsteps-input').value = review.nextSteps || '';
    document.getElementById('review-comment-input').value = review.comment || '';
  } else {
    badgeSelect.value = 'พัฒนาต่อเนื่องดีมาก 📈';
    starsSelect.value = '5';
    sliderVocab.value = 85;
    sliderPinyin.value = 80;
    sliderConv.value = 85;
    sliderEffort.value = 90;
    document.getElementById('review-strengths-input').value =
      'ตั้งใจเรียนและจดจำคำศัพท์หมวดโรงเตี๊ยม (酒店, 入住, 房卡) ได้ไวมาก';
    document.getElementById('review-nextsteps-input').value =
      'ฝึกออกเสียงพินอินและทบทวนรูปประโยคสนทนาในบทถัดไป';
    document.getElementById('review-comment-input').value = '';
  }

  updateSliderLabels();

  // Render vocabulary checkboxes
  const learnedSet = new Set(
    (student.sanctuary && Array.isArray(student.sanctuary.learnedVocab))
      ? student.sanctuary.learnedVocab
      : []
  );

  const checkGrid = document.getElementById('editor-vocab-checkboxes');
  checkGrid.innerHTML = '';
  VOCAB_CATALOG.forEach((v) => {
    const label = document.createElement('label');
    label.className = 'vocab-check-label';
    const checked = learnedSet.has(v.hanzi) ? 'checked' : '';
    label.innerHTML = `
      <input type="checkbox" name="vocab-mastered" value="${v.hanzi}" ${checked} />
      <span><strong>${v.hanzi}</strong> (${v.pinyin}) - ${v.meaning.split(' ')[0]}</span>
    `;
    checkGrid.appendChild(label);
  });
}

function updateSliderLabels() {
  document.getElementById('slider-vocab-label').textContent = document.getElementById('slider-vocab').value + '%';
  document.getElementById('slider-pinyin-label').textContent = document.getElementById('slider-pinyin').value + '%';
  document.getElementById('slider-conv-label').textContent = document.getElementById('slider-conv').value + '%';
  document.getElementById('slider-effort-label').textContent = document.getElementById('slider-effort').value + '%';
}

function bindDashboardEvents() {
  // Search & Filter
  document.getElementById('student-search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderStudentSidebar();
  });

  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterMode = btn.dataset.filter;
      renderStudentSidebar();
    });
  });

  // Refresh Data Button
  document.getElementById('refresh-data-btn').addEventListener('click', async () => {
    await loadAllDashboardData();
    renderAll();
    showToast('🔄 อัปเดตข้อมูลนักเรียนและรีวิวล่าสุดเรียบร้อยแล้ว');
  });

  // Logout Button
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem(DASH_SESSION_KEY);
    state.session = null;
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('auth-gate').classList.remove('hidden');
  });

  // Scroll to Editor Button (Admin)
  document.getElementById('admin-scroll-to-editor-btn').addEventListener('click', () => {
    const editor = document.getElementById('admin-editor-section');
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('review-comment-input').focus();
  });

  // Skill Sliders Live Label Update
  ['slider-vocab', 'slider-pinyin', 'slider-conv', 'slider-effort'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateSliderLabels);
  });

  // Save Review Form (Admin)
  document.getElementById('admin-review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.session || state.session.role !== 'admin') return;

    const student = state.profiles[state.selectedStudentId];
    if (!student) return;

    // Collect mastered vocab checkboxes
    const checkedWords = Array.from(
      document.querySelectorAll('input[name="vocab-mastered"]:checked')
    ).map((el) => el.value);

    if (!student.sanctuary) student.sanctuary = { innLevel: 1, learnedVocab: [] };
    student.sanctuary.learnedVocab = checkedWords;
    student.lastLogin = Date.now();

    // Build review payload
    const reviewObj = {
      studentId: student.userId,
      studentName: student.name,
      badge: document.getElementById('review-badge-select').value,
      stars: Number(document.getElementById('review-stars-select').value),
      skills: {
        vocab: Number(document.getElementById('slider-vocab').value),
        pinyin: Number(document.getElementById('slider-pinyin').value),
        conversation: Number(document.getElementById('slider-conv').value),
        effort: Number(document.getElementById('slider-effort').value)
      },
      strengths: document.getElementById('review-strengths-input').value.trim(),
      nextSteps: document.getElementById('review-nextsteps-input').value.trim(),
      comment: document.getElementById('review-comment-input').value.trim(),
      reviewer: 'ครูตูน (Admin Toon)',
      updatedAt: Date.now()
    };

    // Save locally
    state.reviews[student.userId] = reviewObj;
    state.profiles[student.userId] = student;
    saveLocalReviews(state.reviews);
    saveProfileToLocal(student);

    // Save to Server API (./api.php?action=save_review)
    try {
      await fetch('./api.php?action=save_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: ADMIN_ID,
          adminPass: ADMIN_PASS,
          review: reviewObj,
          profile: student
        })
      });
    } catch (_) {}

    renderAll();
    showToast(`✅ บันทึกรีวิวพัฒนาการของ "${student.name}" เรียบร้อยแล้ว!`);
  });

  // Delete Review Button (Admin)
  document.getElementById('delete-review-btn').addEventListener('click', async () => {
    if (!state.session || state.session.role !== 'admin') return;
    const student = state.profiles[state.selectedStudentId];
    if (!student || !state.reviews[student.userId]) return;

    delete state.reviews[student.userId];
    saveLocalReviews(state.reviews);

    try {
      await fetch('./api.php?action=delete_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: ADMIN_ID,
          adminPass: ADMIN_PASS,
          studentId: student.userId
        })
      });
    } catch (_) {}

    renderAll();
    showToast(`🗑️ ลบรีวิวของ "${student.name}" แล้ว`);
  });

  // Add Student Modal (Admin)
  const addModal = document.getElementById('add-student-modal');
  const avatarGrid = document.getElementById('new-student-avatars');

  DEFAULT_AVATARS.slice(0, 12).forEach((av) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `avatar-pick-btn ${av.emoji === state.newStudentAvatar ? 'selected' : ''}`;
    btn.textContent = av.emoji;
    btn.addEventListener('click', () => {
      state.newStudentAvatar = av.emoji;
      avatarGrid.querySelectorAll('.avatar-pick-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    avatarGrid.appendChild(btn);
  });

  document.getElementById('admin-add-student-btn').addEventListener('click', () => {
    addModal.classList.remove('hidden');
  });

  document.getElementById('close-add-student-btn').addEventListener('click', () => {
    addModal.classList.add('hidden');
  });

  document.getElementById('add-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('new-student-name').value.trim();
    const jadeInput = Number(document.getElementById('new-student-jade').value) || 0;
    const innInput = Number(document.getElementById('new-student-inn').value) || 1;
    if (!nameInput) return;

    const newId = 'student_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newStudent = createDefaultSaveData(newId, nameInput, 'student', state.newStudentAvatar);
    newStudent.jade = jadeInput;
    newStudent.sanctuary.innLevel = innInput;
    newStudent.sanctuary.learnedVocab = ['酒店', '入住', '预订', '护照', '房间', '房卡'];

    state.profiles[newId] = newStudent;
    state.selectedStudentId = newId;
    saveProfileToLocal(newStudent);

    try {
      await fetch('./api.php?action=sync_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: newStudent })
      });
    } catch (_) {}

    document.getElementById('new-student-name').value = '';
    addModal.classList.add('hidden');
    renderAll();
    showToast(`➕ เพิ่มรายชื่อนักเรียน "${nameInput}" เรียบร้อยแล้ว`);
  });
}

function saveProfileToLocal(profile) {
  try {
    localStorage.setItem(SAVE_KEY_PREFIX + profile.userId, JSON.stringify(profile));
    const rawIdx = localStorage.getItem(PROFILES_INDEX_KEY);
    const idxArr = rawIdx ? JSON.parse(rawIdx) : [];
    const existingIdx = idxArr.findIndex((p) => p.id === profile.userId);
    const summary = {
      id: profile.userId,
      name: profile.name,
      authType: profile.authType || 'student',
      avatar: profile.avatar || '🐼'
    };
    if (existingIdx >= 0) {
      idxArr[existingIdx] = summary;
    } else {
      idxArr.push(summary);
    }
    localStorage.setItem(PROFILES_INDEX_KEY, JSON.stringify(idxArr));
  } catch (_) {}
}

// ============================================================================
// UTILITIES
// ============================================================================
function showToast(msg) {
  const toast = document.getElementById('dash-toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

function formatThaiDate(ts) {
  try {
    const d = new Date(Number(ts) || Date.now());
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (_) {
    return '-';
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
