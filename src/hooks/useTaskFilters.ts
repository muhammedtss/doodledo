// src/hooks/useTaskFilters.ts
import { useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { Task } from '../types';

export const useTaskFilters = (tasks: Task[], selectedDate: Date): Task[] => {
  return useMemo(() => {
    return tasks
      .filter((t) => {
        // Tarihi olmayanları gösterme
        if (!t.dueAt) return false;
        // Sadece seçili günün görevlerini göster
        return isSameDay(new Date(t.dueAt), selectedDate);
      })
      .sort((a, b) => {
        // Tamamlananlar en alta
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
  }, [tasks, selectedDate]);
};