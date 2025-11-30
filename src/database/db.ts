import * as SQLite from 'expo-sqlite';
import { Task, UUID, UserStats } from '../types';

let db: any = null;

const getDB = async () => {
  if (db) return db;
  // OYUN VERİTABANI BAŞLATILIYOR...
  db = await SQLite.openDatabaseAsync('doodledo_game_v1.db');
  return db;
};

export const initDB = async () => {
  try {
    const database = await getDB();
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- GÖREVLER
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, title TEXT, notes TEXT, category TEXT, createdAt INTEGER, updatedAt INTEGER, dueAt INTEGER, priority TEXT, completed INTEGER, recurrence TEXT, synced INTEGER
      );

      -- İSTATİSTİKLER (Tek satır olacak)
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        ink INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        lastTaskDate INTEGER DEFAULT 0
      );

      -- ENVANTER (Satın alınanlar)
      CREATE TABLE IF NOT EXISTS inventory (
        item_id TEXT PRIMARY KEY
      );

      -- İstatistiği başlat (Eğer yoksa)
      INSERT OR IGNORE INTO user_stats (id, xp, level, ink, streak, lastTaskDate) VALUES (1, 0, 1, 0, 0, 0);
    `);
  } catch (error) {
    console.error("DB Init Error:", error);
  }
};

export const TaskRepository = {
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const database = await getDB();
      const rows = await database.getAllAsync('SELECT * FROM tasks ORDER BY dueAt ASC') as any[];
      return rows.map((item) => ({
        ...item,
        category: item.category,
        completed: item.completed === 1,
        synced: item.synced === 1
      }));
    } catch (e) { return []; }
  },

  createTask: async (task: Task) => {
    try {
      const database = await getDB();
      await database.runAsync(
        `INSERT INTO tasks (id, title, notes, category, createdAt, updatedAt, dueAt, priority, completed, recurrence, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [task.id, task.title, task.notes || '', task.category || 'Personal', task.createdAt, task.updatedAt, task.dueAt || null, task.priority || 'medium', task.completed ? 1 : 0, task.recurrence || null, 0]
      );
    } catch (e) { console.log(e); }
  },

  updateTask: async (task: Task) => {
    try {
      const database = await getDB();
      await database.runAsync(
        `UPDATE tasks SET title=?, notes=?, category=?, updatedAt=?, dueAt=?, priority=?, completed=?, recurrence=?, synced=0 WHERE id=?`,
        [task.title, task.notes || '', task.category || 'Personal', Date.now(), task.dueAt || null, task.priority, task.completed ? 1 : 0, task.recurrence || null, task.id]
      );
    } catch (e) { console.log(e); }
  },
  
  deleteTask: async (id: UUID) => {
    try {
      const database = await getDB();
      await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    } catch (e) { console.log(e); }
  },

  // --- OYUN FONKSİYONLARI ---

  getStats: async (): Promise<UserStats> => {
    try {
      const database = await getDB();
      const result = await database.getFirstAsync('SELECT * FROM user_stats WHERE id = 1') as any;
      return result || { xp: 0, level: 1, ink: 0, streak: 0, lastTaskDate: 0 };
    } catch (e) { return { xp: 0, level: 1, ink: 0, streak: 0, lastTaskDate: 0 }; }
  },

  updateStats: async (stats: UserStats) => {
    try {
      const database = await getDB();
      await database.runAsync(
        `UPDATE user_stats SET xp = ?, level = ?, ink = ?, streak = ?, lastTaskDate = ? WHERE id = 1`,
        [stats.xp, stats.level, stats.ink, stats.streak, stats.lastTaskDate]
      );
    } catch (e) { console.log("Stats Update Error", e); }
  },

  getInventory: async (): Promise<string[]> => {
    try {
      const database = await getDB();
      const rows = await database.getAllAsync('SELECT item_id FROM inventory') as any[];
      return rows.map(r => r.item_id);
    } catch (e) { return []; }
  },

  addToInventory: async (itemId: string) => {
    try {
      const database = await getDB();
      await database.runAsync(`INSERT OR IGNORE INTO inventory (item_id) VALUES (?)`, [itemId]);
    } catch (e) { console.log(e); }
  }
};