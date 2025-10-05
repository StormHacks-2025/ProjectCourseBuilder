import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['post', 'reply', 'like', 'join'] },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseCode: { type: String },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
