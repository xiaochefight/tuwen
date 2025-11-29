
export interface ContentSection {
  title: string;
  content: string; // Detailed paragraph for slides
}

export interface CardContent {
  title: string;
  summary: string;
  keyPoints: string[]; // Short highlights for the cover
  sections: ContentSection[]; // Rich content for subsequent slides
  category: string;
  emoji: string;
  sentimentColor: string; // Hex code or tailwind color name hint
  readingTime: string;
  authorOrSource: string;
}

export enum CardStyle {
  MINIMALIST = 'MINIMALIST',
  MODERN_GRADIENT = 'MODERN_GRADIENT',
  CYBERPUNK = 'CYBERPUNK',
  NEO_BRUTALISM = 'NEO_BRUTALISM',
  ELEGANT_LUXURY = 'ELEGANT_LUXURY',
  NATURE_ORGANIC = 'NATURE_ORGANIC',
  GLASSMORPHISM = 'GLASSMORPHISM',
  NEWSPAPER = 'NEWSPAPER',
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  hasResult: boolean;
}

export type UserInfoPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'custom';

export interface UserInfo {
  enabled: boolean;
  avatar: string | null; // Base64 string
  nickname: string;
  position: UserInfoPosition;
  customPos: { x: number; y: number }; // Percentage 0-100 relative to card
  scale: number; // 0.8 to 1.2
  opacity: number; // 0.6 to 1.0
}
