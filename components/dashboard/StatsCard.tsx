import React from 'react'
import { Card, CardContent } from '../ui/card'
import { StatCard } from '@/types'

interface StatsCardProps {
    statCards: Array<StatCard>
}

const StatsCard = ({ statCards }: StatsCardProps) => {
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-3">
            {statCards.map((stat) => (
                <Card key={stat.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stat.prefix || ''}{typeof stat.value === 'number'
                                        ? stat.value.toLocaleString()
                                        : stat.value
                                    }
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default StatsCard