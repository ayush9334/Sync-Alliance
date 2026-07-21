import { useState, useEffect } from "react";
import WorkspaceCards from "../components/WorkspaceCards";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";
import API from "../services/api";
import { Search } from "lucide-react";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await API.get("/workspaces");
      setWorkspaces(res.data);
    } catch (error) {
      console.error("Error fetching workspaces", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorkspace) {
        await API.put(`/workspaces/${editingWorkspace._id}`, formData);
      } else {
        await API.post("/workspaces", formData);
      }
      fetchWorkspaces();
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
      fetchWorkspaces();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete workspace");
    }
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setFormData({ name: workspace.name, description: workspace.description || "" });
    setOpenModal(true);
  };

  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Top Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading workspaces...</div>
      ) : (
        <WorkspaceCards
          onCreate={() => {
            setEditingWorkspace(null);
            setFormData({ name: "", description: "" });
            setOpenModal(true);
          }}
          workspaces={filteredWorkspaces}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

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
