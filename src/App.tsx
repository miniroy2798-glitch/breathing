import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Kdramas } from './components/Kdramas';
import { Cdramas } from './components/Cdramas';
import { Webtoons } from './components/Webtoons';
import { Anime } from './components/Anime';
import { Distractions } from './components/Distractions';
import { Secrets } from './components/Secrets';
import { TabId } from './types';
import { AnimatePresence } from 'motion/react';
import { DistractionApp } from './components/DistractionApp';
import { CharacterMatch } from './components/CharacterMatch';
import { StoryEditor } from './components/StoryEditor';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    return (localStorage.getItem('app_active_tab') as TabId) || 'home';
  });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_active_tab', activeTab);
  }, [activeTab]);

  if (!isUnlocked) {
    return <DistractionApp onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <Home key="home" />}
        {activeTab === 'kdramas' && <Kdramas key="kdramas" />}
        {activeTab === 'cdramas' && <Cdramas key="cdramas" />}
        {activeTab === 'anime' && <Anime key="anime" />}
        {activeTab === 'webtoons' && <Webtoons key="webtoons" />}
        {activeTab === 'distractions' && <Distractions key="distractions" />}
        {activeTab === 'character-match' && <CharacterMatch key="character-match" />}
        {activeTab === 'story-editor' && <StoryEditor key="story-editor" />}
        {activeTab === 'secrets' && <Secrets key="secrets" />}
      </AnimatePresence>
    </Layout>
  );
}
