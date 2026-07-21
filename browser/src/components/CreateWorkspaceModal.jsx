export default function CreateWorkspaceModal({
  open,
  onClose,
  onSubmit,
  formData,
  handleChange,
  editingWorkspace,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h2 className="mb-6 text-2xl font-bold text-white">
          {editingWorkspace ? "Edit Workspace" : "Create Workspace"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-slate-300">
              Workspace Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Frontend Team"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-slate-300">
              Description
            </label>

            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your workspace..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-3 text-white hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              {editingWorkspace ? "Update Workspace" : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}