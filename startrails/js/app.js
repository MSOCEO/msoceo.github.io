/* ===== 星迹互联 StarTrails — 全局脚本 ===== */

// Supabase 初始化
const SUPABASE_URL = 'https://xwvkdluvixurvgvkhkfe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NOdEPhf8yD4dMRJIH1JqqA_z5By3p0H';

let supabase = null;

function initSupabase() {
  if (typeof supabaseClient !== 'undefined') {
    supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}

// ===== 粒子背景 =====
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  const PARTICLE_COUNT = 80;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();

      // 移动
      p.x += p.speedX;
      p.y += p.speedY;

      // 屏幕边缘回绕
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    // 连线：距离小于120px的粒子之间画微弱连线
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

    animationId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

// ===== 导航栏 =====
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const overlay = document.querySelector('.nav__overlay');

  if (!nav) return;

  // 滚动效果
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  });

  // 移动端菜单
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

  // 移动端菜单链接点击后关闭
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

    if (target > 1000) {
      el.textContent = current.toLocaleString();
    } else {
      el.textContent = current;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (target > 1000) {
        el.textContent = target.toLocaleString();
      } else {
        el.textContent = target;
      }
    }
  }

  requestAnimationFrame(update);
}

// ===== 滚动入场动画 =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    observer.observe(el);
  });
}

// ===== Supabase 数据获取 =====
async function fetchStats() {
  try {
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'online');

    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    return {
      members: memberCount || 0,
      posts: postCount || 0,
      online: memberCount || 0,
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

    query = query.order('joined_at', { ascending: false });

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
    let query = supabase.from('posts').select('*, members(name, url, favicon)');

    if (filters.tag) {
      query = query.contains('members.tags', [filters.tag]);
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

async function submitApplication(formData) {
  try {
    const { error } = await supabase.from('applications').insert({
      blog_name: formData.blogName,
      blog_url: formData.blogUrl,
      description: formData.description,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      rss_url: formData.rssUrl || null,
      applicant_email: formData.email,
      status: 'pending',
    });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error('Failed to submit application:', e);
    return { success: false, error: e.message };
  }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNav();
  initScrollReveal();

  // 尝试初始化 Supabase（需要 SDK）
  if (typeof supabaseClient !== 'undefined') {
    initSupabase();
  }
});
