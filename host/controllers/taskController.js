const Task = require("../models/Task");
const Workspace = require("../models/Workspace");
const { sendNotification } = require("./notificationController");

// Helper: check if a user is the owner or a member of a workspace
const isWorkspaceMember = (workspace, userId) => {
  if (workspace.owner.toString() === userId) return true;

  return workspace.members.some(
    (member) => member.user.toString() === userId
  );
};

// Helper: check if a given userId is the owner or a member of a workspace
const isValidAssignee = (workspace, userId) => {
  if (!userId) return true;
  return isWorkspaceMember(workspace, userId.toString());
};

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (!isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    if (assignedTo && !isValidAssignee(workspace, assignedTo)) {
      return res.status(400).json({
        message: "Assigned user must be a member of this workspace",
      });
    }

    const task = await Task.create({
      title,
      description,
      workspace: workspace._id,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      priority,
      dueDate,
    });

    const newTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    if (assignedTo) {
      await sendNotification(req.app, {
        recipient: assignedTo,
        sender: req.user.id,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: `You were assigned task "${title}" in "${workspace.name}"`,
        link: `/workspace/${workspace._id}`,
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Tasks
const getTasks = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (!isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const tasks = await Task.find({
      workspace: req.params.workspaceId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Task (with comments)
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .populate("comments.user", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace || !isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace || !isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    if (
      req.body.assignedTo !== undefined &&
      req.body.assignedTo &&
      !isValidAssignee(workspace, req.body.assignedTo)
    ) {
      return res.status(400).json({
        message: "Assigned user must be a member of this workspace",
      });
    }

    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.priority = req.body.priority ?? task.priority;
    task.status = req.body.status ?? task.status;
    task.assignedTo =
      req.body.assignedTo !== undefined ? req.body.assignedTo || null : task.assignedTo;
    task.dueDate = req.body.dueDate ?? task.dueDate;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    const newAssignee = updatedTask.assignedTo ? updatedTask.assignedTo._id.toString() : null;
    if (newAssignee && newAssignee !== oldAssignee) {
      await sendNotification(req.app, {
        recipient: newAssignee,
        sender: req.user.id,
        type: "TASK_ASSIGNED",
        title: "Task Assigned",
        message: `Task "${updatedTask.title}" was assigned to you in "${workspace.name}"`,
        link: `/workspace/${workspace._id}`,
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace || !isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace || !isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    task.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .populate("comments.user", "name email");

    // Notify task creator or assignee if different from commenter
    const recipient = task.assignedTo
      ? task.assignedTo.toString()
      : task.createdBy.toString();

    if (recipient && recipient !== req.user.id) {
      await sendNotification(req.app, {
        recipient,
        sender: req.user.id,
        type: "COMMENT_ADDED",
        title: "New Comment on Task",
        message: `New comment on task "${task.title}": "${text.trim().slice(0, 40)}..."`,
        link: `/workspace/${workspace._id}`,
      });
    }

    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace || !isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const comment = task.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const isCommentAuthor = comment.user.toString() === req.user.id;
    const isWorkspaceOwner = workspace.owner.toString() === req.user.id;

    if (!isCommentAuthor && !isWorkspaceOwner) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    comment.deleteOne();

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .populate("comments.user", "name email");

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
};