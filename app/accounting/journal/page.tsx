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
import { Plus, BookOpen, Calendar } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { JournalEntry, Ledger } from '@/shared';

const journalEntrySchema = z.object({
    date: z.string().min(1, 'Date is required'),
    reference: z.string().min(1, 'Reference is required'),
    description: z.string().min(1, 'Description is required'),
    entries: z.array(z.object({
        ledger: z.string().min(1, 'Ledger is required'),
        debit: z.number().min(0),
        credit: z.number().min(0)
    })).min(2, 'At least 2 entries required')
});

type JournalEntryForm = z.infer<typeof journalEntrySchema>;

const JournalPage = () => {

    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('');

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<JournalEntryForm>({
        resolver: zodResolver(journalEntrySchema),
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
        fetchJournalEntries();
        fetchLedgers();
    }, [dateFilter]);

    const fetchJournalEntries = async () => {
        try {
            const params = new URLSearchParams();
            if (dateFilter) params.append('date', dateFilter);

            const response = await fetch(`/api/journal-entries?${params}`);
            if (response.ok) {
                const data = await response.json();
                setJournalEntries(data.journalEntries || data);
            }
        } catch (error) {
            toast.error('Failed to fetch journal entries');
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

    const onSubmit = async (data: JournalEntryForm) => {
        try {
            const totalDebits = data.entries.reduce((sum, entry) => sum + entry.debit, 0);
            const totalCredits = data.entries.reduce((sum, entry) => sum + entry.credit, 0);

            if (Math.abs(totalDebits - totalCredits) > 0.01) {
                toast.error('Total debits must equal total credits');
                return;
            }

            const response = await fetch('/api/journal-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Journal entry created successfully');
                setIsDialogOpen(false);
                reset();
                fetchJournalEntries();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create journal entry');
            }
        } catch (error) {
            toast.error('Failed to create journal entry');
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
                        <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
                        <p className="text-gray-600 mt-1">Record and manage journal entries</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Journal Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Journal Entry</DialogTitle>
                                <DialogDescription>
                                    Record a new journal entry with debit and credit accounts
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
                                            placeholder="JE001"
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
                                            placeholder="Journal entry description"
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
                                        <Label>Account Entries</Label>
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
                                                        onValueChange={(value) => setValue(`entries.${index}.ledger`, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select account" />
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
                                                            Remove
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
                                        {isSubmitting ? 'Creating...' : 'Create Entry'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Journal Entries</CardTitle>
                        <CardDescription>
                            All recorded journal entries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <Label htmlFor="dateFilter">Filter by Date</Label>
                                    <Input
                                        id="dateFilter"
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-40"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setDateFilter('')}
                                    className="mt-6"
                                >
                                    Clear Filter
                                </Button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">Loading journal entries...</div>
                            ) : (
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
                                        {journalEntries.map((entry) => (
                                            <TableRow key={entry._id}>
                                                <TableCell>
                                                    {new Date(entry.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-mono">{entry.reference}</TableCell>
                                                <TableCell>{entry.description}</TableCell>
                                                <TableCell>${entry.totalAmount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {entry.entries.map((entryItem, index) => (
                                                            <div key={index} className="text-xs">
                                                                <span className="font-medium">{entryItem.ledger.name}</span>
                                                                {entryItem.debit > 0 && (
                                                                    <span className="text-green-600 ml-2">
                                                                        Dr. ${entryItem.debit.toFixed(2)}
                                                                    </span>
                                                                )}
                                                                {entryItem.credit > 0 && (
                                                                    <span className="text-red-600 ml-2">
                                                                        Cr. ${entryItem.credit.toFixed(2)}
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
                            )}

                            {journalEntries.length === 0 && !loading && (
                                <div className="text-center py-8 text-gray-500">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No journal entries found</p>
                                    <p className="text-sm mt-1">Create your first journal entry to get started</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default JournalPage