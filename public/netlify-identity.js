/**
 * Netlify Identity Widget — 初始化脚本
 * 处理登录回调、登出、用户状态
 */
(function () {
  if (typeof window === 'undefined') return;

  function initIdentity() {
    if (!window.netlifyIdentity) return;

    window.netlifyIdentity.on('init', function (user) {
      console.log('[Identity] init', user ? '已登录' : '未登录');
    });

    // 登录成功 → 刷新页面以进入 CMS
    window.netlifyIdentity.on('login', function (user) {
      console.log('[Identity] 登录成功', user.email);
      // 如果当前不在 /admin，跳转到 CMS 后台
      if (!window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/';
      } else {
        window.location.reload();
      }
    });

    // 登出 → 返回首页
    window.netlifyIdentity.on('logout', function () {
      console.log('[Identity] 已登出');
      window.location.href = '/yunjian';
    });

    // 错误处理
    window.netlifyIdentity.on('error', function (err) {
      console.error('[Identity] 错误:', err);
    });

    window.netlifyIdentity.init();
  }

  // 等待 Netlify Identity 脚本加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initIdentity, 500);
    });
  } else {
    setTimeout(initIdentity, 500);
  }
})();
