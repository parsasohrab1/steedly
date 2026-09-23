import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  expirationSeconds?: number
): Promise<void> => {
  try {
    if (expirationSeconds) {
      await redisClient.setEx(key, expirationSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error('Redis pattern delete error:', error);
  }
};

export default redisClient;

