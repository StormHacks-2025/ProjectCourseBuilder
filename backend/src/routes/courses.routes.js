import { Router } from 'express';
import { searchCourses } from '../controllers/courses.controller.js';
import { publicLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/search', publicLimiter, searchCourses);

export default router;
