import express from "express";
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,

    postReply,
    getRepliesByQuestion,
    getRepliesByReply,
    updateReply,
    deleteReply,
    acceptReply,

    voteReply,
    removeVote,

    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,

    reportContent,

    getAllUsers,
    toggleBanUser,
    getAllReports,
    deleteContent
} from "../controllers/formController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📘 Questions
router.post("/questions", authenticateToken, createQuestion);
router.get("/questions", getAllQuestions);
router.get("/questions/:id", getQuestionById);
router.put("/questions/:id", authenticateToken, updateQuestion);
router.delete("/questions/:id", authenticateToken, deleteQuestion);

// 💬 Replies (Nested)
router.post("/questions/:id/replies", authenticateToken, postReply); // top-level
router.post("/replies/:id/replies", authenticateToken, postReply);   // nested
router.get("/questions/:id/replies", getRepliesByQuestion);
router.get("/replies/:id/replies", getRepliesByReply);
router.put("/replies/:id", authenticateToken, updateReply);
router.delete("/replies/:id", authenticateToken, deleteReply);
router.post("/replies/:id/accept", authenticateToken, acceptReply);

// 👍 Votes
router.post("/replies/:id/vote", authenticateToken, voteReply);
router.delete("/replies/:id/vote", authenticateToken, removeVote);

// 🔔 Notifications
router.get("/notifications", authenticateToken, getNotifications);
router.post("/notifications/:id/read", authenticateToken, markNotificationRead);
router.post("/notifications/mark-all", authenticateToken, markAllNotificationsRead);

// 🚨 Reports
router.post("/reports", authenticateToken, reportContent);

// 👑 Admin
router.get("/admin/users", authenticateToken, getAllUsers);
router.put("/admin/users/:id/ban", authenticateToken, toggleBanUser);
router.get("/admin/reports", authenticateToken, getAllReports);
router.delete("/admin/content/:id", authenticateToken, deleteContent);

export default router;
