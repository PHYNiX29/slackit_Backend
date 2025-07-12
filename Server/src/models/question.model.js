import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true },
    description: { type: String, required: true }, // HTML from rich editor
    tags:        [{ type: String }],
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);
