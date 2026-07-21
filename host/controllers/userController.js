const User = require("../models/User");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

// Search User by Email
const searchUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("_id name email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get User Dashboard Stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Workspaces user belongs to
    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    });

    const workspaceIds = workspaces.map((w) => w._id);

    // Compute unique team members across all workspaces
    const memberMap = new Map();
    workspaces.forEach((w) => {
      w.members.forEach((m) => {
        memberMap.set(m.user.toString(), true);
      });
    });

    const totalTasks = await Task.countDocuments({
      workspace: { $in: workspaceIds },
    });

    const completedTasks = await Task.countDocuments({
      workspace: { $in: workspaceIds },
      status: "Done",
    });

    const messagesCount = await Message.countDocuments({
      workspace: { $in: workspaceIds },
    });

    const unreadNotifications = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      workspacesCount: workspaces.length,
      membersCount: memberMap.size,
      totalTasks,
      completedTasks,
      messagesCount,
      unreadNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Teams / All Members across user workspaces
const getTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    }).populate("members.user", "_id name email");

    // Aggregate unique users and their workspaces/roles
    const usersMap = new Map();

    workspaces.forEach((ws) => {
      ws.members.forEach((m) => {
        if (!m.user) return;
        const idStr = m.user._id.toString();
        if (!usersMap.has(idStr)) {
          usersMap.set(idStr, {
            _id: m.user._id,
            name: m.user.name,
            email: m.user.email,
            workspaces: [],
          });
        }
        usersMap.get(idStr).workspaces.push({
          workspaceId: ws._id,
          workspaceName: ws.name,
          role: m.role,
          joinedAt: m.joinedAt,
        });
      });
    });

    const teamMembers = Array.from(usersMap.values());
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUser,
  getUserStats,
  getTeams,
};