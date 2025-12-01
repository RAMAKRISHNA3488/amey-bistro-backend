import Review from '../models/Review.model.js';
import MenuItem from '../models/MenuItem.model.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { rating, comment, menuItem } = req.body;

        // Validation
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rating and comment'
            });
        }

        // Create review
        const review = await Review.create({
            user: req.user._id,
            userName: req.user.fullName,
            rating,
            comment,
            menuItem: menuItem || null
        });

        // If review is for a specific menu item, update its rating
        if (menuItem) {
            const allReviews = await Review.find({ menuItem, isApproved: true });
            const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

            await MenuItem.findByIdAndUpdate(menuItem, {
                rating: avgRating,
                numReviews: allReviews.length
            });
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating review'
        });
    }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
    try {
        const { menuItem, approved } = req.query;

        let query = {};
        if (menuItem) query.menuItem = menuItem;
        if (approved !== undefined) query.isApproved = approved === 'true';

        // For public access, only show approved reviews
        if (req.user?.role !== 'admin') {
            query.isApproved = true;
        }

        const reviews = await Review.find(query)
            .populate('user', 'fullName')
            .populate('menuItem', 'name')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching reviews'
        });
    }
};

// @desc    Get approved reviews (Public)
// @route   GET /api/reviews/approved
// @access  Public
export const getApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
            .populate('user', 'fullName')
            .populate('menuItem', 'name')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching reviews'
        });
    }
};

// @desc    Approve review (Admin only)
// @route   PATCH /api/reviews/:id/approve
// @access  Private/Admin
export const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review approved successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error approving review'
        });
    }
};

// @desc    Delete review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting review'
        });
    }
};
