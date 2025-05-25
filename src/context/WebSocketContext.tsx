import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '@/lib/storage';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
  reconnect: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (!user?.token) return;

    try {
      // Use the same base URL as your API
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws?token=${user.token}`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setReconnectAttempt(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Handle different types of messages
          switch (data.type) {
            case 'user_update':
              if (data.user) {
                storage.updateUser(data.user);
              }
              break;
            case 'status_changed':
              if (data.userId && data.status) {
                storage.updateUserStatus(data.userId, data.status);
              }
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt to reconnect if the connection was closed unexpectedly
        if (event.code !== 1000) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
          setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [user?.token, reconnectAttempt]);

  useEffect(() => {
    connect();

    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'Manual reconnect');
    }
    setReconnectAttempt(0);
    connect();
  }, [connect, socket]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 