'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ProfitLoss, ProfitLossItem } from '@/shared';

const PLPage = () => {
    const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchProfitLoss();
    }, []);

    const fetchProfitLoss = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ startDate, endDate });
            const response = await fetch(`/api/reports/profit-loss?${params}`);

            if (response.ok) {
                const data = await response.json();
                setProfitLoss(data);
            } else {
                toast.error('Failed to fetch profit & loss statement');
            }
        } catch (error) {
            toast.error('Failed to fetch profit & loss statement');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        fetchProfitLoss();
    };

    const exportToPDF = () => {
        toast.info('PDF export functionality would be implemented here');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const groupItemsByGroup = (items: ProfitLossItem[]) => {
        const grouped: { [key: string]: ProfitLossItem[] } = {};
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
                        <p>Generating profit & loss statement...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Profit & Loss Statement</h1>
                        <p className="text-gray-600 mt-1">Income and expense summary</p>
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
                            Configure the profit & loss statement parameters
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end space-x-4">
                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <Button onClick={generateReport}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {profitLoss && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Income */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-green-700">Income</CardTitle>
                                <CardDescription>
                                    {new Date(profitLoss.period.startDate).toLocaleDateString()} - {new Date(profitLoss.period.endDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(groupItemsByGroup(profitLoss.income.items)).map(([group, items]) => (
                                        <div key={group}>
                                            <h4 className="font-semibold text-gray-900 mb-2">{group}</h4>
                                            <div className="space-y-1 ml-4">
                                                {items.map((item, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span>{item.name}</span>
                                                        <span className="text-green-600">{formatCurrency(item.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 mt-4">
                                        <div className="flex justify-between font-bold text-lg text-green-700">
                                            <span>Total Income</span>
                                            <span>{formatCurrency(profitLoss.income.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expenses */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl text-red-700">Expenses</CardTitle>
                                <CardDescription>
                                    {new Date(profitLoss.period.startDate).toLocaleDateString()} - {new Date(profitLoss.period.endDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(groupItemsByGroup(profitLoss.expenses.items)).map(([group, items]) => (
                                        <div key={group}>
                                            <h4 className="font-semibold text-gray-900 mb-2">{group}</h4>
                                            <div className="space-y-1 ml-4">
                                                {items.map((item, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span>{item.name}</span>
                                                        <span className="text-red-600">{formatCurrency(item.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 mt-4">
                                        <div className="flex justify-between font-bold text-lg text-red-700">
                                            <span>Total Expenses</span>
                                            <span>{formatCurrency(profitLoss.expenses.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {profitLoss && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center items-center space-x-4">
                                    <Badge variant={profitLoss.netProfit >= 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
                                        {profitLoss.netProfit >= 0 ? "Profit" : "Loss"}
                                    </Badge>
                                    <span className={`text-2xl font-bold ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(Math.abs(profitLoss.netProfit))}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span>Profit Margin: </span>
                                    <span className={profitLoss.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {profitLoss.profitMargin.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!profitLoss && !loading && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">No profit & loss data available</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Create some income and expense transactions to generate a P&L statement
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PLPage