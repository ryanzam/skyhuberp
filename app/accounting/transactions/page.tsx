"use client"

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import loading from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ledger, Transaction } from '@/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Plus, Trash2, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const transactionSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    reference: z.string().min(1, 'Reference is required'),
    description: z.string().min(1, 'Description is required'),
    entries: z.array(z.object({
        ledger: z.string().min(1, 'Ledger is required'),
        debit: z.number().min(0),
        credit: z.number().min(0)
    })).min(2, 'At least 2 entries required')
});

type TransactionForm = z.infer<typeof transactionSchema>;

const TransactionsPage = () => {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
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
        formState: { errors, isSubmitting }
    } = useForm<TransactionForm>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            reference: '',
            description: '',
            entries: [
                { ledger: '', debit: 0, credit: 0 },
                { ledger: '', debit: 0, credit: 0 }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'entries'
    });

    const watchedEntries = watch('entries');

    useEffect(() => {
        fetchTransactions();
        fetchLedgers();
    }, [pagination.page]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`/api/transactions?page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchLedgers = async () => {
        try {
            const response = await fetch('/api/ledgers');
            if (response.ok) {
                const data = await response.json();
                setLedgers(data);
            }
        } catch (error) {
            toast.error('Failed to fetch ledgers');
        }
    };

    const onSubmit = async (data: TransactionForm) => {
        try {
            // Validate that debits equal credits
            const totalDebits = data.entries.reduce((sum, entry) => sum + entry.debit, 0);
            const totalCredits = data.entries.reduce((sum, entry) => sum + entry.credit, 0);

            if (Math.abs(totalDebits - totalCredits) > 0.01) {
                toast.error('Total debits must equal total credits');
                return;
            }

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Transaction created successfully');
                setIsDialogOpen(false);
                reset();
                fetchTransactions();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create transaction');
            }
        } catch (error) {
            toast.error('Failed to create transaction');
        }
    };

    const totalDebits = watchedEntries?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0;
    const totalCredits = watchedEntries?.reduce((sum, entry) => sum + (entry.credit || 0), 0) || 0;
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                        <p className="text-gray-600 mt-1">Manage journal entries and financial transactions</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Transaction</DialogTitle>
                                <DialogDescription>
                                    Add a new journal entry with debit and credit entries
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date</Label>
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
                                        <Label htmlFor="reference">Reference</Label>
                                        <Input
                                            id="reference"
                                            placeholder="TXN001"
                                            {...register('reference')}
                                            className={errors.reference ? 'border-red-500' : ''}
                                        />
                                        {errors.reference && (
                                            <p className="text-sm text-red-500 mt-1">{errors.reference.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder="Transaction description"
                                            {...register('description')}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <Label>Journal Entries</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({ ledger: '', debit: 0, credit: 0 })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Entry
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg">
                                                <div className="md:col-span-2">
                                                    <Select
                                                        value={watchedEntries?.[index]?.ledger || ''}
                                                    /*  onValueChange={(value) => {
                                                         setValue(`entries.${index}.ledger`, value);
                                                     }} */
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select ledger" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ledgers.map((ledger) => (
                                                                <SelectItem key={ledger._id} value={ledger._id}>
                                                                    {ledger.name} ({ledger.type})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Debit"
                                                        {...register(`entries.${index}.debit`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Credit"
                                                        {...register(`entries.${index}.credit`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div>
                                                    {fields.length > 2 && (
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
                                        <div className="flex justify-between text-sm">
                                            <span>Total Debits: ${totalDebits.toFixed(2)}</span>
                                            <span>Total Credits: ${totalCredits.toFixed(2)}</span>
                                        </div>
                                        <div className="mt-2">
                                            <Badge variant={isBalanced ? "default" : "destructive"}>
                                                {isBalanced ? "Balanced" : "Not Balanced"}
                                            </Badge>
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
                                    <Button type="submit" disabled={isSubmitting || !isBalanced}>
                                        {isSubmitting ? 'Creating...' : 'Create Transaction'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            All journal entries and financial transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading transactions...</div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Entries</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction._id}>
                                                <TableCell>
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-mono">{transaction.reference}</TableCell>
                                                <TableCell>{transaction.description}</TableCell>
                                                <TableCell>${transaction.totalAmount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {transaction.entries.map((entry, index) => (
                                                            <div key={index} className="text-xs">
                                                                <span className="font-medium">{entry.ledger.name}</span>
                                                                {entry.debit > 0 && (
                                                                    <span className="text-green-600 ml-2">
                                                                        Dr. ${entry.debit.toFixed(2)}
                                                                    </span>
                                                                )}
                                                                {entry.credit > 0 && (
                                                                    <span className="text-red-600 ml-2">
                                                                        Cr. ${entry.credit.toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {transactions.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No transactions found</p>
                                        <p className="text-sm mt-1">Create your first transaction to get started</p>
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

export default TransactionsPage