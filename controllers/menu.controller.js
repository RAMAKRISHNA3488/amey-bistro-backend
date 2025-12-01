import MenuItem from '../models/MenuItem.model.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res) => {
    try {
        const { category, type, search } = req.query;

        let query = {};

        if (category) query.category = category;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const menuItems = await MenuItem.find(query).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching menu items'
        });
    }
};

// @desc    Get menu items by type (veg/non-veg)
// @route   GET /api/menu/type/:type
// @access  Public
export const getMenuByType = async (req, res) => {
    try {
        const { type } = req.params;

        if (!['veg', 'non-veg'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Must be "veg" or "non-veg"'
            });
        }

        const menuItems = await MenuItem.find({ type, isAvailable: true }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching menu items'
        });
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching menu item'
        });
    }
};

// @desc    Create menu item (Admin only)
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating menu item'
        });
    }
};

// @desc    Update menu item (Admin only)
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating menu item'
        });
    }
};

// @desc    Delete menu item (Admin only)
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting menu item'
        });
    }
};

// @desc    Toggle menu item availability (Admin only)
// @route   PATCH /api/menu/:id/availability
// @access  Private/Admin
export const toggleAvailability = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        menuItem.isAvailable = !menuItem.isAvailable;
        await menuItem.save();

        res.status(200).json({
            success: true,
            message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error toggling availability'
        });
    }
};
