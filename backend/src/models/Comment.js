import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    threadCourseCode: { type: String, required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

commentSchema.index({ threadCourseCode: 1, createdAt: -1 });
commentSchema.index({ text: 'text' });

export default mongoose.model('Comment', commentSchema);
