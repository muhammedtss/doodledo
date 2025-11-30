import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker'; // YENİ
import { isSameDay, subDays } from 'date-fns';
import { Task, AppSettings, UUID, UserStats, ShopItem } from '../types';
import { TaskRepository, initDB } from '../database/db';
import { NotificationService } from '../services/NotificationService';
import { Alert } from 'react-native';

// --- GÜNCELLENMİŞ MARKET ---
export const SHOP_ITEMS: ShopItem[] = [
  // Kağıtlar
  { id: 'bg_lines', name: 'Çizgili Defter', price: 150, icon: '📝', description: 'Yazarlar için satırlar.', owned: false, type: 'bg', value: 'lines' },
  { id: 'bg_dots', name: 'Noktalı Defter', price: 150, icon: '::: ', description: 'Mimar noktaları.', owned: false, type: 'bg', value: 'dots' },
  
  // Kalemler
  { id: 'pen_red', name: 'Kırmızı Kalem', price: 200, icon: '🖍️', description: 'Görevler kırmızı görünür.', owned: false, type: 'pen', value: 'red' },
  { id: 'pen_gold', name: 'Altın Kalem', price: 1000, icon: '👑', description: 'Zenginlik belirtisi.', owned: false, type: 'pen', value: 'gold' },

  // Stickerlar (YENİ EĞLENCE)
  { id: 'sticker_cat', name: 'Kedi Patisi', price: 300, icon: '🐾', description: 'Görevlerde pati izleri.', owned: false, type: 'sticker', value: 'cat' },
  { id: 'sticker_fire', name: 'Alev Modu', price: 250, icon: '🔥', description: 'Görevler yanıyor!', owned: false, type: 'sticker', value: 'fire' },
];

interface StoreState {
  tasks: Task[];
  stats: UserStats;
  inventory: string[];
  shopItems: ShopItem[];
  isLoading: boolean;
  settings: AppSettings;
  
  initialize: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: UUID) => Promise<void>;
  toggleComplete: (id: UUID) => Promise<void>;
  buyItem: (itemId: string) => Promise<void>;
  equipItem: (item: ShopItem) => void; // YENİ: Kullan
  unequipItem: (type: 'pen'|'bg'|'sticker') => void; // YENİ: Çıkar
  toggleDarkMode: (val: boolean) => void;
  debugAddInk: () => void;
  exportData: () => Promise<string>;
  importData: () => Promise<void>; // YENİ: İçe Aktar
}

