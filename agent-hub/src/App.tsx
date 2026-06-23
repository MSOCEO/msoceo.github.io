import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Workspace from './components/Workspace';
import Features from './components/Features';
import Footer from './components/Footer';
import StoreDrawer from './components/StoreDrawer';

export default function App() {
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeTab, setStoreTab] = useState<string | undefined>();

  // Detect WebGPU
  const [webgpu, setWebgpu] = useState(false);
  useState(() => {
    if ('gpu' in navigator) {
      (navigator as any).gpu.requestAdapter().then((a: any) => setWebgpu(!!a)).catch(() => {});
    }
  });

  const openStore = (tab?: string) => { setStoreTab(tab); setStoreOpen(true); };
  const closeStore = () => setStoreOpen(false);

  return (
    <div className="relative min-h-screen">
      {/* Ambient glows */}
      <div className="ambient-glow ambient-glow-blue" />
      <div className="ambient-glow ambient-glow-cyan" />

      {/* Header */}
      <Header
        webgpu={webgpu}
        onOpenStore={() => openStore('tools')}
        onOpenSkills={() => openStore('skills')}
      />

      {/* Hero */}
      <Hero />

      {/* Workspace */}
      <Workspace onOpenStore={openStore} />

      {/* Features */}
      <Features />

      {/* Footer */}
      <Footer />

      {/* Store Drawer */}
      <StoreDrawer
        open={storeOpen}
        initialTab={storeTab}
        onClose={closeStore}
      />
    </div>
  );
}
