"use client"

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import Recent from '@/components/dashboard/Recent';
import StatsCard from '@/components/dashboard/StatsCard';
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStats, StatCard } from '@/types';
import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'

const DashboardPage = () => {

    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetchStats();
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/stats');

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }

            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }

    const statCards: StatCard[] = [
        {
            title: 'Total Revenue',
            value: stats?.totalRevenue || 0,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            prefix: '$'
        },
        {
            title: 'Total Expenses',
            value: stats?.totalExpenses || 0,
            icon: TrendingUp,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            prefix: '$'
        },
        {
            title: 'Stock Items',
            value: stats?.totalStock || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button>
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardHeader session={session} />

            <StatsCard statCards={statCards} />

            <Recent stats={stats} />

            <QuickActions />
        </DashboardLayout>
    )
}

export default DashboardPage