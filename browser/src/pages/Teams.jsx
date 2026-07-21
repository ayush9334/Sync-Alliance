import { useEffect, useState } from "react";
import { Users, Crown, Shield, Mail, Plus, X, Search } from "lucide-react";
import API from "../services/api";

export default function Teams() {
  const [members, setMembers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, wsRes] = await Promise.all([
        API.get("/users/teams"),
        API.get("/workspaces"),
      ]);
      setMembers(teamsRes.data);
      setWorkspaces(wsRes.data);
      if (wsRes.data.length > 0) {
        setSelectedWorkspace(wsRes.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to load team data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !selectedWorkspace) return;

    try {
      setInviting(true);
      const res = await API.post(`/workspaces/${selectedWorkspace}/invite`, {
        email: email.trim(),
      });
      alert(res.data.message || "Member invited successfully");
      setEmail("");
      setShowInviteModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Invitation failed");
    } finally {
      setInviting(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
        >
          <Plus size={18} />
          Invite Team Member
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading team members...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <Users size={40} className="mx-auto mb-3 text-slate-500" />
          <h3 className="text-lg font-semibold text-white">No Team Members Found</h3>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your search query or invite new members.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-md">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">{member.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail size={12} />
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800/80 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Associated Workspaces
                  </p>
                  {member.workspaces.map((ws) => (
                    <div
                      key={ws.workspaceId}
                      className="flex items-center justify-between rounded-xl bg-slate-800/50 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-slate-200">{ws.workspaceName}</span>
                      {ws.role === "Owner" ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                          <Crown size={12} /> Owner
                        </span>
                      ) : ws.role === "Admin" ? (
                        <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                          Member
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Select Workspace
                </label>
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-blue-500"
                  required
                >
                  {workspaces.map((ws) => (
                    <option key={ws._id} value={ws._id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Member Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
