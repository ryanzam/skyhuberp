'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PurchaseOrder, Stock } from '@/shared';

const purchaseOrderSchema = z.object({
    orderNumber: z.string().min(1, 'Order number is required'),
    date: z.string().min(1, 'Date is required'),
    supplier: z.string().min(1, 'Supplier is required'),
    items: z.array(z.object({
        stock: z.string().min(1, 'Stock item is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0.01, 'Unit price must be greater than 0')
    })).min(1, 'At least one item is required'),
    status: z.enum(['pending', 'confirmed', 'received', 'cancelled'])
});

type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>;

const PurchasePage = () => {

    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<PurchaseOrderForm>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            orderNumber: '',
            date: new Date().toISOString().split('T')[0],
            supplier: '',
            items: [{ stock: '', quantity: 1, unitPrice: 0 }],
            status: 'pending'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchedItems = watch('items');

    useEffect(() => {
        fetchOrders();
        fetchStocks();
        generateOrderNumber();
    }, [pagination.page]);

    const generateOrderNumber = () => {
        const now = new Date();
        const orderNumber = `PO${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        setValue('orderNumber', orderNumber);
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(`/api/orders?type=purchase&page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchStocks = async () => {
        try {
            const response = await fetch('/api/stock?limit=1000');
            if (response.ok) {
                const data = await response.json();
                setStocks(data.stocks);
            }
        } catch (error) {
            toast.error('Failed to fetch stock items');
        }
    };

    const onSubmit = async (data: PurchaseOrderForm) => {
        try {
            const orderData = {
                ...data,
                type: 'purchase',
                customer: data.supplier // API expects 'customer' field
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                toast.success('Purchase order created successfully');
                setIsDialogOpen(false);
                reset();
                generateOrderNumber();
                fetchOrders();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create purchase order');
            }
        } catch (error) {
            toast.error('Failed to create purchase order');
        }
    };

    const handleStockChange = (index: number, stockId: string) => {
        const selectedStock = stocks.find(s => s._id === stockId);
        if (selectedStock) {
            setValue(`items.${index}.unitPrice`, selectedStock.unitPrice);
        }
    };

    const calculateTotal = () => {
        return watchedItems?.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0) || 0;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'confirmed': return 'default';
            case 'received': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };


    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
                        <p className="text-gray-600 mt-1">Manage supplier orders and purchases</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Purchase Order
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Purchase Order</DialogTitle>
                                <DialogDescription>
                                    Create a new purchase order for a supplier
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="orderNumber">Order Number</Label>
                                        <Input
                                            id="orderNumber"
                                            {...register('orderNumber')}
                                            className={errors.orderNumber ? 'border-red-500' : ''}
                                            readOnly
                                        />
                                        {errors.orderNumber && (
                                            <p className="text-sm text-red-500 mt-1">{errors.orderNumber.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="date">Order Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            {...register('date')}
                                            className={errors.date ? 'border-red-500' : ''}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            defaultValue="pending"
                                            onValueChange={(value) => setValue('status', value as 'pending' | 'confirmed' | 'received' | 'cancelled')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="received">Received</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="supplier">Supplier Name</Label>
                                    <Input
                                        id="supplier"
                                        placeholder="Supplier name or company"
                                        {...register('supplier')}
                                        className={errors.supplier ? 'border-red-500' : ''}
                                    />
                                    {errors.supplier && (
                                        <p className="text-sm text-red-500 mt-1">{errors.supplier.message}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <Label>Order Items</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({ stock: '', quantity: 1, unitPrice: 0 })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                                                <div className="md:col-span-2">
                                                    <Select
                                                        value={watchedItems?.[index]?.stock || ''}
                                                        onValueChange={(value) => {
                                                            setValue(`items.${index}.stock`, value);
                                                            handleStockChange(index, value);
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select item" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {stocks.map((stock) => (
                                                                <SelectItem key={stock._id} value={stock._id}>
                                                                    {stock.name} ({stock.code}) - ${stock.unitPrice}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Qty"
                                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Unit Price"
                                                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium">
                                                        ${((watchedItems?.[index]?.quantity || 0) * (watchedItems?.[index]?.unitPrice || 0)).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    {fields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total Amount:</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
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
                                        {isSubmitting ? 'Creating...' : 'Create Order'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Orders</CardTitle>
                        <CardDescription>
                            Manage supplier orders and track purchases
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading orders...</div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order._id}>
                                                <TableCell className="font-mono">{order.orderNumber}</TableCell>
                                                <TableCell>
                                                    {new Date(order.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {order.items.map((item, index) => (
                                                            <div key={index} className="text-xs">
                                                                <span className="font-medium">{item.stock.name}</span>
                                                                <span className="text-gray-500 ml-2">
                                                                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ${order.totalAmount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(order.status) as any}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {orders.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No purchase orders found</p>
                                        <p className="text-sm mt-1">Create your first purchase order to get started</p>
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
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default PurchasePage