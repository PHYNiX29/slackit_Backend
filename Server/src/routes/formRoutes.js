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

    // voteReply,
    // removeVote,
    upvote,
    downvote,

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
import multer from "multer";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
const router = express.Router();

// Ensure upload directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });

// 📘 Questions
router.post("/questions", authenticateToken, upload.array("images"),createQuestion);
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
// router.post("/replies/:id/vote", authenticateToken, voteReply);
// router.delete("/replies/:id/vote", authenticateToken, removeVote);
router.post("/replies/:id/upvote", authenticateToken, upvote);
router.post("/replies/:id/downvote", authenticateToken, downvote);


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
