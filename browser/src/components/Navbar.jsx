import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";
import { getUser, logout } from "../utils/auth";
import API from "../services/api";
import { getSocket } from "../services/socket";

const pageTitles = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your workspace performance" },
  "/workspaces": { title: "Workspaces", subtitle: "Manage and organize your team workspaces" },
  "/teams": { title: "Teams & Members", subtitle: "Collaborators across all your workspaces" },
  "/chat": { title: "Team Chat", subtitle: "Real-time communication across workspaces" },
  "/notifications": { title: "Notifications", subtitle: "Stay updated on team activities" },
  "/settings": { title: "Settings", subtitle: "Account preferences and security" },
};

export default function Navbar() {
  const location = useLocation();
  const currentUser = getUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentMeta = pageTitles[location.pathname] || {
    title: "Sync Alliance",
    subtitle: "Collaborate and build together",
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/users/stats");
      setUnreadCount(res.data.unreadNotifications || 0);
    } catch (error) {
      console.error("Failed to fetch notification stats", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const socket = getSocket();
    if (currentUser?.id) {
      socket.emit("join_user", currentUser.id);

      const handleNotification = () => {
        setUnreadCount((prev) => prev + 1);
      };

      socket.on("new_notification", handleNotification);

      return () => {
        socket.off("new_notification", handleNotification);
      };
    }
  }, [currentUser?.id]);

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SA";

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-8 backdrop-blur-md">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{currentMeta.title}</h2>
        <p className="text-xs text-slate-400">{currentMeta.subtitle}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications Icon with Badge */}
        <Link
          to="/notifications"
          className="relative rounded-xl border border-slate-800 bg-slate-800/80 p-2.5 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          title="Notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/60 p-1.5 pr-4 transition hover:border-slate-700 hover:bg-slate-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md">
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-white leading-tight">
                {currentUser?.name || "User"}
              </p>
              <p className="text-[11px] text-slate-400">{currentUser?.email || "member"}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl">
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <User size={16} />
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
