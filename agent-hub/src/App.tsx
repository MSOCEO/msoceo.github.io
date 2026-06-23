import { useState } from 'react';
import { Header } from './components/Header';
import { Workspace } from './components/Workspace';
import { StoreDrawer } from './components/StoreDrawer';

type DrawerTab = 'tools' | 'models' | 'skills';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('tools');

  const openDrawer = (tab: DrawerTab) => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-root)' }}>
      {/* Fixed Header */}
      <Header
        onOpenStore={() => openDrawer('tools')}
        onOpenSkills={() => openDrawer('skills')}
      />

      {/* Hero / Intro Section */}
      <section className="pt-20 pb-8 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 10%, var(--accent), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, var(--cyan), transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent-light)',
              border: '1px solid var(--border-accent)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--accent)' }}/>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--accent-light)' }}/>
            </span>
            WebGPU 本地推理引擎已就绪
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            所有 AI 工具
            <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-light), var(--cyan-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              一个控制台
            </span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            在浏览器中本地运行大模型。选择模型、启用技能、开启思考模式 —— 所有数据留在你的设备上。
          </p>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="flex-1 px-4 sm:px-6 pb-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              height: 'calc(100vh - 320px)',
              minHeight: '520px',
            }}
          >
            <Workspace
              onOpenStore={() => openDrawer('tools')}
              onOpenSkills={() => openDrawer('skills')}
            />
          </div>
        </div>
      </section>

      {/* Feature Bar */}
      <section className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛡️', title: '100% 隐私', desc: '推理在浏览器本地执行，对话数据不会上传到任何服务器' },
              { icon: '🧠', title: '6 款模型', desc: '内置 Gemma、Phi、Llama、Qwen、DeepSeek 等主流开源模型' },
              { icon: '⚡', title: 'WebGPU 加速', desc: '利用 GPU 硬件加速推理，低延迟流式输出' },
              { icon: '🔌', title: '工具生态', desc: '一键接入 SD WebUI、ComfyUI、OpenHands 等 22+ 工具' },
            ].map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl text-center transition-all duration-200 hover-lift"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>聚合控制台 v4.0</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>基于 WebLLM 构建</span>
            <span>·</span>
            <span>本地运行 · 零数据泄露</span>
          </div>
        </div>
      </footer>

      {/* Store Drawer */}
      <StoreDrawer
        open={drawerOpen}
        initialTab={drawerTab}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default App;
