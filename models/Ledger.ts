import mongoose, { Document, Model } from 'mongoose';

export interface ILedger extends Document {
    _id: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    group: string;
    openingBalance: number;
    currentBalance: number;
    company: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ledgerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ledger name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['asset', 'liability', 'equity', 'income', 'expense'],
        required: [true, 'Ledger type is required']
    },
    group: {
        type: String,
        required: [true, 'Ledger group is required'],
        trim: true
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
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

// Compound index for company and name
ledgerSchema.index({ company: 1, name: 1 }, { unique: true });

const Ledger: Model<ILedger> = mongoose.models.Ledger || mongoose.model<ILedger>('Ledger', ledgerSchema);

export default Ledger;