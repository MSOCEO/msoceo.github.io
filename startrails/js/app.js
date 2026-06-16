/* ===== 星迹互联 StarTrails — 全局脚本 ===== */
/* ⚠️ DEPRECATED: 此文件未被 index.html 加载。所有功能已在 index.html 内联 <script> 中实现。
   如需使用此文件，需先移除 index.html 中的内联脚本以避免重复定义冲突。 */

// Supabase 初始化
const SUPABASE_URL = 'https://xwvkdluvixurvgvkhkfe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NOdEPhf8yD4dMRJIH1JqqA_z5By3p0H';

let supabase = null;

function initSupabase() {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.warn('[StarTrails] Supabase SDK not loaded');
  }
}

// ===== 工具函数 =====
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 帧率节流
const frameThrottle = (() => {
  let lastTime = 0;
  return function shouldRender(targetFps) {
    const now = performance.now();
    const interval = 1000 / targetFps;
    if (now - lastTime >= interval) { lastTime = now; return true; }
    return false;
  };
})();

// ===== 粒子背景（移动端降级 + 帧率控制） =====
let particleMouse = { x: -9999, y: -9999 };

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 20 : 80;
  const TARGET_FPS = isMobile ? 30 : 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = window.innerWidth < 768 ? 20 : 80;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        baseOpacity: Math.random() * 0.5 + 0.2,
        blinkPhase: Math.random() * Math.PI * 2,
        blinkSpeed: 0.005 + Math.random() * 0.02
      });
    }
  }

  function draw() {
    if (!frameThrottle(TARGET_FPS)) { animationId = requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const mx = particleMouse.x, my = particleMouse.y;
    const mouseNear = !isMobile && mx > 0 && my > 0;

    particles.forEach(p => {
      // 鼠标推开效果（桌面端）
      if (mouseNear) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (1 - dist / 200) * 1.5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // 闪烁
      p.blinkPhase += p.blinkSpeed;
      const opacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(p.blinkPhase));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    // 连线（桌面端）
    if (!isMobile) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', debounce(() => {
    isMobile = window.innerWidth < 768;
    resize();
    createParticles();
  }, 200));
}

function initParticleMouse() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  canvas.addEventListener('mousemove', (e) => {
    particleMouse.x = e.clientX;
    particleMouse.y = e.clientY;
  });

  canvas.addEventListener('mouseleave', () => {
    particleMouse.x = -9999;
    particleMouse.y = -9999;
  });
}

// ===== 导航栏 =====
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const overlay = document.querySelector('.nav__overlay');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  function openMenu() {
    mobileMenu?.classList.add('nav__mobile--open');
    overlay?.classList.add('nav__overlay--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu?.classList.remove('nav__mobile--open');
    overlay?.classList.remove('nav__overlay--visible');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openMenu);
  overlay?.addEventListener('click', closeMenu);

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ===== 数字递增动画 =====
function animateNumber(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const current = Math.floor(start + (target - start) * eased);

    el.textContent = target > 1000 ? current.toLocaleString() : current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target > 1000 ? target.toLocaleString() : target;
    }
  }

  requestAnimationFrame(update);
}

// ===== 滚动入场动画（移动端降级 + will-change 清理） =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.willChange = '';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    observer.observe(el);
  });
}

// ===== Supabase 数据获取 =====
async function fetchStats() {
  try {
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    const { count: onlineCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'online']);

    return {
      members: memberCount || 0,
      posts: postCount || 0,
      online: onlineCount || 0,
    };
  } catch (e) {
    console.error('Failed to fetch stats:', e);
    return { members: 0, posts: 0, online: 0 };
  }
}

async function fetchMembers(filters = {}) {
  try {
    let query = supabase.from('members').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.tag) {
      query = query.contains('tags', [filters.tag]);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to fetch members:', e);
    return [];
  }
}

async function fetchPosts(filters = {}) {
  try {
    let query = supabase.from('posts').select('*');

    if (filters.tag) {
      query = query.contains('tags', [filters.tag]);
    }

    query = query.order('published_at', { ascending: false }).limit(filters.limit || 20);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to fetch posts:', e);
    return [];
  }
}

async function fetchMember(id) {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to fetch member:', e);
    return null;
  }
}

async function fetchMemberPosts(memberId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('member_id', memberId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to fetch member posts:', e);
    return [];
  }
}

