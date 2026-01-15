export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface BrainrotConcept {
  name: string;
  lore: string;
  visualPrompt: string;
  rarity: Rarity;
}

export interface BrainrotEntry extends BrainrotConcept {
  id: string;
  imageUrl: string;
  modelSheetUrl?: string; // URL for the 3D reference sheet (T-pose)
  isModelLoading?: boolean; // Loading state for the 3D generation
  timestamp: number;
}

export interface BrainrotState {
  entries: BrainrotEntry[];
  isLoading: boolean;
  error: string | null;
}