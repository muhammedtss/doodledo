import { useStore } from '../store/useStore';
import { TaskRepository } from '../database/db';

// Repository metodlarını mock'luyoruz
jest.mock('../database/db', () => ({
  initDB: jest.fn(),
  TaskRepository: {
    getAllTasks: jest.fn(() => Promise.resolve([])),
    createTask: jest.fn(() => Promise.resolve()),
    updateTask: jest.fn(() => Promise.resolve()),
    deleteTask: jest.fn(() => Promise.resolve()),
  }
}));

describe('DoodleDo Store Logic', () => {
  beforeEach(() => {
    useStore.setState({ tasks: [], isLoading: false });
    jest.clearAllMocks();
  });

  it('should add a task to the state', async () => {
    const mockTask = {
      id: '1', 
      title: 'Test Task', 
      completed: false, 
      createdAt: 0, 
      updatedAt: 0, 
      reminders: [], 
      attachments: [] 
    };

    // Store action çağır
    await useStore.getState().addTask(mockTask);

    // State güncellendi mi?
    expect(useStore.getState().tasks).toHaveLength(1);
    expect(useStore.getState().tasks[0].title).toBe('Test Task');
    
    // DB çağrıldı mı?
    expect(TaskRepository.createTask).toHaveBeenCalledWith(mockTask);
  });

  it('should toggle task completion', async () => {
    // Başlangıç durumu
    useStore.setState({ 
      tasks: [{ 
        id: '1', title: 'Test', completed: false, 
        createdAt: 0, updatedAt: 0, reminders: [], attachments: [] 
      }] 
    });

    await useStore.getState().toggleComplete('1');

    expect(useStore.getState().tasks[0].completed).toBe(true);
    expect(TaskRepository.updateTask).toHaveBeenCalled();
  });
});