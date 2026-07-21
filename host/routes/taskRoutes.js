const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} = require("../controllers/taskController");

// Create Task
router.post("/:workspaceId", authMiddleware, createTask);

// Get All Tasks of a Workspace
router.get("/:workspaceId", authMiddleware, getTasks);

// Get Single Task (with comments)
router.get("/detail/:id", authMiddleware, getTaskById);

// Update Task
router.put("/:id", authMiddleware, updateTask);

// Delete Task
router.delete("/:id", authMiddleware, deleteTask);

// Add Comment
router.post("/:id/comments", authMiddleware, addComment);

// Delete Comment
router.delete("/:id/comments/:commentId", authMiddleware, deleteComment);

module.exports = router;