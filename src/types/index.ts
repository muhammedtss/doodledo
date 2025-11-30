export type UUID = string;
export type TaskCategory = 'Personal' | 'Work' | 'Shopping';

export interface Task {
  id: UUID;
  title: string;
  notes?: string;
  category?: TaskCategory;
  createdAt: number;
  updatedAt: number;
  dueAt?: number;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  recurrence?: string;
  synced?: boolean;
}

export interface AppSettings {
  isDarkMode: boolean;
  soundEnabled: boolean;
  cloudSyncEnabled: boolean;
  defaultReminderTime: number;
  // YENİ: Aktif kullanılan eşyalar
  activePen: string;      // 'default', 'red', 'gold'
  activeBg: string;       // 'grid', 'lines', 'dots'
  activeSticker: string;  // 'none', 'cat', 'fire'
}

export interface UserStats {
  xp: number;
  level: number;
  ink: number;
  streak: number;
  lastTaskDate: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  owned: boolean;
  type: 'pen' | 'bg' | 'sticker'; // Eşya türü (Filtreleme için)
  value: string; // Kod içindeki karşılığı (örn: 'red')
}