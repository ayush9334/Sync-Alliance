import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import API from "../services/api";
import { getSocket } from "../services/socket";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Workspaces", path: "/workspaces" },
  { icon: Users, label: "Teams", path: "/teams" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Bell, label: "Notifications", path: "/notifications", badge: true },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await API.get("/users/stats");
      setUnreadCount(res.data.unreadNotifications || 0);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnread();

    const socket = getSocket();
    if (currentUser?.id) {
      const handleNewNotif = () => setUnreadCount((prev) => prev + 1);
      socket.on("new_notification", handleNewNotif);
      return () => {
        socket.off("new_notification", handleNewNotif);
      };
    }
  }, [currentUser?.id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-black text-white shadow-lg shadow-blue-500/20">
          SA
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Sync <span className="text-blue-500">Alliance</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Enterprise Collab
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={19} className="transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </div>

            {item.badge && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-200"
        >
          <LogOut size={19} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}