import express from 'express'
import { generateCaption, getCaptions, deleteCaption } from '../controllers/captionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/generate', protect, generateCaption)
router.get('/', protect, getCaptions)
router.delete('/:id', protect, deleteCaption)

export default router