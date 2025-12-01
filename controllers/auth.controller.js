import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { fullName, mobileNumber, password } = req.body;

        // Validation
        if (!fullName || !mobileNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ mobileNumber });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this mobile number already exists'
            });
        }

        // Create user
        const user = await User.create({
            fullName,
            mobileNumber,
            password,
            role: 'user'
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    mobileNumber: user.mobileNumber,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error registering user'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        // Validation
        if (!mobileNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mobile number and password'
            });
        }

        // Find user with password field
        const user = await User.findOne({ mobileNumber }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    mobileNumber: user.mobileNumber,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error logging in'
        });
    }
};

// @desc    Admin login with fixed credentials
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        // Check against environment variables for admin credentials
        if (
            mobileNumber === process.env.ADMIN_MOBILE &&
            password === process.env.ADMIN_PASSWORD
        ) {
            // Find or create admin user
            let admin = await User.findOne({
                mobileNumber: process.env.ADMIN_MOBILE,
                role: 'admin'
            });

            if (!admin) {
                admin = await User.create({
                    fullName: 'Admin',
                    mobileNumber: process.env.ADMIN_MOBILE,
                    password: process.env.ADMIN_PASSWORD,
                    role: 'admin'
                });
            }

            // Generate token
            const token = generateToken(admin._id, admin.role);

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success: true,
                message: 'Admin login successful',
                data: {
                    user: {
                        id: admin._id,
                        fullName: admin.fullName,
                        mobileNumber: admin.mobileNumber,
                        role: admin.role
                    },
                    token
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error in admin login'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                fullName: user.fullName,
                mobileNumber: user.mobileNumber,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting user data'
        });
    }
};
