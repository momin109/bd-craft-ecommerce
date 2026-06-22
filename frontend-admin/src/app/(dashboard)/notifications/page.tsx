"use client";
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useNotificationLogs, useSendNotification } from "@/hooks/queries/useNotifications";
import { NotificationChannel, NotificationStatus } from "@/types/api/notification";
import { formatDateTime, cn } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | undefined>(undefined);
  const { data: logs, isLoading, isError, refetch } = useNotificationLogs({ channel: channelFilter, status: statusFilter });

  const sendMutation = useSendNotification();
  const [form, setForm] = useState({ channel: "SMS" as NotificationChannel, recipient: "", subject: "", message: "" });

  const send = () => {
    if (!form.recipient.trim() || !form.message.trim()) { toast.error("Recipient and message are required"); return; }
    sendMutation.mutate(form, {
      onSuccess: () => { toast.success("Notification sent"); setForm((f) => ({ ...f, recipient: "", subject: "", message: "" })); refetch(); },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["SMS", "EMAIL", "WHATSAPP"] as NotificationChannel[]).map((c) => (
            <button key={c} onClick={() => setChannelFilter(channelFilter === c ? undefined : c)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-full border transition-colors", channelFilter === c ? "bg-brand-700 text-white border-brand-700" : "border-gray-200 text-gray-600")}>
              {c}
            </button>
          ))}
          {(["SENT", "FAILED", "SKIPPED"] as NotificationStatus[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-full border transition-colors", statusFilter === s ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600")}>
              {s}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {isLoading && <LoadingTable rows={6} cols={5} />}
          {isError && <div className="p-6"><ErrorState message="Couldn't load notification logs." onRetry={() => refetch()} /></div>}
          {!isLoading && !isError && (!logs || logs.length === 0) && (
            <div className="p-10"><EmptyState title="No notifications logged" description="Sent SMS, email, and WhatsApp messages will be listed here." /></div>
          )}
          {!isLoading && !isError && logs && logs.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Channel</th><th className="px-4 py-3 font-medium">Recipient</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Sent</th>
              </tr></thead>
              <tbody>
                {logs.map((log) => {
                  const id = log._id ?? log.id ?? "";
                  return (
                    <tr key={id} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-gray-600">{log.channel}</td>
                      <td className="px-4 py-3 text-gray-700">{log.recipient}</td>
                      <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 h-fit">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Send size={15} className="text-brand-600" /> Send Notification</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Channel</label>
            <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as NotificationChannel }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400">
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Recipient</label>
            <input value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} placeholder={form.channel === "EMAIL" ? "customer@example.com" : "+8801712345678"} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
          </div>
          {form.channel === "EMAIL" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Subject</label>
              <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Message</label>
            <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
          </div>
          <button onClick={send} disabled={sendMutation.isPending} className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {sendMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
          </button>
        </div>
      </div>
    </div>
  );
}
