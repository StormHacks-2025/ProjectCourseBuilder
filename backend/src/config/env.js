import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/coursecompass',
  jwtSecret: process.env.JWT_SECRET || 'supersecret_jwt',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
