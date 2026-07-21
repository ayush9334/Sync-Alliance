const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getMessages, sendMessage } = require("../controllers/messageController");

router.get("/:workspaceId", authMiddleware, getMessages);
router.post("/:workspaceId", authMiddleware, sendMessage);

module.exports = router;
