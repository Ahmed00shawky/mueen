import { User, Task, Note, Notification, UserSettings, NewsItem, UserRole, UserStatus, Permission, Language, Theme } from "./types";

interface Employee {
  name: string;
  monthlyLeaveAllowance: number;
}

// Default admin user
const defaultAdmin: User = {
  id: "1",
  username: "Ahmed",
  password: "12345", // In a real app, this would be properly hashed
  role: UserRole.Admin,
  status: UserStatus.Offline,
  permissions: Object.values(Permission) as Permission[],
  lastLogin: new Date().toISOString()
};

class EventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

class LocalStorage {
  private storagePrefix = "mueen_";
  private eventEmitter = new EventEmitter();

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!this.getUsers().length) {
      this.setUsers([defaultAdmin]);
      // Initialize storage for default admin
      this.initializeUserStorage(defaultAdmin.id);
    }
  }

  private initializeUserStorage(userId: string): void {
    // Initialize all user-specific storage
    if (!localStorage.getItem(`${this.storagePrefix}tasks_${userId}`)) {
      localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify([]));
    }
    if (!localStorage.getItem(`${this.storagePrefix}notes_${userId}`)) {
      localStorage.setItem(`${this.storagePrefix}notes_${userId}`, JSON.stringify([]));
    }
    if (!localStorage.getItem(`${this.storagePrefix}leaves_${userId}`)) {
      localStorage.setItem(`${this.storagePrefix}leaves_${userId}`, JSON.stringify([]));
    }
    if (!localStorage.getItem(`${this.storagePrefix}settings_${userId}`)) {
      localStorage.setItem(`${this.storagePrefix}settings_${userId}`, JSON.stringify({
        userId,
        language: Language.English,
        theme: Theme.Light
      }));
    }
  }

  // Users
  getUsers(): User[] {
    try {
      const users = localStorage.getItem(`${this.storagePrefix}users`);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  setUsers(users: User[]): void {
    try {
      localStorage.setItem(`${this.storagePrefix}users`, JSON.stringify(users));
    } catch (error) {
      console.error('Error setting users:', error);
    }
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(user => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find(user => user.username === username);
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
    // Initialize storage for new user
    this.initializeUserStorage(user.id);
    this.eventEmitter.emit('user_update', { type: 'user_added', user });
  }

  updateUser(updatedUser: User): void {
    try {
      const users = this.getUsers();
      const index = users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        users[index] = updatedUser;
        this.setUsers(users);
        this.eventEmitter.emit('user_update', { user: updatedUser });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  updateUserStatus(userId: string, status: UserStatus): void {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        user.status = status;
        this.setUsers(users);
        this.eventEmitter.emit('user_update', { user });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(user => user.id !== id);
    this.setUsers(users);
    // Clean up user-specific storage
    localStorage.removeItem(`${this.storagePrefix}tasks_${id}`);
    localStorage.removeItem(`${this.storagePrefix}notes_${id}`);
    localStorage.removeItem(`${this.storagePrefix}leaves_${id}`);
    localStorage.removeItem(`${this.storagePrefix}settings_${id}`);
    this.eventEmitter.emit('user_update', { type: 'user_deleted', userId: id });
  }

  // Tasks
  getTasksByUserId(userId: string, currentUser: User): Task[] {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        const tasks = localStorage.getItem(`${this.storagePrefix}tasks_${userId}`);
        return tasks ? JSON.parse(tasks) : [];
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  setTasksForUser(userId: string, tasks: Task[], currentUser: User): void {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        localStorage.setItem(`${this.storagePrefix}tasks_${userId}`, JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Error setting tasks:', error);
    }
  }

  addTaskForUser(userId: string, task: Task, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const tasks = this.getTasksByUserId(userId, currentUser);
      tasks.push(task);
      this.setTasksForUser(userId, tasks, currentUser);
    }
  }

  updateTaskForUser(userId: string, updatedTask: Task, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const tasks = this.getTasksByUserId(userId, currentUser).map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      this.setTasksForUser(userId, tasks, currentUser);
    }
  }

  deleteTaskForUser(userId: string, taskId: string, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const tasks = this.getTasksByUserId(userId, currentUser).filter(task => task.id !== taskId);
      this.setTasksForUser(userId, tasks, currentUser);
    }
  }

  // Notes
  getNotesByUserId(userId: string, currentUser: User): Note[] {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        const notes = localStorage.getItem(`${this.storagePrefix}notes_${userId}`);
        return notes ? JSON.parse(notes) : [];
      }
      return [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  setNotesForUser(userId: string, notes: Note[], currentUser: User): void {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        localStorage.setItem(`${this.storagePrefix}notes_${userId}`, JSON.stringify(notes));
      }
    } catch (error) {
      console.error('Error setting notes:', error);
    }
  }

  addNoteForUser(userId: string, note: Note, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const notes = this.getNotesByUserId(userId, currentUser);
      notes.push(note);
      this.setNotesForUser(userId, notes, currentUser);
    }
  }

  updateNoteForUser(userId: string, updatedNote: Note, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const notes = this.getNotesByUserId(userId, currentUser).map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      this.setNotesForUser(userId, notes, currentUser);
    }
  }

  deleteNoteForUser(userId: string, noteId: string, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const notes = this.getNotesByUserId(userId, currentUser).filter(note => note.id !== noteId);
      this.setNotesForUser(userId, notes, currentUser);
    }
  }

  // Leaves
  getLeavesByUserId(userId: string, currentUser: User): any[] {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        const leaves = localStorage.getItem(`${this.storagePrefix}leaves_${userId}`);
        return leaves ? JSON.parse(leaves) : [];
      }
      return [];
    } catch (error) {
      console.error('Error getting leaves:', error);
      return [];
    }
  }

  setLeavesForUser(userId: string, leaves: any[], currentUser: User): void {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        localStorage.setItem(`${this.storagePrefix}leaves_${userId}`, JSON.stringify(leaves));
      }
    } catch (error) {
      console.error('Error setting leaves:', error);
    }
  }

  addLeaveForUser(userId: string, leave: any, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const leaves = this.getLeavesByUserId(userId, currentUser);
      leaves.push(leave);
      this.setLeavesForUser(userId, leaves, currentUser);
    }
  }

  updateLeaveForUser(userId: string, updatedLeave: any, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const leaves = this.getLeavesByUserId(userId, currentUser).map(leave => 
        leave.id === updatedLeave.id ? updatedLeave : leave
      );
      this.setLeavesForUser(userId, leaves, currentUser);
    }
  }

  deleteLeaveForUser(userId: string, leaveId: string, currentUser: User): void {
    if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
      const leaves = this.getLeavesByUserId(userId, currentUser).filter(leave => leave.id !== leaveId);
      this.setLeavesForUser(userId, leaves, currentUser);
    }
  }

  // Notifications
  getNotifications(): Notification[] {
    try {
      const notifications = localStorage.getItem(`${this.storagePrefix}notifications`);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  getNotificationsByReceiverId(receiverId: string): Notification[] {
    return this.getNotifications().filter(notification => notification.receiverId === receiverId);
  }

  getNotificationsBySenderId(senderId: string): Notification[] {
    return this.getNotifications().filter(notification => notification.senderId === senderId);
  }

  setNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(`${this.storagePrefix}notifications`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error setting notifications:', error);
    }
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.push(notification);
    this.setNotifications(notifications);
  }

  updateNotification(notification: Notification): void {
    const notifications = this.getNotifications().map(n => 
      n.id === notification.id ? notification : n
    );
    this.setNotifications(notifications);
  }

  // User Settings
  getUserSettings(userId: string, currentUser: User): UserSettings {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        const settings = localStorage.getItem(`${this.storagePrefix}settings_${userId}`);
        return settings ? JSON.parse(settings) : {
          userId,
          language: Language.English,
          theme: Theme.Light
        };
      }
      return {
        userId,
        language: Language.English,
        theme: Theme.Light
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        userId,
        language: Language.English,
        theme: Theme.Light
      };
    }
  }

  setUserSettings(userId: string, settings: UserSettings, currentUser: User): void {
    try {
      if (currentUser.role === UserRole.Admin || currentUser.id === userId) {
        localStorage.setItem(`${this.storagePrefix}settings_${userId}`, JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Error setting user settings:', error);
    }
  }

  // News
  getNews(): NewsItem[] {
    try {
      const news = localStorage.getItem(`${this.storagePrefix}news`);
      return news ? JSON.parse(news) : [];
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  }

  setNews(news: NewsItem[]): void {
    try {
      localStorage.setItem(`${this.storagePrefix}news`, JSON.stringify(news));
    } catch (error) {
      console.error('Error setting news:', error);
    }
  }

  addNewsItem(newsItem: NewsItem): void {
    const news = this.getNews();
    news.push(newsItem);
    this.setNews(news);
  }

  updateNewsItem(updatedNewsItem: NewsItem): void {
    const news = this.getNews().map(item => 
      item.id === updatedNewsItem.id ? updatedNewsItem : item
    );
    this.setNews(news);
  }

  deleteNewsItem(id: string): void {
    const news = this.getNews().filter(item => item.id !== id);
    this.setNews(news);
  }

  // Employees
  getEmployees(): Employee[] {
    try {
      const employees = localStorage.getItem(`${this.storagePrefix}employees`);
      return employees ? JSON.parse(employees) : [];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  }

  setEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(`${this.storagePrefix}employees`, JSON.stringify(employees));
    } catch (error) {
      console.error('Error setting employees:', error);
    }
  }

  // Monthly Employees
  getMonthlyEmployees(): Record<string, Employee[]> {
    try {
      const monthlyEmployees = localStorage.getItem(`${this.storagePrefix}monthlyEmployees`);
      return monthlyEmployees ? JSON.parse(monthlyEmployees) : {};
    } catch (error) {
      console.error('Error getting monthly employees:', error);
      return {};
    }
  }

  setMonthlyEmployees(monthlyEmployees: Record<string, Employee[]>): void {
    try {
      localStorage.setItem(`${this.storagePrefix}monthlyEmployees`, JSON.stringify(monthlyEmployees));
    } catch (error) {
      console.error('Error setting monthly employees:', error);
    }
  }

  // Vacations
  getVacations(): Record<string, { id: string; text: string }[]> {
    try {
      const vacations = localStorage.getItem(`${this.storagePrefix}vacations`);
      return vacations ? JSON.parse(vacations) : {};
    } catch (error) {
      console.error('Error getting vacations:', error);
      return {};
    }
  }

  setVacations(vacations: Record<string, { id: string; text: string }[]>): void {
    try {
      localStorage.setItem(`${this.storagePrefix}vacations`, JSON.stringify(vacations));
    } catch (error) {
      console.error('Error setting vacations:', error);
    }
  }

  onUserUpdate(callback: (data: any) => void) {
    this.eventEmitter.on('user_update', callback);
  }

  offUserUpdate(callback: (data: any) => void) {
    this.eventEmitter.off('user_update', callback);
  }
}

export const storage = new LocalStorage();
