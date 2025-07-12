import { Question } from "../models/question.model.js";
import { Reply } from "../models/reply.model.js";
import { ReplyVote } from "../models/replyVote.model.js";
import { Notification } from "../models/notification.model.js";
import { Report } from "../models/report.model.js";
import { User } from "../models/user1.model.js";
import mongoose from "mongoose";

// 📘 Questions
export const createQuestion = async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const userId = req.user._id;
 
        const newQuestion = await Question.create({
            title,
            description,
            tags,
            user: userId,
        });

        res.json(newQuestion);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().populate("user", "username").sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate("user", "username");
        res.json(question);
    } catch (err) {
        res.status(404).json({ err: "Question not found" });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const userId = req.user._id;
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ err: "Not found" });
        if (question.user.toString() !== userId) return res.status(403).json({ err: "Unauthorized" });

        const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const userId = req.user._id;
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ err: "Not found" });
        if (question.user.toString() !== userId && req.user.role !== "admin")
            return res.status(403).json({ err: "Unauthorized" });

        await question.deleteOne();
        res.json({ msg: "Deleted" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

// 💬 Replies
export const postReply = async (req, res) => {
    try {
        const userId = req.user._id;
        const { content, question: bodyQuestionId } = req.body;

        const paramId = req.params.id;
        let questionId = null;
        let parentId = null;

        if (paramId && paramId.startsWith("replies")) {
            // Nested reply to another reply
            parentId = paramId.replace("replies/", "");
            const parentReply = await Reply.findById(parentId);
            if (!parentReply) {
                return res.status(404).json({ err: "Parent reply not found" });
            }
            questionId = parentReply.question;
        } else {
            // Top-level reply
            questionId = paramId || bodyQuestionId;
            parentId = null;
        }

        const reply = await Reply.create({
            user: userId,
            question: questionId,
            parent: parentId,
            content,
        });

        // 🔔 Notify question owner (if top-level reply)
        if (questionId && !parentId) {
            const question = await Question.findById(questionId);
            if (question && question.user.toString() !== userId.toString()) {
                await Notification.create({
                    user: question.user,
                    type: "reply",
                    message: `Someone replied to your question.`,
                    link: `/questions/${question._id}`
                });
            }
        }

        // 🔔 Notify parent reply owner (if nested reply)
        if (parentId) {
            const parentReply = await Reply.findById(parentId);
            if (parentReply && parentReply.user.toString() !== userId.toString()) {
                await Notification.create({
                    user: parentReply.user,
                    type: "nested-reply",
                    message: `Someone replied to your comment.`,
                    link: `/questions/${parentReply.question}#reply-${reply._id}`
                });
            }
        }

        res.json(reply);
    } catch (err) {
        console.error("Error in postReply:", err);
        res.status(500).json({ err: err.message });
    }
};

export const getRepliesByQuestion = async (req, res) => {
    try {
        const replies = await Reply.find({ question: req.params.id })
            .populate("user", "username")
            .sort({ createdAt: 1 });
            console.log(replies);
        res.json(replies);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const getRepliesByReply = async (req, res) => {
    try {
        const replies = await Reply.find({ parent: req.params.id })
            .populate("user", "username")
            .sort({ createdAt: 1 });
        res.json(replies);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const updateReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply) return res.status(404).json({ err: "Reply not found" });

        if (reply.user.toString() !== req.user._id)
            return res.status(403).json({ err: "Unauthorized" });

        reply.content = req.body.content || reply.content;
        await reply.save();
        res.json(reply);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const deleteReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply) return res.status(404).json({ err: "Reply not found" });

        if (reply.user.toString() !== req.user._id && req.user.role !== "admin")
            return res.status(403).json({ err: "Unauthorized" });

        await reply.deleteOne();
        res.json({ msg: "Reply deleted" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export const acceptReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        const question = await Question.findById(reply.question);

        if (!reply || !question) return res.status(404).json({ err: "Not found" });

        if (question.user.toString() !== req.user._id)
            return res.status(403).json({ err: "Only question owner can accept" });

        reply.isAccepted = true;
        await reply.save();

        // 🔔 Notify reply author
        if (reply.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: reply.user,
                type: "accepted",
                message: `Your reply was accepted as the answer.`,
                link: `/questions/${reply.question}#reply-${reply._id}`
            });
        }

        res.json({ msg: "Reply accepted" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};


// 👍 Votes

export const voteReply = async (req, res) => {
    try {
        const { vote } = req.body; // 1 or -1
        const userId = req.user._id;
        const replyId = req.params.id;

        const replyObjectId = new mongoose.Types.ObjectId(replyId);

        const existing = await ReplyVote.findOne({ user: userId, reply: replyObjectId });

        if (existing) {
            if (existing.vote === vote)
                return res.status(400).json({ err: "Already voted" });
            existing.vote = vote;
            await existing.save();
        } else {
            await ReplyVote.create({ user: userId, reply: replyObjectId, vote });
        }

        const votes = await ReplyVote.aggregate([
            { $match: { reply: replyObjectId } },
            { $group: { _id: "$reply", total: { $sum: "$vote" } } }
        ]);

        await Reply.findByIdAndUpdate(replyObjectId, { votes: votes[0]?.total || 0 });

        // 🔔 Notify reply owner (only on upvote)
        if (vote === 1) {
            const reply = await Reply.findById(replyObjectId);
            if (reply && reply.user.toString() !== userId.toString()) {
                await Notification.create({
                    user: reply.user,
                    type: "vote",
                    message: `Your reply was upvoted.`,
                    link: `/questions/${reply.question}#reply-${reply._id}`
                });
            }
        }

        res.json({ msg: "Vote recorded" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};


export const removeVote = async (req, res) => {
    try {
        const userId = req.user._id;
        const replyId = req.params.id;

        await ReplyVote.deleteOne({ user: userId, reply: replyId });

        const votes = await ReplyVote.aggregate([
            { $match: { reply: replyId } },
            { $group: { _id: "$reply", total: { $sum: "$vote" } } }
        ]);

        await Reply.findByIdAndUpdate(replyId, { votes: votes[0]?.total || 0 });
        res.json({ msg: "Vote removed" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

// 🔔 Notifications
export const getNotifications = async (req, res) => {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Marked as read" });
};

export const markAllNotificationsRead = async (req, res) => {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.json({ msg: "All marked as read" });
};

// 🚨 Reports
export const reportContent = async (req, res) => {
    const { targetType, targetId, reason } = req.body;
    await Report.create({
        reportedBy: req.user._id,
        targetType,
        targetId,
        reason,
    });
    res.json({ msg: "Reported" });
};

// 👑 Admin
export const getAllUsers = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ err: "Admins only" });

    const users = await User.find({}, "-password");
    res.json(users);
};

export const toggleBanUser = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ err: "Admins only" });

    const user = await User.findById(req.params.id);
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ msg: user.isBanned ? "User banned" : "User unbanned" });
};

export const getAllReports = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ err: "Admins only" });

    const reports = await Report.find().populate("reportedBy", "username");
    res.json(reports);
};

export const deleteContent = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ err: "Admins only" });

    // Try deleting from both collections
    await Question.findByIdAndDelete(req.params.id);
    await Reply.findByIdAndDelete(req.params.id);

    res.json({ msg: "Deleted content (question or reply)" });
};