// ===== 标签云渲染 =====
function renderTagCloud(members, containerId) {
  const tagCount = {};
  members.forEach(m => {
    (m.tags || []).forEach(t => {
      if (t && t.trim()) {
        const key = t.trim();
        tagCount[key] = (tagCount[key] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  if (sorted.length === 0) return;

  const maxFreq = sorted[0][1];
  const minFreq = sorted[sorted.length - 1][1];
  const range = maxFreq - minFreq || 1;

  const cloudEl = document.getElementById(containerId);
  if (!cloudEl) return;

  cloudEl.innerHTML = sorted.map(([tag, freq]) => {
    const ratio = (freq - minFreq) / range;
    const fontSize = 0.8 + ratio * 0.7;
    const opacity = 0.5 + ratio * 0.5;
    return `<span class="tag-cloud__item" style="font-size:${fontSize}rem;opacity:${opacity};" data-tag="${tag}">${tag}</span>`;
  }).join('');
}

// ===== 表单提交（applications 表） =====
async function submitApplication(formData) {
  try {
    const { error } = await supabase.from('applications').insert({
      applicant_name: formData.applicantName,
      applicant_email: formData.applicantEmail,
      blog_name: formData.blogName,
      blog_url: formData.blogUrl,
      description: formData.description,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      rss_url: formData.rssUrl || null,
      status: 'pending',
    });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error('Failed to submit application:', e);
    return { success: false, error: e.message };
  }
}

// ===== RSS 解析（客户端） =====
async function fetchRssFeed(members) {
  if (typeof RSSParser === 'undefined') return [];

  const membersWithRss = members.filter(m => m.rss_url);
  if (membersWithRss.length === 0) return [];

  const cacheKey = 'startrails_rss_cache';
  let cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
  } catch (e) {}

  const now = Date.now();
  const CACHE_TTL = 5 * 60 * 1000;
  const parser = new RSSParser();
  const rssPosts = [];

  for (const member of membersWithRss) {
    const memberCache = cache[member.id];
    if (memberCache && (now - memberCache.ts) < CACHE_TTL) {
      rssPosts.push(...memberCache.posts);
      continue;
    }

    try {
      const feed = await parser.parseURL(
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(member.rss_url)
      );
      const posts = (feed.items || []).slice(0, 5).map(item => ({
        id: 'rss_' + member.id + '_' + (item.guid || item.link || Math.random().toString(36)),
        title: item.title || '无标题',
        summary: (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').substring(0, 200),
        published_at: item.isoDate || item.pubDate || new Date().toISOString(),
        url: item.link || member.url,
        tags: member.tags.slice(0, 3),
        source_name: member.name,
        source_id: member.id
      }));
      cache[member.id] = { ts: now, posts };
      rssPosts.push(...posts);
    } catch (e) {
      console.warn('[StarTrails] RSS fetch failed for', member.name, e.message);
    }
  }

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (e) {}

  return rssPosts;
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  initParticles();
  initParticleMouse();
  initNav();
  initScrollReveal();

  // Passive 事件监听器
  const passiveOpts = { passive: true };
  window.addEventListener('scroll', () => {}, passiveOpts);
  window.addEventListener('touchstart', () => {}, passiveOpts);
  window.addEventListener('touchmove', () => {}, passiveOpts);

  // 首屏就绪标记
  if (typeof performance !== 'undefined') {
    performance.mark('startrails-ready');
  }

  console.log('[StarTrails] 初始化完成');
});


/* ===== 星电波弹幕系统 ===== */
let danmakuData = [];
let danmakuEnabled = true;
let danmakuAnimId = null;
let danmakuPaused = false;
let danmakuPool = [];
let danmakuCanvas = null, danmakuCtx = null;
let danmakuResizeTimer = null;
let danmakuSpawnTimer = 0;
let danmakuIndex = 0;
const DANMAKU_SPAWN_INTERVAL = 80;

const DANMAKU_FALLBACK = [
  {name:"旅行者1号", text:"正在穿越小行星带，信号稳定 🚀"},
  {name:"深空信使", text:"前方发现未知星系，准备跃迁 ✦"},
  {name:"星尘观测者", text:"信号微弱，正在增强接收..."}
];

async function loadDanmaku() {
  try {
    const resp = await fetch('data/danmu.json');
    if (resp.ok) { danmakuData = await resp.json(); }
    else { danmakuData = DANMAKU_FALLBACK; }
  } catch (e) { danmakuData = DANMAKU_FALLBACK; }
  shuffleDanmakuArray(danmakuData);
}

function shuffleDanmakuArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function initDanmakuCanvas() {
  danmakuCanvas = document.getElementById('danmaku-canvas');
  if (!danmakuCanvas) return;
  danmakuCtx = danmakuCanvas.getContext('2d');
  resizeDanmakuCanvas();
  window.addEventListener('resize', () => {
    clearTimeout(danmakuResizeTimer);
    danmakuResizeTimer = setTimeout(resizeDanmakuCanvas, 200);
  });
  danmakuCanvas.addEventListener('mouseenter', () => { danmakuPaused = true; });
  danmakuCanvas.addEventListener('mouseleave', () => { danmakuPaused = false; });
  const saved = localStorage.getItem('danmaku_enabled');
  if (saved === 'false') {
    danmakuEnabled = false;
    danmakuCanvas.style.display = 'none';
    updateDanmakuToggle();
  }
}

function resizeDanmakuCanvas() {
  if (!danmakuCanvas) return;
  danmakuCanvas.width = window.innerWidth;
  danmakuCanvas.height = window.innerHeight;
}

function toggleDanmaku() {
  danmakuEnabled = !danmakuEnabled;
  localStorage.setItem('danmaku_enabled', danmakuEnabled.toString());
  if (danmakuCanvas) danmakuCanvas.style.display = danmakuEnabled ? 'block' : 'none';
  updateDanmakuToggle();
}

function updateDanmakuToggle() {
  const btn = document.getElementById('danmaku-toggle');
  if (!btn) return;
  if (danmakuEnabled) { btn.classList.add('danmaku-toggle--on'); btn.classList.remove('danmaku-toggle--off'); }
  else { btn.classList.add('danmaku-toggle--off'); btn.classList.remove('danmaku-toggle--on'); }
}

class DanmakuItem {
  constructor(name, text) {
    this.name = name; this.text = text; this.active = true;
    this.reset();
  }
  reset() {
    if (!danmakuCanvas) return;
    const ctx = danmakuCtx;
    const isMobile = window.innerWidth < 768;
    const fs = isMobile ? 8 : 14;
    ctx.font = `bold ${fs}px "Space Grotesk", system-ui, sans-serif`;
    const nw = ctx.measureText(this.name + ': ').width;
    ctx.font = `${fs}px "Space Grotesk", system-ui, sans-serif`;
    const tw = ctx.measureText(this.text).width;
    this.width = nw + tw + 16;
    this.x = danmakuCanvas.width + Math.random() * 300;
    this.y = 20 + Math.random() * 60;
    const dur = 5 + Math.random() * 2;
    this.speed = (danmakuCanvas.width + this.width) / (dur * 60);
  }
  update() {
    if (!danmakuCanvas || !this.active) return;
    this.x -= this.speed;
    if (this.x < -this.width) this.active = false;
  }
  draw() {
    if (!danmakuCtx || !this.active) return;
    const ctx = danmakuCtx;
    const isMobile = window.innerWidth < 768;
    const fs = isMobile ? 8 : 14;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.font = `bold ${fs}px "Space Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = 'rgba(34,211,238,0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText(this.name + ': ', this.x, this.y);
    const nw = ctx.measureText(this.name + ': ').width;
    ctx.font = `${fs}px "Space Grotesk", system-ui, sans-serif`;
    const grad = ctx.createLinearGradient(this.x + nw, this.y, this.x + nw + 200, this.y);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(99,102,241,0.3)';
    ctx.shadowBlur = 20;
    ctx.fillText(this.text, this.x + nw, this.y);
    ctx.restore();
  }
}

function danmakuLoop() {
  if (!danmakuEnabled || danmakuPaused || !danmakuCtx || !danmakuCanvas) {
    danmakuAnimId = requestAnimationFrame(danmakuLoop);
    return;
  }
  const ctx = danmakuCtx;
  ctx.clearRect(0, danmakuCanvas.height - 120, danmakuCanvas.width, 120);
  danmakuSpawnTimer++;
  const isMobile = window.innerWidth < 768;
  const maxActive = isMobile ? 3 : 6;
  const activeCount = danmakuPool.filter(d => d.active).length;
  if (activeCount < maxActive && danmakuSpawnTimer >= DANMAKU_SPAWN_INTERVAL && danmakuData.length > 0) {
    danmakuSpawnTimer = 0;
    const data = danmakuData[danmakuIndex % danmakuData.length];
    danmakuPool.push(new DanmakuItem(data.name, data.text));
    danmakuIndex++;
    if (danmakuIndex >= danmakuData.length) {
      danmakuIndex = 0;
      shuffleDanmakuArray(danmakuData);
    }
  }
  for (let i = danmakuPool.length - 1; i >= 0; i--) {
    danmakuPool[i].update();
    danmakuPool[i].draw();
    if (!danmakuPool[i].active) danmakuPool.splice(i, 1);
  }
  danmakuAnimId = requestAnimationFrame(danmakuLoop);
}

function startDanmaku() {
  if (danmakuAnimId) return;
  danmakuAnimId = requestAnimationFrame(danmakuLoop);
}

/* ===== 收藏功能「标记星标」 ===== */
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch (e) { return []; }
}
function saveFavorites(favs) { localStorage.setItem('favorites', JSON.stringify(favs)); }
function toggleFavorite(id, name, url, type) {
  const favs = getFavorites();
  const idx = favs.findIndex(f => f.id === id && f.type === type);
  if (idx >= 0) { favs.splice(idx, 1); saveFavorites(favs); checkAchievements(); return false; }
  else { favs.push({id, name, url, type}); saveFavorites(favs); checkAchievements(); return true; }
}
function isFavorited(id, type) {
  return getFavorites().some(f => f.id === id && f.type === type);
}
function renderFavoriteBtn(id, name, url, type) {
  const fav = isFavorited(id, type);
  const sid = id.replace(/'/g, "\'");
  const sname = (name||'').replace(/'/g, "\'");
  const surl = (url||'').replace(/'/g, "\'");
  return `<button class="fav-btn${fav ? ' fav-btn--active' : ''}" onclick="event.stopPropagation();handleFavoriteClick(this,'${sid}','${sname}','${surl}','${type}')">${fav ? '★ 已收藏' : '☆ 收藏'}</button>`;
}
function handleFavoriteClick(btn, id, name, url, type) {
  const isNowFav = toggleFavorite(id, name, url, type);
  if (isNowFav) { btn.classList.add('fav-btn--active'); btn.textContent = '★ 已收藏'; }
  else { btn.classList.remove('fav-btn--active'); btn.textContent = '☆ 收藏'; }
}

/* ===== 探索日志 ===== */
function getExplored() {
  try { return JSON.parse(localStorage.getItem('explored') || '[]'); } catch (e) { return []; }
}
function addExplored(id, name, url) {
  const explored = getExplored();
  if (!explored.some(e => e.id === id)) {
    explored.push({id, name, url, timestamp: Date.now()});
    localStorage.setItem('explored', JSON.stringify(explored));
  }
  recordVisitedTags();
  checkAchievements();
}
function recordVisitedTags() {
  const explored = getExplored();
  const exploredIds = new Set(explored.map(e => e.id));
  let visitedTags = [];
  try { visitedTags = JSON.parse(localStorage.getItem('visitedTags') || '[]'); } catch (e) {}
  if (typeof localBlogs !== 'undefined' && localBlogs) {
    localBlogs.forEach(blog => {
      if (exploredIds.has(blog.id) && blog.tags && blog.tags.length > 0) {
        blog.tags.forEach(t => { if (t && !visitedTags.includes(t)) visitedTags.push(t); });
      }
    });
  }
  localStorage.setItem('visitedTags', JSON.stringify(visitedTags));
}

/* ===== 成就系统「星际旅者档案」 ===== */
const ACHIEVEMENTS = [
  {id:'traveler', name:'星际旅者', desc:'探索 10 个博客', icon:'🌠', check:() => getExplored().length >= 10},
  {id:'cartographer', name:'星图绘制者', desc:'收藏 5 个博客/文章', icon:'🗺️', check:() => getFavorites().length >= 5},
  {id:'centurion', name:'百光年穿越', desc:'探索 50 个博客', icon:'🌌', check:() => getExplored().length >= 50},
  {id:'collector', name:'星系收藏家', desc:'收藏 20 个博客/文章', icon:'✧', check:() => getFavorites().length >= 20},
  {id:'tracker', name:'信号追踪者', desc:'访问 5 个不同标签', icon:'📡', check:() => { try { return JSON.parse(localStorage.getItem('visitedTags')||'[]').length >= 5; } catch(e) { return false; } }}
];
function getUnlockedAchievements() {
  try { return JSON.parse(localStorage.getItem('achievements') || '[]'); } catch (e) { return []; }
}
function checkAchievements() {
  const unlocked = getUnlockedAchievements();
  ACHIEVEMENTS.forEach(ach => {
    if (!unlocked.includes(ach.id) && ach.check()) {
      unlocked.push(ach.id);
      localStorage.setItem('achievements', JSON.stringify(unlocked));
      showAchievementToast(ach);
      playAchievementSound();
    }
  });
}
function showAchievementToast(ach) {
  const el = document.getElementById('achievement-toast');
  if (!el) return;
  el.innerHTML = `<div class="achievement-toast__icon">${ach.icon}</div><div class="achievement-toast__content"><div class="achievement-toast__label">成就解锁</div><div class="achievement-toast__name">${ach.name}</div></div>`;
  el.className = 'achievement-toast achievement-toast--show';
  setTimeout(() => { el.classList.remove('achievement-toast--show'); }, 3000);
}
function playAchievementSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}
function renderAchievements() {
  const container = document.getElementById('go-achievements-grid');
  if (!container) return;
  const unlocked = getUnlockedAchievements();
  container.innerHTML = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    return `<div class="ach-card ${isUnlocked ? 'ach-card--unlocked' : 'ach-card--locked'}">
      <div class="ach-card__icon">${a.icon}</div>
      <div class="ach-card__name">${a.name}</div>
      <div class="ach-card__desc">${a.desc}</div>
      <div class="ach-card__status ${isUnlocked ? 'ach-card__status--done' : 'ach-card__status--lock'}">${isUnlocked ? '已解锁' : '🔒 未解锁'}</div>
    </div>`;
  }).join('');
}

/* ===== 星际广播「深空信号」 ===== */
let broadcastData = [];
const BROADCAST_FALLBACK = [
  {time: Date.now() - 60000, text: "旅行者1号 刚刚探索了 阮一峰的网络日志 🚀"},
  {time: Date.now() - 300000, text: "新博客 月光博客 已加入星图 ✦"},
  {time: Date.now() - 3600000, text: "星尘观测者 收藏了 Rust异步编程深度解析 ⭐"}
];
async function loadBroadcast() {
  try {
    const resp = await fetch('data/broadcast.json');
    if (resp.ok) {
      const data = await resp.json();
      broadcastData = (data.events || []).sort((a, b) => b.time - a.time);
    } else { broadcastData = BROADCAST_FALLBACK; }
  } catch (e) { broadcastData = BROADCAST_FALLBACK; }
}
function getRelativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}
function initBroadcast() {
  const track = document.getElementById('broadcast-track');
  if (!track || broadcastData.length === 0) return;
  const colors = ['#6366f1', '#3b82f6', '#22d3ee'];
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const recent = broadcastData.filter(b => (now - b.time) < SEVEN_DAYS);
  if (recent.length === 0) {
    track.innerHTML = '<span style="color:var(--color-text-muted);">✦ 暂无近期信号</span>';
    return;
  }
  const items = recent.map((b, i) => {
    const color = colors[i % colors.length];
    return `<span class="broadcast-item" style="color:${color};">✦ ${b.text} <span class="broadcast-time">· ${getRelativeTime(b.time)}</span></span>`;
  });
  const content = items.join('&nbsp;&nbsp;&nbsp;&nbsp;') + '&nbsp;&nbsp;&nbsp;&nbsp;' + items.join('&nbsp;&nbsp;&nbsp;&nbsp;');
  track.innerHTML = content;
  const container = document.getElementById('broadcast-container');
  if (container) {
    container.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
    container.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
  }
}

/* ===== 时空裂隙 ===== */
let riftData = null;
const RIFT_FALLBACK = {featured:{name:"寒影·栖居",url:"https://msoceo.github.io",description:"记录思考，分享工具，在沉寂中沉淀，于代码间生光。",tags:["技术","设计","生活"],weekStart:"2026-06-16T00:00:00Z",weekEnd:"2026-06-23T00:00:00Z"}};
async function loadRift() {
  try {
    const resp = await fetch('data/rift.json');
    if (resp.ok) { riftData = await resp.json(); }
    else { riftData = RIFT_FALLBACK; }
  } catch (e) { riftData = RIFT_FALLBACK; }
}
function initRift() {
  if (!riftData || !riftData.featured) return;
  const f = riftData.featured;
  document.getElementById('rift-name').textContent = f.name;
  document.getElementById('rift-desc').textContent = f.description || '';
  document.getElementById('rift-tags').innerHTML = (f.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  document.getElementById('rift-btn').href = f.url;
  const avatar = document.getElementById('rift-avatar');
  if (f.avatar) {
    avatar.innerHTML = `<img src="${f.avatar}" alt="${f.name}" style="width:64px;height:64px;border-radius:16px;object-fit:cover;" />`;
  } else {
    avatar.textContent = f.name ? f.name[0] : '✦';
  }
  updateRiftCountdown(f.weekEnd);
  setInterval(() => updateRiftCountdown(f.weekEnd), 60000);
}
function updateRiftCountdown(weekEnd) {
  const el = document.getElementById('rift-countdown');
  if (!el || !weekEnd) return;
  const end = new Date(weekEnd);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) { el.textContent = '新一期推荐即将到来'; return; }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  el.textContent = `距离下次刷新还有 ${days} 天 ${hours} 小时`;
}

/* ===== 星图探索进度条 ===== */
function updateProgressBar() {
  const textEl = document.getElementById('members-progress-text');
  const fillEl = document.getElementById('members-progress-fill');
  if (!textEl || !fillEl) return;
  const explored = getExplored();
  const exploredBlogIds = new Set(explored.map(e => e.id));
  let totalBlogs = 0, exploredBlogs = 0;
  if (typeof localBlogs !== 'undefined' && localBlogs && localBlogs.length > 0) {
    totalBlogs = localBlogs.length;
    exploredBlogs = localBlogs.filter(b => b.url && exploredBlogIds.has(b.id)).length;
  } else { totalBlogs = 28; }
  const pct = totalBlogs > 0 ? (exploredBlogs / totalBlogs) * 100 : 0;
  textEl.textContent = `探索进度：已探索 ${exploredBlogs}/${totalBlogs} 个博客`;
  fillEl.style.width = pct + '%';
}

/* ===== 首页数据统计（本地数据源） ===== */
let localBlogs = [];
let localPosts = [];
async function loadLocalData() {
  try {
    const results = await Promise.all([fetch('data/blogs.json'), fetch('data/posts.json')]);
    if (results[0].ok) localBlogs = await results[0].json();
    if (results[1].ok) localPosts = await results[1].json();
  } catch (e) {}
}
function initHomeDataStats() {
  const blogsCount = localBlogs.length;
  const postsCount = localPosts.length;
  const unique = {};
  localBlogs.forEach(b => { if (b.name) unique[b.name] = true; });
  const uniqueBloggers = Object.keys(unique).length;
  animateNumber(document.getElementById('stat-blogs-local'), blogsCount);
  animateNumber(document.getElementById('stat-posts-local'), postsCount);
  animateNumber(document.getElementById('stat-bloggers-local'), uniqueBloggers);
}

/* ===== 我的星标渲染 ===== */
function initFavorites() {
  const grid = document.getElementById('go-favorites-grid');
  const empty = document.getElementById('go-favorites-empty');
  if (!grid || !empty) return;
  const favs = getFavorites();
  if (favs.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = favs.map(f => {
    return `<a href="${f.url}" target="_blank" class="card fav-card-item">
      <div class="fav-card-item__icon">${f.type === 'blog' ? '✦' : '📄'}</div>
      <div class="fav-card-item__info"><div class="fav-card-item__name">${f.name || '未命名'}</div>
      <div class="fav-card-item__type">${f.type === 'blog' ? '博客' : '文章'}</div></div>
      <span style="color:#f59e0b;font-size:0.85rem;">★</span></a>`;
  }).join('');
}

/* ===== 初始化所有新功能 ===== */
async function initNewFeatures() {
  await Promise.all([loadDanmaku(), loadBroadcast(), loadRift(), loadLocalData()]);
  initDanmakuCanvas();
  startDanmaku();
}
initNewFeatures();
