const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Task = require("../models/Task");
const { sendNotification } = require("./notificationController");

// Helper: check member or owner
const isWorkspaceMember = (workspace, userId) => {
  if (workspace.owner.toString() === userId) return true;
  return workspace.members.some(
    (member) => member.user.toString() === userId
  );
};

// Create Workspace
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "Owner",
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Workspaces (where user is owner or member)
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    })
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    // Attach task count and member count to each workspace object
    const workspacesWithCounts = await Promise.all(
      workspaces.map(async (ws) => {
        const taskCount = await Task.countDocuments({ workspace: ws._id });
        const obj = ws.toObject();
        obj.taskCount = taskCount;
        obj.memberCount = ws.members.length;
        return obj;
      })
    );

    res.status(200).json(workspacesWithCounts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Workspace
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (!isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({
        message: "Access denied. You are not a member of this workspace.",
      });
    }

    const taskCount = await Task.countDocuments({ workspace: workspace._id });
    const obj = workspace.toObject();
    obj.taskCount = taskCount;
    obj.memberCount = workspace.members.length;

    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Workspace
const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only workspace owner can update workspace details",
      });
    }

    workspace.name = name ?? workspace.name;
    workspace.description = description ?? workspace.description;

    await workspace.save();

    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Invite Member
const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only workspace owner can invite members",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyMember = workspace.members.find(
      (member) => member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    workspace.members.push({
      user: user._id,
      role: "Member",
    });

    await workspace.save();

    const updatedWorkspace = await Workspace.findById(workspace._id).populate(
      "members.user",
      "name email"
    );

    // Send notification to invited user
    await sendNotification(req.app, {
      recipient: user._id,
      sender: req.user.id,
      type: "WORKSPACE_INVITE",
      title: "Workspace Invitation",
      message: `You have been added to workspace "${workspace.name}"`,
      link: `/workspace/${workspace._id}`,
    });

    res.status(200).json({
      message: "Member invited successfully",
      workspace: updatedWorkspace,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Workspace
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only workspace owner can delete workspace",
      });
    }

    await Workspace.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ workspace: req.params.id });

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  inviteMember,
  deleteWorkspace,
};