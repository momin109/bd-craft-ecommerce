import { apiClient, unwrap } from "@/lib/api/client";
import { SendNotificationPayload, NotificationLog, NotificationLogQuery } from "@/types/api/notification";

export const notificationService = {
  send: async (payload: SendNotificationPayload) => {
    const res = await apiClient.post("/notifications/send", payload);
    return unwrap<{ message: string }>(res);
  },

  getLogs: async (params: NotificationLogQuery = {}) => {
    const res = await apiClient.get("/notifications/logs", { params });
    return unwrap<NotificationLog[]>(res);
  },
};
