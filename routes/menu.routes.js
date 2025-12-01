import express from 'express';
import {
    getMenuItems,
    getMenuByType,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability
} from '../controllers/menu.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/type/:type', getMenuByType);
router.get('/:id', getMenuItem);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);
router.patch('/:id/availability', protect, authorize('admin'), toggleAvailability);

export default router;
