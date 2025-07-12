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
import { Plus, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Ledger } from '@/shared';

// If you control the Ledger type, ensure it includes openingBalance:
type LedgerWithOpening = Ledger & { openingBalance: number; currentBalance: number };

const ledgerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
    group: z.string().min(1, 'Group is required'),
    openingBalance: z.number({
        required_error: 'Opening Balance is required',
        invalid_type_error: 'Opening Balance must be a number'
    })
});

type LedgerForm = z.infer<typeof ledgerSchema>;
//const [ledgers, setLedgers] = useState<LedgerWithOpening[]>([]);
const LedgersPage = () => {

    const [ledgers, setLedgers] = useState<LedgerWithOpening[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<LedgerForm>({
        resolver: zodResolver(ledgerSchema),
        defaultValues: {
            name: '',
            type: 'asset',
            group: '',
            openingBalance: 0
        }
    });

    useEffect(() => {
        fetchLedgers();
    }, []);

    const fetchLedgers = async () => {
        try {
            const response = await fetch('/api/ledgers');
            if (response.ok) {
                const data = await response.json();
                setLedgers(data);
            }
        } catch (error) {
            toast.error('Failed to fetch ledgers');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: LedgerForm) => {
        try {
            const response = await fetch('/api/ledgers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Ledger created successfully');
                setIsDialogOpen(false);
                reset();
                fetchLedgers();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create ledger');
            }
        } catch (error) {
            toast.error('Failed to create ledger');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'asset': return 'default';
            case 'liability': return 'destructive';
            case 'equity': return 'secondary';
            case 'income': return 'default';
            case 'expense': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
                        <p className="text-gray-600 mt-1">Manage your accounting ledgers</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Ledger
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Ledger</DialogTitle>
                                <DialogDescription>
                                    Add a new ledger account to your chart of accounts
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Ledger Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Cash, Bank Account, Sales Revenue..."
                                        {...register('name')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="type">Account Type</Label>
                                    <Select onValueChange={(value) => setValue('type', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asset">Asset</SelectItem>
                                            <SelectItem value="liability">Liability</SelectItem>
                                            <SelectItem value="equity">Equity</SelectItem>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="group">Group</Label>
                                    <Input
                                        id="group"
                                        placeholder="Current Assets, Fixed Assets, Revenue..."
                                        {...register('group')}
                                        className={errors.group ? 'border-red-500' : ''}
                                    />
                                    {errors.group && (
                                        <p className="text-sm text-red-500 mt-1">{errors.group.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="openingBalance">Opening Balance</Label>
                                    <Input
                                        id="openingBalance"
                                        type="number"
                                        step="0.01"
                                        {...register('openingBalance', { valueAsNumber: true })}
                                        className={errors.openingBalance ? 'border-red-500' : ''}
                                    />
                                    {errors.openingBalance && (
                                        <p className="text-sm text-red-500 mt-1">{errors.openingBalance.message}</p>
                                    )}
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
                                        {isSubmitting ? 'Creating...' : 'Create Ledger'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ledger Accounts</CardTitle>
                        <CardDescription>
                            All accounting ledgers in your chart of accounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading ledgers...</div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Group</TableHead>
                                            <TableHead>Opening Balance</TableHead>
                                            <TableHead>Current Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgers.map((ledger) => (
                                            <TableRow key={ledger._id}>
                                                <TableCell className="font-medium">{ledger.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getTypeColor(ledger.type) as any}>
                                                        {ledger.type.charAt(0).toUpperCase() + ledger.type.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{ledger.group}</TableCell>
                                                <TableCell>${ledger.openingBalance.toFixed(2)}</TableCell>
                                                <TableCell className="font-semibold">
                                                    ${ledger.currentBalance.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {ledgers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No ledgers found</p>
                                        <p className="text-sm mt-1">Create your first ledger to get started</p>
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

export default LedgersPage