export const useStore = create<StoreState>((set, get) => ({
  tasks: [],
  stats: { xp: 0, level: 1, ink: 0, streak: 0, lastTaskDate: 0 },
  inventory: [],
  shopItems: SHOP_ITEMS,
  isLoading: true,
  
  // Varsayılan Ayarlar
  settings: { 
      isDarkMode: false, soundEnabled: true, cloudSyncEnabled: false, defaultReminderTime: 10,
      activePen: 'default', activeBg: 'grid', activeSticker: 'none'
  },

  initialize: async () => {
    try {
      await initDB();
      const tasks = await TaskRepository.getAllTasks();
      const stats = await TaskRepository.getStats();
      const inventory = await TaskRepository.getInventory();
      
      const updatedShop = SHOP_ITEMS.map(item => ({ ...item, owned: inventory.includes(item.id) }));
      set({ tasks, stats, inventory, shopItems: updatedShop, isLoading: false });
    } catch (e) { set({ isLoading: false }); }
  },

  addTask: async (task: Task) => {
    try {
      await TaskRepository.createTask(task);
      set((s) => ({ tasks: [...s.tasks, task] }));
      const deadline = task.dueAt;
      if (typeof deadline === 'number' && deadline > 0) {
         const reminderTime = deadline - 600000;
         await NotificationService.scheduleReminder("DoodleDo", task.title, reminderTime);
      }
    } catch (e) { console.log(e); }
  },

  updateTask: async (task: Task) => {
    await TaskRepository.updateTask(task);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) }));
  },

  deleteTask: async (id: UUID) => {
    await TaskRepository.deleteTask(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  toggleComplete: async (id: UUID) => {
    const { tasks, stats } = get();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const isCompleting = !task.completed;
      const updated = { ...task, completed: isCompleting };
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
      await TaskRepository.updateTask(updated);

      if (isCompleting) {
        let newStats = { ...stats };
        newStats.xp += 20;
        newStats.ink += 10;
        
        if (newStats.xp >= newStats.level * 100) {
            newStats.level += 1;
            Alert.alert("LEVEL UP! 🎉", `Seviye ${newStats.level} oldun!`);
        }
        
        const today = new Date();
        const last = new Date(newStats.lastTaskDate || 0);
        if (!isSameDay(today, last)) {
            newStats.streak = isSameDay(last, subDays(today, 1)) ? newStats.streak + 1 : 1;
            newStats.lastTaskDate = today.getTime();
        }
        await TaskRepository.updateStats(newStats);
        set({ stats: newStats });
      }
    }
  },

  buyItem: async (itemId: string) => {
    const { stats, shopItems, inventory } = get();
    const item = shopItems.find(i => i.id === itemId);
    if (!item || inventory.includes(itemId)) return;

    if (stats.ink >= item.price) {
        const newStats = { ...stats, ink: stats.ink - item.price };
        const newInventory = [...inventory, itemId];
        const newShopItems = shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i);
        set({ stats: newStats, inventory: newInventory, shopItems: newShopItems });
        await TaskRepository.updateStats(newStats);
        await TaskRepository.addToInventory(itemId);
        
        // Satın alınca otomatik kuşan
        get().equipItem(item!);
        
        Alert.alert("Satın Alındı! 🛍️", item.name);
    } else {
        Alert.alert("Yetersiz Bakiye", `${item.price - stats.ink} daha lazım.`);
    }
  },

  // EŞYA KULLANMA MANTIĞI
  equipItem: (item: ShopItem) => {
      set((state) => {
          const newSettings = { ...state.settings };
          if (item.type === 'pen') newSettings.activePen = item.value;
          if (item.type === 'bg') newSettings.activeBg = item.value;
          if (item.type === 'sticker') newSettings.activeSticker = item.value;
          return { settings: newSettings };
      });
  },

  // EŞYA ÇIKARMA (Varsayılana Dön)
  unequipItem: (type: 'pen'|'bg'|'sticker') => {
      set((state) => {
          const newSettings = { ...state.settings };
          if (type === 'pen') newSettings.activePen = 'default';
          if (type === 'bg') newSettings.activeBg = 'grid'; // Varsayılan kareli
          if (type === 'sticker') newSettings.activeSticker = 'none';
          return { settings: newSettings };
      });
  },

  toggleDarkMode: (val: boolean) => set(s => ({ settings: { ...s.settings, isDarkMode: val } })),
  
  debugAddInk: () => {
      const { stats } = get();
      const newStats = { ...stats, ink: stats.ink + 500 };
      set({ stats: newStats });
      TaskRepository.updateStats(newStats);
      Alert.alert("Hile", "+500 Mürekkep");
  },

  exportData: async () => {
    try {
        // @ts-ignore
        const docDir = FileSystem.documentDirectory;
        if (!docDir) return "Error";
        const uri = docDir + 'backup.json';
        await FileSystem.writeAsStringAsync(uri, JSON.stringify(get().tasks));
        return uri;
    } catch (e) { return "Error"; }
  },

  // YENİ: İÇERİ AKTARMA
  importData: async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({
              type: 'application/json',
              copyToCacheDirectory: true
          });

          if (result.canceled) return;

          const fileUri = result.assets[0].uri;
          const jsonContent = await FileSystem.readAsStringAsync(fileUri);
          const parsedTasks: Task[] = JSON.parse(jsonContent);

          if (!Array.isArray(parsedTasks)) {
              Alert.alert("Hata", "Geçersiz yedek dosyası.");
              return;
          }

          // Veritabanına ekle
          for (const task of parsedTasks) {
              await TaskRepository.createTask(task);
          }
          
          // State'i güncelle
          await get().initialize(); 
          Alert.alert("Başarılı", `${parsedTasks.length} görev geri yüklendi!`);

      } catch (e) {
          Alert.alert("Hata", "Dosya okunamadı.");
      }
  }
}));