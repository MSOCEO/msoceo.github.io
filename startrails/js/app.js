/* ===== 星迹互联 StarTrails — 全局脚本 ===== */

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
