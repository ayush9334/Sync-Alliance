const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  searchUser,
  getUserStats,
  getTeams,
} = require("../controllers/userController");

router.get("/search", authMiddleware, searchUser);
router.get("/stats", authMiddleware, getUserStats);
router.get("/teams", authMiddleware, getTeams);

module.exports = router;