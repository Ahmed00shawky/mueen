import { useEffect, useRef } from 'react';
import { Task } from '@/lib/types';

interface AlarmManagerProps {
  tasks: Task[];
}

const AlarmManager = ({ tasks }: AlarmManagerProps) => {
  const alarmTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    // Clear all existing timeouts
    Object.values(alarmTimeouts.current).forEach(timeout => clearTimeout(timeout));
    alarmTimeouts.current = {};

    // Set up new alarms
    tasks.forEach(task => {
      if (task.alarm && task.status !== 'completed') {
        const now = new Date().getTime();
        const alarmTime = new Date(task.alarm).getTime();
        
        if (alarmTime > now) {
          const timeout = setTimeout(() => {
            // Show notification
            if ('Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Task Reminder', {
                  body: task.title,
                  icon: '/favicon.ico'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Task Reminder', {
                      body: task.title,
                      icon: '/favicon.ico'
                    });
                  }
                });
              }
            }

            // Play sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {
              // Handle autoplay restrictions
              console.log('Autoplay prevented');
            });
          }, alarmTime - now);

          alarmTimeouts.current[task.id] = timeout;
        }
      }
    });

    // Cleanup function
    return () => {
      Object.values(alarmTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [tasks]);

  return null; // This is a utility component, it doesn't render anything
};

export default AlarmManager; 