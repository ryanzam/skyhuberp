import mongoose, { Document, Model } from 'mongoose';

export interface IStock extends Document {
    _id: string;
    name: string;
    code: string;
    category: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    minStock: number;
    maxStock: number;
    valuationMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
    company: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Stock name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Stock code is required'],
        trim: true,
        uppercase: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        trim: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: 0
    },
    minStock: {
        type: Number,
        default: 0,
        min: 0
    },
    maxStock: {
        type: Number,
        default: 0,
        min: 0
    },
    valuationMethod: {
        type: String,
        enum: ['FIFO', 'LIFO', 'WEIGHTED_AVERAGE'],
        default: 'FIFO'
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for company and code
stockSchema.index({ company: 1, code: 1 }, { unique: true });

const Stock: Model<IStock> = mongoose.models.Stock || mongoose.model<IStock>('Stock', stockSchema);

export default Stock;