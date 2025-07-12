'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Category } from '@/shared';

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    parentCategory: z.string().optional()
});

type CategoryForm = z.infer<typeof categorySchema>;

const CategoriesPage = () => {

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
            parentCategory: ''
        }
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CategoryForm) => {
        try {
            const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
                setIsDialogOpen(false);
                setEditingCategory(null);
                reset();
                fetchCategories();
            } else {
                const error = await response.json();
                toast.error(error.error || `Failed to ${editingCategory ? 'update' : 'create'} category`);
            }
        } catch (error) {
            toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setValue('name', category.name);
        setValue('description', category.description || '');
        setValue('parentCategory', category.parentCategory?._id || '');
        setIsDialogOpen(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Category deleted successfully');
                fetchCategories();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to delete category');
            }
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        reset();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600 mt-1">Organize your inventory items</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingCategory ? 'Update category details' : 'Add a new category to organize your inventory'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className='space-y-2'>
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Electronics, Furniture, Stationery..."
                                        {...register('name')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Category description..."
                                        {...register('description')}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
                                    <select
                                        id="parentCategory"
                                        {...register('parentCategory')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">No parent category</option>
                                        {categories
                                            .filter(cat => cat._id !== editingCategory?._id)
                                            .map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDialogClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Category List</CardTitle>
                        <CardDescription>
                            Manage your inventory categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading categories...</div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Parent Category</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((category) => (
                                            <TableRow key={category._id}>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>{category.description || '-'}</TableCell>
                                                <TableCell>
                                                    {category.parentCategory ? (
                                                        <Badge variant="secondary">
                                                            {category.parentCategory.name}
                                                        </Badge>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {category.itemCount} items
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(category)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(category._id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {categories.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No categories found</p>
                                        <p className="text-sm mt-1">Create your first category to organize inventory</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout >
    )
}

export default CategoriesPage