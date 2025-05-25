import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Task, Note, TaskStatus, Language } from "@/lib/types";
import { storage } from "@/lib/storage";
import HomeView from "@/components/dashboard/HomeView";
import ToolsView from "@/components/dashboard/ToolsView";
import BrowseView from "@/components/dashboard/BrowseView";

interface DashboardContext {
  activeSection: "home" | "tools" | "browse";
}

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const { activeSection } = useOutletContext<DashboardContext>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const isArabic = language === Language.Arabic;

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);
  
  const loadUserData = () => {
    if (!user) return;
    
    const userTasks = storage.getTasksByUserId(user.id, user);
    setTasks(userTasks);
    
    const userNotes = storage.getNotesByUserId(user.id, user);
    setNotes(userNotes);
  };
  
  const handleTaskUpdate = (updatedTask: Task) => {
    if (!user) return;
    storage.updateTaskForUser(user.id, updatedTask, user);
    
    setTasks(prevTasks => 
      prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };
  
  const handleTaskCreate = (newTask: Task) => {
    if (!user) return;
    storage.addTaskForUser(user.id, newTask, user);
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  const handleTaskDelete = (taskId: string) => {
    if (!user) return;
    storage.deleteTaskForUser(user.id, taskId, user);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  const handleNoteUpdate = (updatedNote: Note) => {
    if (!user) return;
    storage.updateNoteForUser(user.id, updatedNote, user);
    
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  };
  
  const handleNoteCreate = (newNote: Note) => {
    if (!user) return;
    storage.addNoteForUser(user.id, newNote, user);
    setNotes(prevNotes => [...prevNotes, newNote]);
  };
  
  const handleNoteDelete = (noteId: string) => {
    if (!user) return;
    storage.deleteNoteForUser(user.id, noteId, user);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };
  
  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === TaskStatus.Completed).length;
  const remainingTasks = totalTasks - completedTasks;
  
  let activeView;
  
  switch (activeSection) {
    case "home":
      activeView = (
        <HomeView 
          tasks={tasks}
          notes={notes}
          taskStats={{ total: totalTasks, completed: completedTasks, remaining: remainingTasks }}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
          onNoteUpdate={handleNoteUpdate}
          onNoteCreate={handleNoteCreate}
          onNoteDelete={handleNoteDelete}
        />
      );
      break;
      
    case "tools":
      activeView = (
        <ToolsView 
          tasks={tasks}
          notes={notes}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
          onNoteUpdate={handleNoteUpdate}
          onNoteCreate={handleNoteCreate}
          onNoteDelete={handleNoteDelete}
        />
      );
      break;
      
    case "browse":
      activeView = <BrowseView />;
      break;
  }
  
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {activeSection === "home" && (isArabic ? "الرئيسية" : "Home")}
          {activeSection === "tools" && (isArabic ? "الأدوات" : "Tools")}
          {activeSection === "browse" && (isArabic ? "تصفح" : "Browse")}
        </h2>
      </div>
      
      {activeView}
    </div>
  );
};

export default Dashboard;
