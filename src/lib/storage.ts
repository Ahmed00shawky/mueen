import { User, Task, Note, Notification, UserSettings, NewsItem, UserRole, UserStatus, Permission } from "./types";

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

class LocalStorage {
  private storagePrefix = "mueen_";

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!this.getUsers().length) {
      this.setUsers([defaultAdmin]);
    }
  }

  // Users
  getUsers(): User[] {
    const users = localStorage.getItem(`${this.storagePrefix}users`);
    return users ? JSON.parse(users) : [];
  }

  setUsers(users: User[]): void {
    localStorage.setItem(`${this.storagePrefix}users`, JSON.stringify(users));
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
  }

  updateUser(updatedUser: User): void {
    const users = this.getUsers().map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    this.setUsers(users);
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(user => user.id !== id);
    this.setUsers(users);
  }

  // Tasks
  getTasks(): Task[] {
    const tasks = localStorage.getItem(`${this.storagePrefix}tasks`);
    return tasks ? JSON.parse(tasks) : [];
  }

  getTasksByUserId(userId: string): Task[] {
    return this.getTasks().filter(task => task.userId === userId);
  }

  setTasks(tasks: Task[]): void {
    localStorage.setItem(`${this.storagePrefix}tasks`, JSON.stringify(tasks));
  }

  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    this.setTasks(tasks);
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getTasks().map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    this.setTasks(tasks);
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(task => task.id !== id);
    this.setTasks(tasks);
  }

  // Notes
  getNotes(): Note[] {
    const notes = localStorage.getItem(`${this.storagePrefix}notes`);
    return notes ? JSON.parse(notes) : [];
  }

  getNotesByUserId(userId: string): Note[] {
    return this.getNotes().filter(note => note.userId === userId);
  }

  getLeavesByUserId(userId: string): any[] {
    const leaves = localStorage.getItem(`${this.storagePrefix}leaves`);
    const allLeaves = leaves ? JSON.parse(leaves) : [];
    return allLeaves.filter((leave: any) => leave.userId === userId);
  }

  setNotes(notes: Note[]): void {
    localStorage.setItem(`${this.storagePrefix}notes`, JSON.stringify(notes));
  }

  addNote(note: Note): void {
    const notes = this.getNotes();
    notes.push(note);
    this.setNotes(notes);
  }

  updateNote(updatedNote: Note): void {
    const notes = this.getNotes().map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    this.setNotes(notes);
  }

  deleteNote(id: string): void {
    const notes = this.getNotes().filter(note => note.id !== id);
    this.setNotes(notes);
  }

  // Notifications
  getNotifications(): Notification[] {
    const notifications = localStorage.getItem(`${this.storagePrefix}notifications`);
    return notifications ? JSON.parse(notifications) : [];
  }

  getNotificationsByReceiverId(receiverId: string): Notification[] {
    const notifications = this.getNotifications();
    return notifications.filter((notification) => notification.receiverId === receiverId);
  }

  getNotificationsBySenderId(senderId: string): Notification[] {
    const notifications = localStorage.getItem(`${this.storagePrefix}notifications`);
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    return allNotifications.filter((notification: Notification) => notification.senderId === senderId);
  }

  setNotifications(notifications: Notification[]): void {
    localStorage.setItem(`${this.storagePrefix}notifications`, JSON.stringify(notifications));
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.push(notification);
    this.setNotifications(notifications);
  }

  updateNotification(notification: Notification): void {
    const notifications = localStorage.getItem(`${this.storagePrefix}notifications`);
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    const updatedNotifications = allNotifications.map((n: Notification) =>
      n.id === notification.id ? notification : n
    );
    localStorage.setItem(`${this.storagePrefix}notifications`, JSON.stringify(updatedNotifications));
  }

  deleteNotification(id: string): void {
    const notifications = this.getNotifications().filter(notification => notification.id !== id);
    this.setNotifications(notifications);
  }

  // User Settings
  getUserSettings(userId: string): UserSettings | undefined {
    const settings = localStorage.getItem(`${this.storagePrefix}settings`);
    const allSettings: UserSettings[] = settings ? JSON.parse(settings) : [];
    return allSettings.find(setting => setting.userId === userId);
  }

  setUserSettings(settings: UserSettings): void {
    const allSettings = this.getAllUserSettings();
    const existingIndex = allSettings.findIndex(s => s.userId === settings.userId);
    
    if (existingIndex >= 0) {
      allSettings[existingIndex] = settings;
    } else {
      allSettings.push(settings);
    }
    
    localStorage.setItem(`${this.storagePrefix}settings`, JSON.stringify(allSettings));
  }

  getAllUserSettings(): UserSettings[] {
    const settings = localStorage.getItem(`${this.storagePrefix}settings`);
    return settings ? JSON.parse(settings) : [];
  }

  // News
  getNews(): NewsItem[] {
    const news = localStorage.getItem(`${this.storagePrefix}news`);
    return news ? JSON.parse(news) : [];
  }

  setNews(news: NewsItem[]): void {
    localStorage.setItem(`${this.storagePrefix}news`, JSON.stringify(news));
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
}

export const storage = new LocalStorage();
