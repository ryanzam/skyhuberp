import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { DashboardStats } from '@/types'
import { BarChart3, Package } from 'lucide-react'
import { Badge } from '../ui/badge'

interface RecentProps {
    stats: DashboardStats | null
}

const Recent = ({ stats }: RecentProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        Latest financial activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.recentTransactions?.length ? (
                            stats.recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {transaction.description}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            ${transaction.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No recent transactions</p>
                                <p className="text-sm mt-1">Create your first transaction to get started</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Alert</CardTitle>
                    <CardDescription>
                        Items running low on stock
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.lowStockItems?.length ? (
                            stats.lowStockItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Code: {item.code}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="destructive">
                                            {item.quantity} {item.unit}
                                        </Badge>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Min: {item.minStock}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>All stock levels are good</p>
                                <p className="text-sm mt-1">No items below minimum stock level</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

    )
}

export default Recent