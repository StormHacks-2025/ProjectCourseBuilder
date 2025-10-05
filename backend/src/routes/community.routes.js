import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { publicLimiter } from '../middleware/rateLimit.js';
import { trending, activityFeed, dashboardBundle } from '../controllers/community.controller.js';

const router = Router();

router.get('/trending', authRequired, publicLimiter, trending);
router.get('/activity', authRequired, publicLimiter, activityFeed);
router.get('/dashboard', authRequired, publicLimiter, dashboardBundle);

export default router;
