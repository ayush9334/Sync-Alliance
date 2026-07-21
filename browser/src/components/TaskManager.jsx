import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import API from "../services/api";
import TaskItem from "./TaskItem";
import TaskFormModal from "./TaskFormModal";
import TaskDetailModal from "./TaskDetailModal";

const columns = ["Todo", "In Progress", "Done"];

export default function TaskManager({ workspaceId, members }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/tasks/${workspaceId}`);
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate || null,
    };

    try {
      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await API.post(`/tasks/${workspaceId}`, payload);
      }

      await fetchTasks();
      setFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await API.put(`/tasks/${task._id}`, { status: newStatus });
      await fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const openDetail = async (task) => {
    try {
      const res = await API.get(`/tasks/detail/${task._id}`);
      setDetailTask(res.data);
      setDetailOpen(true);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load task");
    }
  };

  const handleAddComment = async (taskId, text) => {
    try {
      const res = await API.post(`/tasks/${taskId}/comments`, { text });
      setDetailTask(res.data);
      await fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    try {
      const res = await API.delete(
        `/tasks/${taskId}/comments/${commentId}`
      );
      setDetailTask(res.data);
      await fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading tasks...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {columns.map((status) => {
            const columnTasks = tasks.filter(
              (task) => task.status === status
            );

            return (
              <div
                key={status}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">{status}</h3>

                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
                      No tasks here
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        onOpen={openDetail}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        members={members}
        editingTask={editingTask}
      />

      <TaskDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailTask(null);
        }}
        task={detailTask}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
}