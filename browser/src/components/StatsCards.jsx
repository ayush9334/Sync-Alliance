import { FolderKanban, Users, CheckCircle2, MessageSquare } from "lucide-react";

export default function StatsCards({ statsData }) {
  const items = [
    {
      title: "Workspaces",
      value: statsData?.workspacesCount ?? 0,
      icon: FolderKanban,
      color: "from-blue-600 to-indigo-600",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Team Members",
      value: statsData?.membersCount ?? 0,
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Tasks Completed",
      value: statsData?.completedTasks ?? 0,
      sub: statsData?.totalTasks ? `of ${statsData.totalTasks} total` : "",
      icon: CheckCircle2,
      color: "from-violet-600 to-purple-600",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Team Messages",
      value: statsData?.messagesCount ?? 0,
      icon: MessageSquare,
      color: "from-amber-600 to-orange-600",
      borderColor: "border-orange-500/20",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.title}
          className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-white">{item.value}</h3>
                {item.sub && <span className="text-xs text-slate-400">{item.sub}</span>}
              </div>
            </div>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
            >
              <item.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}