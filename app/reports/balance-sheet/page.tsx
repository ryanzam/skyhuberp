'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface BalanceSheetItem {
    name: string;
    group: string;
    balance: number;
}

interface BalanceSheet {
    asOfDate: string;
    assets: {
        items: BalanceSheetItem[];
        total: number;
    };
    liabilities: {
        items: BalanceSheetItem[];
        total: number;
    };
    equity: {
        items: BalanceSheetItem[];
        total: number;
    };
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
}

const BalanceSheetPage = () => {

    const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchBalanceSheet();
    }, []);

    const fetchBalanceSheet = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ asOfDate });
            const response = await fetch(`/api/reports/balance-sheet?${params}`);

            if (response.ok) {
                const data = await response.json();
                setBalanceSheet(data);
            } else {
                toast.error('Failed to fetch balance sheet');
            }
        } catch (error) {
            toast.error('Failed to fetch balance sheet');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newDate: string) => {
        setAsOfDate(newDate);
    };

    const generateReport = () => {
        fetchBalanceSheet();
    };

    const exportToPDF = () => {
        // integrate with a PDF generation library later
        toast.info('PDF export functionality would be implemented here');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const groupItemsByGroup = (items: BalanceSheetItem[]) => {
        const grouped: { [key: string]: BalanceSheetItem[] } = {};
        items.forEach(item => {
            if (!grouped[item.group]) {
                grouped[item.group] = [];
            }
            grouped[item.group].push(item);
        });
        return grouped;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Generating balance sheet...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
                        <p className="text-gray-600 mt-1">Financial position statement</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" onClick={exportToPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Parameters</CardTitle>
                        <CardDescription>
                            Configure the balance sheet parameters
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end space-x-4">
                            <div>
                                <Label htmlFor="asOfDate">As of Date</Label>
                                <Input
                                    id="asOfDate"
                                    type="date"
                                    value={asOfDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                />
                            </div>
                            <Button onClick={generateReport}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {balanceSheet && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Assets */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Assets</CardTitle>
                                <CardDescription>
                                    As of {new Date(balanceSheet.asOfDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(groupItemsByGroup(balanceSheet.assets.items)).map(([group, items]) => (
                                        <div key={group}>
                                            <h4 className="font-semibold text-gray-900 mb-2">{group}</h4>
                                            <div className="space-y-1 ml-4">
                                                {items.map((item, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span>{item.name}</span>
                                                        <span>{formatCurrency(item.balance)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 mt-4">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total Assets</span>
                                            <span>{formatCurrency(balanceSheet.assets.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Liabilities & Equity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Liabilities & Equity</CardTitle>
                                <CardDescription>
                                    As of {new Date(balanceSheet.asOfDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Liabilities */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Liabilities</h3>
                                        {balanceSheet.liabilities.items.length > 0 ? (
                                            <div className="space-y-4">
                                                {Object.entries(groupItemsByGroup(balanceSheet.liabilities.items)).map(([group, items]) => (
                                                    <div key={group}>
                                                        <h4 className="font-medium text-gray-800 mb-2">{group}</h4>
                                                        <div className="space-y-1 ml-4">
                                                            {items.map((item, index) => (
                                                                <div key={index} className="flex justify-between text-sm">
                                                                    <span>{item.name}</span>
                                                                    <span>{formatCurrency(item.balance)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="border-t pt-2">
                                                    <div className="flex justify-between font-semibold">
                                                        <span>Total Liabilities</span>
                                                        <span>{formatCurrency(balanceSheet.liabilities.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm ml-4">No liabilities</p>
                                        )}
                                    </div>

                                    {/* Equity */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Equity</h3>
                                        {balanceSheet.equity.items.length > 0 ? (
                                            <div className="space-y-4">
                                                {Object.entries(groupItemsByGroup(balanceSheet.equity.items)).map(([group, items]) => (
                                                    <div key={group}>
                                                        <h4 className="font-medium text-gray-800 mb-2">{group}</h4>
                                                        <div className="space-y-1 ml-4">
                                                            {items.map((item, index) => (
                                                                <div key={index} className="flex justify-between text-sm">
                                                                    <span>{item.name}</span>
                                                                    <span>{formatCurrency(item.balance)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="border-t pt-2">
                                                    <div className="flex justify-between font-semibold">
                                                        <span>Total Equity</span>
                                                        <span>{formatCurrency(balanceSheet.equity.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm ml-4">No equity accounts</p>
                                        )}
                                    </div>

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total Liabilities & Equity</span>
                                            <span>{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {balanceSheet && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-center space-x-4">
                                <Badge variant={balanceSheet.isBalanced ? "default" : "destructive"}>
                                    {balanceSheet.isBalanced ? "Balanced" : "Not Balanced"}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                    Assets: {formatCurrency(balanceSheet.assets.total)} |
                                    Liabilities & Equity: {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                                </span>
                            </div>
                            {!balanceSheet.isBalanced && (
                                <p className="text-center text-sm text-red-600 mt-2">
                                    The balance sheet is not balanced. Please review your ledger entries.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!balanceSheet && !loading && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">No balance sheet data available</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Create some ledgers and transactions to generate a balance sheet
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}

export default BalanceSheetPage