import mongoose from "mongoose";

const replyVoteSchema = new mongoose.Schema({
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reply: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply', required: true },
    vote:  { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });

replyVoteSchema.index({ user: 1, reply: 1 }, { unique: true });

export const ReplyVote = mongoose.model("ReplyVote", replyVoteSchema);
