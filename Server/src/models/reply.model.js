import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    parent:   { type: mongoose.Schema.Types.ObjectId, ref: 'Reply', default: null },
    content:  { type: String, required: true }, // rich text
    isAccepted: { type: Boolean, default: false },
    votes:    { type: Number, default: 0 }
}, { timestamps: true });

replySchema.index({ question: 1 });
replySchema.index({ parent: 1 });

export const Reply = mongoose.model("Reply", replySchema);
