import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import WorkspaceCards from "../components/WorkspaceCards";
import RecentActivity from "../components/RecentActivity";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";
import API from "../services/api";
import { getUser } from "../utils/auth";

export default function Dashboard() {
  const currentUser = getUser();
  const [openModal, setOpenModal] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchDashboardData = async () => {
    try {
      const [wsRes, statsRes] = await Promise.all([
        API.get("/workspaces"),
        API.get("/users/stats"),
      ]);
      setWorkspaces(wsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Dashboard data load error", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingWorkspace) {
        await API.put(`/workspaces/${editingWorkspace._id}`, formData);
      } else {
        await API.post("/workspaces", formData);
      }

      fetchDashboardData();
      setOpenModal(false);
      setEditingWorkspace(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;

    try {
      await API.delete(`/workspaces/${id}`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete workspace");
    }
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setFormData({
      name: workspace.name,
      description: workspace.description || "",
    });
    setOpenModal(true);
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-96 bg-blue-600/5 blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {currentUser?.name || "Member"} 👋
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Manage your team workspaces, track real-time project tasks, and collaborate seamlessly across your organization.
        </p>
      </div>

      <StatsCards statsData={stats} />

      <WorkspaceCards
        onCreate={() => {
          setEditingWorkspace(null);
          setFormData({ name: "", description: "" });
          setOpenModal(true);
        }}
        workspaces={workspaces}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <RecentActivity />

      <CreateWorkspaceModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingWorkspace(null);
          setFormData({ name: "", description: "" });
        }}
        onSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        editingWorkspace={editingWorkspace}
      />
    </div>
  );
}