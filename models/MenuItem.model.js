import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide item name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide item description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Please specify category'],
        enum: ['Fast Food', 'Pizza', 'Burger', 'Sandwich', 'Italian', 'Desserts', 'Beverages']
    },
    type: {
        type: String,
        required: [true, 'Please specify food type'],
        enum: ['veg', 'non-veg']
    },
    price: {
        type: Number,
        required: [true, 'Please provide item price'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: 'default-food.jpg'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number, // in minutes
        default: 20
    },
    tags: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
