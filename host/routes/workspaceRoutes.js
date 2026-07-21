const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  inviteMember,
  deleteWorkspace,
} = require("../controllers/workspaceController");

// Create Workspace
router.post("/", authMiddleware, createWorkspace);

// Get All Workspaces
router.get("/", authMiddleware, getWorkspaces);

// Get Single Workspace
router.get("/:id", authMiddleware, getWorkspace);

// Update Workspace
router.put("/:id", authMiddleware, updateWorkspace);

// Invite Member
router.post("/:id/invite", authMiddleware, inviteMember);

// Delete Workspace
router.delete("/:id", authMiddleware, deleteWorkspace);

module.exports = router;