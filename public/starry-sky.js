/**
 * 寒影拾光博客 - 星空背景效果
 * 深蓝星空 + 紫色流星 + 220 颗动态闪烁星星
 * 集成方式：在 Astro BaseLayout 的 <body> 底部引入此脚本
 * 使用 Canvas，pointer-events: none，不干扰页面交互
 */

(function () {
  // 等待 DOM 就绪
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    const canvas = document.createElement("canvas");
    canvas.id = "starry-sky-bg";
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    `;

    // 深蓝星空渐变背景层
    const bg = document.createElement("div");
    bg.id = "starry-sky-gradient";
    bg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      background: radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #050510 60%, #020208 100%);
    `;

    // 暗色模式下调整（博客已用 dark class）
    const style = document.createElement("style");
    style.textContent = `
      /* 星空模式下的内容层级 */
      #site-header { position: relative; z-index: 50; }
      body > div { position: relative; z-index: 1; }
      .search-overlay { z-index: 100; }
      .lightbox-overlay { z-index: 100; }
      #mobile-overlay, #mobile-panel { z-index: 60; }
      .toast { z-index: 200; }
      #back-to-top { z-index: 100; }
      .ripple-container { z-index: 0; }
      .custom-cursor-dot, .custom-cursor-ring { z-index: 9999; }

      /* 星空背景切换到浅色 */
      html:not(.dark) #starry-sky-gradient {
        background: radial-gradient(ellipse at 50% 50%, #1a1a4e 0%, #0d0d28 60%, #050510 100%) !important;
      }

      /* 内容区在星空之上时需要半透明背景 */
      html.dark .ink-card {
        background: rgba(24, 23, 29, 0.75) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      html:not(.dark) .ink-card {
        background: rgba(255, 255, 255, 0.72) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      html.dark .ink-card-alt {
        background: rgba(24, 23, 29, 0.6) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      html:not(.dark) .ink-card-alt {
        background: rgba(255, 255, 255, 0.65) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      /* footer 半透明 */
      footer {
        background: transparent !important;
      }
    `;

    document.head.appendChild(style);
    document.body.prepend(bg);
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let stars = [];
    let meteors = [];
    const STAR_COUNT = 220;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // 星星类
    class Star {
      constructor() {
        this.reset(true);
      }

      reset(initial) {
        this.x = Math.random() * canvas.width;
        this.y = initial
          ? Math.random() * canvas.height
          : Math.random() * canvas.height;
        this.size = Math.random() * 2.2 + 0.5;
        this.baseAlpha = Math.random() * 0.4 + 0.3;
        this.alpha = this.baseAlpha;
        this.twinkleSpeed = Math.random() * 0.05 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        // 15% 是脉冲星，闪烁剧烈
        this.isPulsar = Math.random() < 0.15;
        this.pulseAmp = this.isPulsar ? Math.random() * 0.55 + 0.4 : Math.random() * 0.35 + 0.15;
        // 颜色：大部分白/淡蓝，少量淡紫，脉冲星偏紫
        const rng = Math.random();
        if (rng < 0.55) {
          this.color = [220, 230, 255]; // 淡蓝白
        } else if (rng < 0.8) {
          this.color = [255, 255, 255]; // 纯白
        } else if (rng < 0.95) {
          this.color = [180, 160, 255]; // 淡紫
        } else {
          this.color = [200, 180, 255]; // 脉冲紫
        }
      }

      update() {
        this.twinklePhase += this.twinkleSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * this.pulseAmp;
        this.alpha = Math.max(0.08, Math.min(1, this.alpha));
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // 光晕
        const glow = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 3
        );
        const [r, g, b] = this.color;
        glow.addColorStop(0, `rgba(${r},${g},${b},1)`);
        glow.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // 核心亮点
        ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 流星类（紫色系）
    class Meteor {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width * 1.5 - canvas.width * 0.25;
        this.y = Math.random() * canvas.height * 0.5;
        this.length = Math.random() * 120 + 60;
        this.speed = Math.random() * 6 + 3;
        this.angle = (Math.random() * 20 + 25) * (Math.PI / 180); // 25-45度
        this.alpha = Math.random() * 0.6 + 0.4;
        this.life = 0;
        this.maxLife = 80 + Math.random() * 100;
      }

      update() {
        this.life++;
        if (this.life >= this.maxLife) {
          this.reset();
          // 随机重生延迟
          this.life = -Math.random() * 400;
        }
        if (this.life < 0) return;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
      }

      draw(ctx) {
        if (this.life < 0) return;
        const progress = this.life / this.maxLife;
        // 淡入淡出
        const fadeAlpha =
          this.alpha *
          (progress < 0.1
            ? progress / 0.1
            : progress > 0.8
            ? (1 - progress) / 0.2
            : 1);

        const endX = this.x - Math.cos(this.angle) * this.length;
        const endY = this.y - Math.sin(this.angle) * this.length;

        const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
        gradient.addColorStop(0, `rgba(180, 140, 255, ${fadeAlpha})`);
        gradient.addColorStop(0.3, `rgba(140, 100, 220, ${fadeAlpha * 0.8})`);
        gradient.addColorStop(1, `rgba(100, 60, 180, 0)`);

        ctx.save();
        ctx.globalAlpha = fadeAlpha;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // 头部亮点
        ctx.fillStyle = `rgba(220, 200, 255, ${fadeAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 初始化星空
    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
      }
    }

    // 初始化流星
    function createMeteors() {
      meteors = [];
      for (let i = 0; i < 3; i++) {
        const m = new Meteor();
        m.life = -(i * 200 + Math.random() * 300); // 错开初始时间
        meteors.push(m);
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.update();
        star.draw(ctx);
      }

      for (const meteor of meteors) {
        meteor.update();
        meteor.draw(ctx);
      }

      requestAnimationFrame(animate);
    }

    resize();
    createStars();
    createMeteors();
    animate();

    window.addEventListener("resize", () => {
      resize();
      createStars();
      createMeteors();
    });

    // 监听暗色模式切换，更新卡片毛玻璃
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      document.querySelectorAll(".ink-card").forEach((el) => {
        el.style.background = isDark
          ? "rgba(24, 23, 29, 0.75)"
          : "rgba(255, 255, 255, 0.72)";
      });
      document.querySelectorAll(".ink-card-alt").forEach((el) => {
        el.style.background = isDark
          ? "rgba(24, 23, 29, 0.6)"
          : "rgba(255, 255, 255, 0.65)";
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
})();
