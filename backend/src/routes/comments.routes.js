import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';
import { publicLimiter, mutatingLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { getComments, createReply, toggleLike } from '../controllers/comments.controller.js';

const router = Router({ mergeParams: true });

const textSchema = z.object({
  text: z.string().min(1).max(2000),
});

router.get('/', publicLimiter, getComments);
router.post('/:commentId/replies', authRequired, mutatingLimiter, validate(textSchema), createReply);
router.post('/:commentId/like', authRequired, mutatingLimiter, toggleLike);

export default router;
