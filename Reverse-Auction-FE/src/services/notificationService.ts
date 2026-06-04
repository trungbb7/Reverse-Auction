import api from "@/utils/axios";
import type { Notification } from "@/types/notification";

// Define a type for PageResponse in notifications since page response matches standard structure
interface NotificationPageResponse {
  content: Notification[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const notificationService = {
  getNotifications: async (page = 0, size = 10): Promise<NotificationPageResponse> => {
    const response = await api.get("/notifications", {
      params: { page, size, sortBy: "createdAt", sortDir: "desc" },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },
};
