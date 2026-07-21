const Message = require("../models/Message");
const Workspace = require("../models/Workspace");

const isWorkspaceMember = (workspace, userId) => {
  if (workspace.owner.toString() === userId) return true;
  return workspace.members.some(
    (member) => member.user.toString() === userId
  );
};

// Get messages for workspace
const getMessages = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ workspace: workspaceId })
      .populate("sender", "_id name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post new message
const sendMessage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!isWorkspaceMember(workspace, req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const newMessage = await Message.create({
      workspace: workspaceId,
      sender: req.user.id,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "_id name email"
    );

    // Emit live socket event if io is attached to req.app
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("new_message", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
