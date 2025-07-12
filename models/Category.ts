import mongoose, { Document, Model } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
  parentCategory?: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  itemCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item count
categorySchema.virtual('itemCount', {
  ref: 'Stock',
  localField: 'name',
  foreignField: 'category',
  count: true,
  match: { isActive: true }
});

// Compound index for company and name
categorySchema.index({ company: 1, name: 1 }, { unique: true });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;