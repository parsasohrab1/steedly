import express, { Request, Response, NextFunction } from 'express';
import { upload, getFileUrl } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Upload single image
router.post(
  '/image',
  authenticate,
  upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was sent',
        });
      }

      const fileUrl = getFileUrl(req.file);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload multiple images
router.post(
  '/images',
  authenticate,
  upload.array('images', 10),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image file was sent',
        });
      }

      const files = (req.files as Express.Multer.File[]).map((file) => ({
        url: getFileUrl(file),
        filename: file.filename,
        size: file.size,
      }));

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: files,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was sent',
        });
      }

      const fileUrl = getFileUrl(req.file);

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

