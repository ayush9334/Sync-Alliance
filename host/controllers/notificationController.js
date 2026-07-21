const Notification = require("../models/Notification");

// Create & emit helper
const sendNotification = async (app, { recipient, sender, type, title, message, link }) => {
  try {
    if (recipient.toString() === sender.toString()) return;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link: link || "",
    });

    const populated = await Notification.findById(notification._id).populate(
      "sender",
      "name email"
    );

    const io = app.get("io");
    if (io) {
      io.to(`user:${recipient}`).emit("new_notification", populated);
    }
    return populated;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
