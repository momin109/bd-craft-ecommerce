"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { SendNotificationPayload, NotificationLogQuery } from "@/types/api/notification";

export function useNotificationLogs(params: NotificationLogQuery = {}) {
  return useQuery({ queryKey: queryKeys.notifications.logs(params), queryFn: () => notificationService.getLogs(params) });
}

export function useSendNotification() {
  return useMutation({ mutationFn: (payload: SendNotificationPayload) => notificationService.send(payload) });
}
