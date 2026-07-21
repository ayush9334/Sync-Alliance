import { useState } from "react";
import { X, Send, Trash2, Calendar, User } from "lucide-react";
import { getUser } from "../utils/auth";

const priorityStyles = {
  Low: "bg-emerald-500/20 text-emerald-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  High: "bg-red-500/20 text-red-400",
};

const formatDate = (dateString) => {
  if (!dateString) return null;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TaskDetailModal({
  open,
  onClose,
  task,
  onAddComment,
  onDeleteComment,
}) {
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const currentUser = getUser();

  if (!open || !task) return null;

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      setPosting(true);
      await onAddComment(task._id, commentText.trim());
      setCommentText("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-white">{task.title}</h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {task.description && (
          <p className="mb-4 text-slate-400">{task.description}</p>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${priorityStyles[task.priority] || priorityStyles.Medium}`}
          >
            {task.priority} Priority
          </span>

          <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300">
            {task.status}
          </span>

          {task.dueDate && (
            <span className="flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300">
              <Calendar size={14} />
              {formatDate(task.dueDate)}
            </span>
          )}

          <span className="flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300">
            <User size={14} />
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-slate-800 pt-4">
          <h3 className="mb-4 font-semibold text-white">Comments</h3>

          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="rounded-xl border border-slate-800 bg-slate-800/60 p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-white">
                      {comment.user?.name || "Unknown User"}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {formatTime(comment.createdAt)}
                      </span>

                      {currentUser?.id === comment.user?._id && (
                        <button
                          onClick={() =>
                            onDeleteComment(task._id, comment._id)
                          }
                          className="text-red-500 hover:text-red-400"
                          title="Delete Comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No comments yet. Start the conversation.
            </p>
          )}
        </div>

        <form
          onSubmit={handleAddComment}
          className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-4"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={posting || !commentText.trim()}
            className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}