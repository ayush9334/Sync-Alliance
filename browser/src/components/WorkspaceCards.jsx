import { FolderKanban, Users, CheckCircle2, ArrowRight, Trash2, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WorkspaceCards({ onCreate, workspaces, onDelete, onEdit }) {
  const navigate = useNavigate();

  return (
    <section className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Your Workspaces</h2>
          <p className="text-xs text-slate-400">Active collaboration spaces</p>
        </div>

        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
        >
          <Plus size={18} />
          New Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <FolderKanban size={32} />
          </div>

          <h3 className="text-lg font-semibold text-white">No Workspaces Found</h3>

          <p className="mt-2 text-sm text-slate-400">
            Create a workspace or get invited to start collaborating.
          </p>

          <button
            onClick={onCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl"
            >
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                      <FolderKanban size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition">
                        {workspace.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {workspace.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEdit(workspace)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-yellow-400"
                      title="Edit Workspace"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(workspace._id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                      title="Delete Workspace"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="my-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Users size={15} className="text-blue-400" />
                    <span>{workspace.memberCount ?? workspace.members?.length ?? 1} Members</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>{workspace.taskCount ?? 0} Tasks</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/workspace/${workspace._id}`)}
                className="flex w-full items-center justify-between rounded-xl bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition duration-200"
              >
                <span>Open Workspace</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}