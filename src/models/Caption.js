import mongoose from 'mongoose'

const CaptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

CaptionSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Caption || mongoose.model('Caption', CaptionSchema)