import mongoose, { Document, Model } from 'mongoose';

export interface IOrder extends Document {
    _id: string;
    orderNumber: string;
    type: 'sales' | 'purchase';
    date: Date;
    customer: string;
    items: {
        stock: mongoose.Types.ObjectId;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    company: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: [true, 'Order number is required'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['sales', 'purchase'],
        required: [true, 'Order type is required']
    },
    date: {
        type: Date,
        required: [true, 'Order date is required'],
        default: Date.now
    },
    customer: {
        type: String,
        required: [true, 'Customer/Supplier is required'],
        trim: true
    },
    items: [{
        stock: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
orderSchema.index({ company: 1, type: 1, date: -1 });
orderSchema.index({ company: 1, orderNumber: 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;