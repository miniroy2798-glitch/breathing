import React from 'react';
import { TabId } from '../types';
import { Home, Music, Tv, Star, BookOpen, Lock, Menu, X, Gamepad2, Bookmark, Sparkles, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  children: React.ReactNode;
}

export function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'kdramas', label: 'K-Dramas', icon: <Tv className="w-5 h-5" /> },
    { id: 'cdramas', label: 'C-Dramas & Thai', icon: <Tv className="w-5 h-5" /> },
    { id: 'anime', label: 'Anime', icon: <Star className="w-5 h-5" /> },
    { id: 'webtoons', label: 'Webtoons', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'character-match', label: 'Character Match', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'story-editor', label: 'Story Editor', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'distractions', label: 'Distractions', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'secrets', label: 'Secret Thoughts', icon: <Lock className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-pink-50 text-stone-800 font-sans selection:bg-amber-500/30">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-pink-50/90 backdrop-blur-md border-b border-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
          <Moon className="w-5 h-5 text-amber-500 fill-amber-100" />
          <h1 className="text-xl font-medium tracking-tight text-black">Milen's Vault</h1>
          <Star className="w-4 h-4 text-amber-500 fill-amber-100" />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-stone-600 hover:text-black transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 w-full bg-white border-b border-white z-40"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-white drop-shadow-sm border border-amber-200 text-amber-600' 
                      : 'hover:bg-white/50 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-full bg-white/50 border-r border-white flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Moon className="w-6 h-6 text-amber-500 fill-amber-100" />
            <h1 className="text-2xl font-semibold tracking-tight text-black">Milen's Vault</h1>
            <Star className="w-5 h-5 text-amber-500 fill-amber-100" />
          </div>
          <p className="text-xs font-mono text-amber-600 mt-2 uppercase tracking-wider">Digital Sanctuary</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {tabs.map((tab) => (
             <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
               activeTab === tab.id 
                 ? 'bg-white text-amber-600 border border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                 : 'hover:bg-white/50 text-stone-600 hover:text-stone-900 border border-transparent'
             }`}
           >
             {tab.icon}
             <span className="font-medium text-sm">{tab.label}</span>
           </button>
          ))}
        </nav>
        <div className="p-6 text-xs text-amber-500 font-mono text-center">
          v1.0.0 // Encrypted
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="max-w-4xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
