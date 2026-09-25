import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (import.meta.env.PROD) {
    return 'https://freelancer-client-platform.onrender.com';
  }
  return '/';
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = getSocketURL();
    const token = localStorage.getItem('token');

    const newSocket = io(socketUrl, {
      query: { userId: user._id },
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      // console.log('[Socket] Connected to real-time server');
    });

    newSocket.on('user_status_changed', ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    newSocket.on('message_notification', (data) => {
      toast(
        (t) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">{data.message.sender.name}:</span>
            <span className="truncate max-w-[200px] text-slate-700">{data.message.text}</span>
          </div>
        ),
        { icon: '💬', duration: 4000 }
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext) || {};
};
