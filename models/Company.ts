import mongoose, { Document, Model } from 'mongoose';

export interface ICompany extends Document {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  financialYear: {
    startDate: Date;
    endDate: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    unique: true,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  financialYear: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);

export default Company;