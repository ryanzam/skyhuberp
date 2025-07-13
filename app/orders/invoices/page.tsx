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
import { Plus, FileText, Trash2, Eye, Download } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Invoice } from '@/shared';

const invoiceSchema = z.object({
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    date: z.string().min(1, 'Date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    customer: z.string().min(1, 'Customer is required'),
    items: z.array(z.object({
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
        taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100')
    })).min(1, 'At least one item is required'),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    notes: z.string().optional()
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
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
    } = useForm<InvoiceForm>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            invoiceNumber: '',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customer: '',
            items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
            status: 'draft',
            notes: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchedItems = watch('items');

    useEffect(() => {
        fetchInvoices();
        generateInvoiceNumber();
    }, [pagination.page]);

    const generateInvoiceNumber = () => {
        const now = new Date();
        const invoiceNumber = `INV${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        setValue('invoiceNumber', invoiceNumber);
    };

    const fetchInvoices = async () => {
        try {
            const response = await fetch(`/api/invoices?page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const data = await response.json();
                setInvoices(data.invoices);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: InvoiceForm) => {
        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Invoice created successfully');
                setIsDialogOpen(false);
                reset();
                generateInvoiceNumber();
                fetchInvoices();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create invoice');
            }
        } catch (error) {
            toast.error('Failed to create invoice');
        }
    };

    const calculateSubtotal = () => {
        return watchedItems?.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0) || 0;
    };

    const calculateTaxAmount = () => {
        return watchedItems?.reduce((total, item) => {
            const itemTotal = item.quantity * item.unitPrice;
            return total + (itemTotal * (item.taxRate / 100));
        }, 0) || 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTaxAmount();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'sent': return 'default';
            case 'paid': return 'default';
            case 'overdue': return 'destructive';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const handleViewInvoice = (invoice: Invoice) => {
        toast.info('Invoice preview functionality would be implemented here');
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        toast.info('Invoice download functionality would be implemented here');
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                        <p className="text-gray-600 mt-1">Create and manage customer invoices</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Invoice</DialogTitle>
                                <DialogDescription>
                                    Create a new invoice for a customer
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                        <Input
                                            id="invoiceNumber"
                                            {...register('invoiceNumber')}
                                            className={errors.invoiceNumber ? 'border-red-500' : ''}
                                            readOnly
                                        />
                                        {errors.invoiceNumber && (
                                            <p className="text-sm text-red-500 mt-1">{errors.invoiceNumber.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="date">Invoice Date</Label>
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
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            {...register('dueDate')}
                                            className={errors.dueDate ? 'border-red-500' : ''}
                                        />
                                        {errors.dueDate && (
                                            <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            defaultValue="draft"
                                            onValueChange={(value) => setValue('status', value as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="sent">Sent</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="customer">Customer Name</Label>
                                    <Input
                                        id="customer"
                                        placeholder="Customer name or company"
                                        {...register('customer')}
                                        className={errors.customer ? 'border-red-500' : ''}
                                    />
                                    {errors.customer && (
                                        <p className="text-sm text-red-500 mt-1">{errors.customer.message}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <Label>Invoice Items</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-3 border rounded-lg">
                                                <div className="md:col-span-2">
                                                    <Input
                                                        placeholder="Item description"
                                                        {...register(`items.${index}.description`)}
                                                    />
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
                                                <div>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Tax %"
                                                        {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
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

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>${calculateSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Tax:</span>
                                            <span>${calculateTaxAmount().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                            <span>Total:</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Additional notes or terms"
                                        {...register('notes')}
                                    />
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
                                        {isSubmitting ? 'Creating...' : 'Create Invoice'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoices</CardTitle>
                        <CardDescription>
                            Manage customer invoices and billing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading invoices...</div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice) => (
                                            <TableRow key={invoice._id}>
                                                <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                                                <TableCell>{invoice.customer}</TableCell>
                                                <TableCell>
                                                    {new Date(invoice.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ${invoice.totalAmount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(invoice.status) as any}>
                                                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewInvoice(invoice)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadInvoice(invoice)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {invoices.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No invoices found</p>
                                        <p className="text-sm mt-1">Create your first invoice to get started</p>
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
        </DashboardLayout>)
}

export default InvoicesPage