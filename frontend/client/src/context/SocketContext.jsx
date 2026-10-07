import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to server websocket
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin.replace(':5173', ':5000');
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Smart Healthcare WebSocket server:', socketInstance.id);
      if (user?._id) {
        socketInstance.emit('join_user_room', user._id);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // When authenticated user changes, re-join their private room
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join_user_room', user._id);
    }
  }, [socket, user]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
