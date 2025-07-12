import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:     { type: String, enum: ['reply', 'mention', 'comment'], required: true },
    content:  { type: String, },
    link:     { type: String, required: true },
    isRead:   { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
