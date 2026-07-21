import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquare, FolderKanban, UserPlus, Bell } from "lucide-react";
import API from "../services/api";

const iconMap = {
  WORKSPACE_INVITE: UserPlus,
  TASK_ASSIGNED: FolderKanban,
  TASK_STATUS: CheckCircle2,
  COMMENT_ADDED: MessageSquare,
};

const colorMap = {
  WORKSPACE_INVITE: "text-green-400 bg-green-500/10",
  TASK_ASSIGNED: "text-blue-400 bg-blue-500/10",
  TASK_STATUS: "text-violet-400 bg-violet-500/10",
  COMMENT_ADDED: "text-amber-400 bg-amber-500/10",
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await API.get("/notifications");
        setActivities(res.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <p className="text-xs text-slate-400">Live stream of team activities</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">Loading activity feed...</div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No recent activity yet. Create a workspace or assign tasks to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const IconComponent = iconMap[act.type] || Bell;
            const style = colorMap[act.type] || "text-slate-400 bg-slate-800";

            return (
              <div
                key={act._id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-800/30 p-4 transition hover:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${style}`}>
                    <IconComponent size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white text-sm">{act.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{act.message}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {formatTimeAgo(act.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}