import { Pencil, Trash2, MessageSquare, Calendar, User } from "lucide-react";

const priorityStyles = {
  Low: "bg-emerald-500/20 text-emerald-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  High: "bg-red-500/20 text-red-400",
};

const statusOptions = ["Todo", "In Progress", "Done"];

const formatDate = (dateString) => {
  if (!dateString) return null;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (dateString, status) => {
  if (!dateString || status === "Done") return false;
  return new Date(dateString) < new Date(new Date().toDateString());
};

export default function TaskItem({
  task,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const dueLabel = formatDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4 transition hover:border-blue-500">
      <div className="mb-3 flex items-start justify-between gap-2">
        <button
          onClick={() => onOpen(task)}
          className="text-left font-semibold text-white hover:text-blue-400"
        >
          {task.title}
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => onEdit(task)}
            className="text-yellow-400 hover:text-yellow-300"
            title="Edit Task"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(task._id)}
            className="text-red-500 hover:text-red-400"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-slate-400">
          {task.description}
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority] || priorityStyles.Medium}`}
        >
          {task.priority}
        </span>

        {dueLabel && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              overdue
                ? "bg-red-500/20 text-red-400"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            <Calendar size={12} />
            {dueLabel}
          </span>
        )}

        <button
          onClick={() => onOpen(task)}
          className="flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-600"
        >
          <MessageSquare size={12} />
          {task.comments?.length || 0}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <User size={14} />
          {task.assignedTo?.name || "Unassigned"}
        </div>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}