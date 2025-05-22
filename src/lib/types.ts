export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  role: UserRole;
  profilePic?: string;
  status: UserStatus;
  permissions: Permission[];
  lastLogin: string;
}

export enum UserRole {
  Admin = "admin",
  User = "user"
}

export enum UserStatus {
  Online = "online",
  Offline = "offline"
}

export enum Permission {
  ViewTools = "view_tools",
  EditTools = "edit_tools",
  ViewBrowse = "view_browse",
  EditBrowse = "edit_browse",
  ViewAdmin = "view_admin",
  SendNotifications = "send_notifications",
  ManageUsers = "manage_users"
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dueDate?: Date;
  reminderTime?: Date;
  alarm?: Date;
  status: TaskStatus;
  priorityColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskCategory {
  UrgentImportant = "urgent_important",
  UrgentNotImportant = "urgent_not_important",
  NotUrgentImportant = "not_urgent_important",
  NotUrgentNotImportant = "not_urgent_not_important"
}

export enum TaskStatus {
  Todo = "todo",
  InProgress = "in_progress",
  Completed = "completed"
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  content: string;
  type: NotificationType;
  link?: string;
  status: NotificationStatus;
  sentAt: Date;
}

export enum NotificationType {
  Popup = "popup",
  Redirect = "redirect"
}

export enum NotificationStatus {
  Read = "read",
  Unread = "unread"
}

export interface UserSettings {
  userId: string;
  language: Language;
  theme: Theme;
  customColors?: Record<string, string>;
}

export enum Language {
  English = "en",
  Arabic = "ar"
}

export enum Theme {
  Light = "light",
  Dark = "dark",
  Custom = "custom"
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  sourceUrl: string;
  publishedAt: Date;
}
