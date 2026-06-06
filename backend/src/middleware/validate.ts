import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const interviewValidation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('difficulty').notEmpty().withMessage('Difficulty is required'),
  body('type').notEmpty().withMessage('Type is required'),
];

export const challengeValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('difficulty').notEmpty().withMessage('Difficulty is required'),
];
