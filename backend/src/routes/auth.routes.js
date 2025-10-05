import { Router } from 'express';
import { z } from 'zod';
import { register, login } from '../controllers/auth.controller.js';
import { mutatingLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(40),
  email: z.string().email(),
  password: z.string().min(8),
  avatar: z.string().url().optional(),
  major: z.string().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', mutatingLimiter, validate(registerSchema), register);
router.post('/login', mutatingLimiter, validate(loginSchema), login);

export default router;
