import mongoose from 'mongoose'

const captionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  caption: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

captionSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Caption', captionSchema)