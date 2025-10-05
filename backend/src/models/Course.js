import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    description: { type: String },
    termsOffered: [{ type: String }],
    prereqs: [{ type: String }],
  },
  { timestamps: true }
);

courseSchema.index({ code: 'text', title: 'text', description: 'text' });

export default mongoose.model('Course', courseSchema);
