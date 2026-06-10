export type TabId = 'home' | 'kdramas' | 'cdramas' | 'webtoons' | 'anime' | 'distractions' | 'character-match' | 'secrets' | 'story-editor';

export interface Drama {
  id: string;
  title: string;
  status?: string;
  note?: string;
}

export interface Anime {
  id: string;
  title: string;
  rank: number;
  note?: string;
}

export interface Webtoon {
  id: string;
  title: string;
}
