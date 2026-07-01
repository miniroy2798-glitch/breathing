export type TabId = 'home' | 'kdramas' | 'cdramas' | 'webtoons' | 'anime' | 'distractions' | 'character-match' | 'secrets' | 'story-editor';

export interface Drama {
  id: string;
  title: string;
  status?: string;
  note?: string;
  rank?: number;
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
  status?: string;
  note?: string;
  rank?: number;
}

export interface FictionalCrush {
  id: string;
  name: string;
  series?: string;
  imageUrl?: string;
  note?: string;
  rank: number;
  imagePosition?: string;
  imageZoom?: string;
}

