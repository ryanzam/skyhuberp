import mongoose, { Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    _id: string;
    date: Date;
    reference: string;
    description: string;
    entries: {
        ledger: mongoose.Types.ObjectId;
        debit: number;
        credit: number;
    }[];
    totalAmount: number;
    company: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Transaction date is required'],
        default: Date.now
    },
    reference: {
        type: String,
        required: [true, 'Reference is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    entries: [{
        ledger: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ledger',
            required: true
        },
        debit: {
            type: Number,
            default: 0
        },
        credit: {
            type: Number,
            default: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true
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
transactionSchema.index({ company: 1, date: -1 });
transactionSchema.index({ company: 1, reference: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;