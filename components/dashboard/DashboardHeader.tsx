import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { BarChart3 } from 'lucide-react'

const DashboardHeader = ({ session }: any) => {

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, {session?.user?.name || 'User'}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                        {session?.user?.companyName || 'Company'}
                    </Badge>
                    <Button>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Reports
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader