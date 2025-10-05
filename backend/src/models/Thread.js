import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, index: true },
    courseTitle: { type: String },
    postsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Thread', threadSchema);
