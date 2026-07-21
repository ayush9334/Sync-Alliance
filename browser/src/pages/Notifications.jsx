import { useEffect, useState } from "react";
import { Bell, CheckCheck, UserPlus, FolderKanban, CheckCircle2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const iconMap = {
  WORKSPACE_INVITE: UserPlus,
  TASK_ASSIGNED: FolderKanban,
  TASK_STATUS: CheckCircle2,
  COMMENT_ADDED: MessageSquare,
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markSingleRead = async (id, link) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      if (link) navigate(link);
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-xs text-slate-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification(s)` : "All caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <Bell size={40} className="mx-auto mb-3 text-slate-600" />
          <h3 className="text-lg font-semibold text-white">No Notifications</h3>
          <p className="mt-1 text-sm text-slate-400">You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const IconComp = iconMap[notif.type] || Bell;

            return (
              <div
                key={notif._id}
                onClick={() => markSingleRead(notif._id, notif.link)}
                className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border p-5 transition ${
                  notif.read
                    ? "border-slate-800/80 bg-slate-900/60 opacity-75 hover:opacity-100 hover:border-slate-700"
                    : "border-blue-500/30 bg-blue-950/20 shadow-lg shadow-blue-500/5 hover:border-blue-500/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 rounded-xl p-2.5 ${notif.read ? "bg-slate-800 text-slate-400" : "bg-blue-600 text-white"}`}>
                    <IconComp size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
