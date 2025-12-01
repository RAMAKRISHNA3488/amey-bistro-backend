import express from 'express';
import {
    createReview,
    getReviews,
    getApprovedReviews,
    approveReview,
    deleteReview
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/approved', getApprovedReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/', getReviews);

// Admin only routes
router.patch('/:id/approve', protect, authorize('admin'), approveReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

export default router;
