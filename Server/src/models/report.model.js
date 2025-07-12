import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['question', 'reply'], required: true },
    targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    reason:     { type: String, required: true }
}, { timestamps: true });

export const Report = mongoose.model("Report", reportSchema);
