"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { BarChart3, DollarSign, Package, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

const QuickActions = () => {

    const router = useRouter();

    return (
        <div className='my-5'>
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Frequently used features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button onClick={() => router.push("/accounting/transactions")} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200">
                            <DollarSign className="h-6 w-6" />
                            <span>Add Transaction</span>
                        </Button>
                        <Button onClick={() => router.push("/inventory/stock")} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200">
                            <Package className="h-6 w-6" />
                            <span>Add Stock</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200">
                            <ShoppingCart className="h-6 w-6" />
                            <span>Create Order</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-200">
                            <BarChart3 className="h-6 w-6" />
                            <span>View Reports</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default QuickActions