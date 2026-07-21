import { useEffect, useState } from "react";
import { User, Lock, Save, KeyRound } from "lucide-react";
import API from "../services/api";
import { getUser } from "../utils/auth";

export default function Settings() {
  const currentUser = getUser();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfile({ name: currentUser.name || "", email: currentUser.email || "" });
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await API.put("/auth/profile", profile);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Profile update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingPassword(true);
      await API.put("/auth/password", passwordData);
      alert("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Password change failed");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-400">
            <User size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Profile Settings</h3>
            <p className="text-xs text-slate-400">Manage your account information and email address</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-600/20"
          >
            <Save size={16} />
            {updatingProfile ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Security Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="rounded-xl bg-emerald-600/10 p-2.5 text-emerald-400">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Security & Password</h3>
            <p className="text-xs text-slate-400">Ensure your account is using a strong password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-md shadow-emerald-600/20"
          >
            <KeyRound size={16} />
            {updatingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
