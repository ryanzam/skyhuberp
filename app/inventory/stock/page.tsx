'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Search, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Stock } from '@/shared';

const stockSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    category: z.string().min(1, 'Category is required'),
    unit: z.string().min(1, 'Unit is required'),
    quantity: z.number().min(0, 'Quantity must be non-negative'),
    unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
    minStock: z.number().min(0, 'Minimum stock must be non-negative'),
    maxStock: z.number().min(0, 'Maximum stock must be non-negative'),
    valuationMethod: z.enum(['FIFO', 'LIFO', 'WEIGHTED_AVERAGE'])
});

type StockForm = z.infer<typeof stockSchema>;

const StockPage = () => {

    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<StockForm>({
        resolver: zodResolver(stockSchema),
        defaultValues: {
            name: '',
            code: '',
            category: '',
            unit: 'Piece',
            quantity: 0,
            unitPrice: 0,
            minStock: 0,
            maxStock: 0,
            valuationMethod: 'FIFO'
        }
    });

    useEffect(() => {
        fetchStocks();
    }, [pagination.page, searchTerm]);

    const fetchStocks = async () => {
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await fetch(`/api/stock?${params}`);
            if (response.ok) {
                const data = await response.json();
                setStocks(data.stocks);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch stock items');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: StockForm) => {
        try {
            const response = await fetch('/api/stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Stock item created successfully');
                setIsDialogOpen(false);
                reset();
                fetchStocks();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create stock item');
            }
        } catch (error) {
            toast.error('Failed to create stock item');
        }
    };

    const getStockStatus = (stock: Stock) => {
        if (stock.quantity <= stock.minStock) {
            return { status: 'Low Stock', variant: 'destructive' as const };
        } else if (stock.quantity >= stock.maxStock && stock.maxStock > 0) {
            return { status: 'Overstock', variant: 'secondary' as const };
        } else {
            return { status: 'In Stock', variant: 'default' as const };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
                        <p className="text-gray-600 mt-1">Manage inventory items and stock levels</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stock Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Stock Item</DialogTitle>
                                <DialogDescription>
                                    Add a new item to your inventory
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Item Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Laptop Computer"
                                            {...register('name')}
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="code">Item Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="LPT001"
                                            {...register('code')}
                                            className={errors.code ? 'border-red-500' : ''}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            placeholder="Electronics"
                                            {...register('category')}
                                            className={errors.category ? 'border-red-500' : ''}
                                        />
                                        {errors.category && (
                                            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="unit">Unit of Measure</Label>
                                        <Select
                                            defaultValue="Piece"
                                            onValueChange={(value) => setValue('unit', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Piece">Piece</SelectItem>
                                                <SelectItem value="Kg">Kilogram</SelectItem>
                                                <SelectItem value="Liter">Liter</SelectItem>
                                                <SelectItem value="Meter">Meter</SelectItem>
                                                <SelectItem value="Box">Box</SelectItem>
                                                <SelectItem value="Dozen">Dozen</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="quantity">Current Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            step="0.01"
                                            {...register('quantity', { valueAsNumber: true })}
                                            className={errors.quantity ? 'border-red-500' : ''}
                                        />
                                        {errors.quantity && (
                                            <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="unitPrice">Unit Price</Label>
                                        <Input
                                            id="unitPrice"
                                            type="number"
                                            step="0.01"
                                            {...register('unitPrice', { valueAsNumber: true })}
                                            className={errors.unitPrice ? 'border-red-500' : ''}
                                        />
                                        {errors.unitPrice && (
                                            <p className="text-sm text-red-500 mt-1">{errors.unitPrice.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="valuationMethod">Valuation Method</Label>
                                        <Select
                                            defaultValue="FIFO"
                                            onValueChange={(value) => setValue('valuationMethod', value as 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIFO">FIFO</SelectItem>
                                                <SelectItem value="LIFO">LIFO</SelectItem>
                                                <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="minStock">Minimum Stock Level</Label>
                                        <Input
                                            id="minStock"
                                            type="number"
                                            step="0.01"
                                            {...register('minStock', { valueAsNumber: true })}
                                            className={errors.minStock ? 'border-red-500' : ''}
                                        />
                                        {errors.minStock && (
                                            <p className="text-sm text-red-500 mt-1">{errors.minStock.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="maxStock">Maximum Stock Level</Label>
                                        <Input
                                            id="maxStock"
                                            type="number"
                                            step="0.01"
                                            {...register('maxStock', { valueAsNumber: true })}
                                            className={errors.maxStock ? 'border-red-500' : ''}
                                        />
                                        {errors.maxStock && (
                                            <p className="text-sm text-red-500 mt-1">{errors.maxStock.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Creating...' : 'Create Stock Item'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock Items</CardTitle>
                        <CardDescription>
                            Manage your inventory items and stock levels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search stock items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">Loading stock items...</div>
                            ) : (
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Unit Price</TableHead>
                                                <TableHead>Total Value</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stocks.map((stock) => {
                                                const stockStatus = getStockStatus(stock);
                                                return (
                                                    <TableRow key={stock._id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{stock.name}</div>
                                                                <div className="text-sm text-gray-500">{stock.unit}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono">{stock.code}</TableCell>
                                                        <TableCell>{stock.category}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <span>{stock.quantity}</span>
                                                                {stock.quantity <= stock.minStock && (
                                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>${stock.unitPrice.toFixed(2)}</TableCell>
                                                        <TableCell>${(stock.quantity * stock.unitPrice).toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={stockStatus.variant}>
                                                                {stockStatus.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>

                                    {stocks.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No stock items found</p>
                                            <p className="text-sm mt-1">Add your first stock item to get started</p>
                                        </div>
                                    )}

                                    {pagination.pages > 1 && (
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.page === 1}
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            >
                                                Previous
                                            </Button>
                                            <span className="px-3 py-2 text-sm">
                                                Page {pagination.page} of {pagination.pages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.page === pagination.pages}
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default StockPage