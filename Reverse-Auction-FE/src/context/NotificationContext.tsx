import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/hooks/redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";
import type { Notification } from "@/types/notification";
import { notificationService } from "@/services/notificationService";

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth.user);
  const stompClientRef = useRef<Client | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(0, 30);
      setNotifications(data.content);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // STOMP WebSocket client management
  useEffect(() => {
    if (!user) {
      if (stompClientRef.current) {
        console.log("Deactivating notification STOMP client due to logout");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    console.log("Setting up notification STOMP client for user id:", user.id);

    const socket = new SockJS("http://localhost:8080/ws-auction");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: () => {
        // Suppress noisy logs, uncomment if needed
      },
      onConnect: () => {
        console.log("Connected to notification WebSocket. Subscribing to user notifications...");

        client.subscribe(`/topic/notifications/${user.id}`, (message) => {
          try {
            const newNotification = JSON.parse(message.body) as Notification;
            console.log("Received new notification:", newNotification);

            // Prepend new notification to the state
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Display toast
            toast(() => (
              <div className="flex flex-col gap-0.5 max-w-[280px]">
                <span className="font-extrabold text-sm text-slate-900">{newNotification.title}</span>
                <span className="text-xs text-slate-600 line-clamp-2">{newNotification.content}</span>
              </div>
            ), {
              icon: "🔔",
              duration: 6000,
              position: "top-right",
            });
          } catch (err) {
            console.error("Failed to parse incoming WS notification:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketClose: () => {
        console.log("STOMP WebSocket connection closed");
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        console.log("Cleaning up notification STOMP client");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
