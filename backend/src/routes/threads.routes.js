import { Router } from 'express';
import { z } from 'zod';
import { getThread } from '../controllers/threads.controller.js';
import { createRootComment } from '../controllers/comments.controller.js';
import { authRequired } from '../middleware/auth.js';
import { mutatingLimiter, publicLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createThreadSchema = z.object({
  courseTitle: z.string().optional(),
});

const commentSchema = z.object({
  text: z.string().min(1).max(2000),
});

router.get('/:courseCode', publicLimiter, getThread);
router.post(
  '/:courseCode/comments',
  authRequired,
  mutatingLimiter,
  validate(commentSchema),
  createRootComment
);

export default router;
