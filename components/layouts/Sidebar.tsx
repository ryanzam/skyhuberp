import { cn } from '@/lib/utils'
import React from 'react'

const Sidebar = () => {
    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
        )}> Sidebar</div >
    )
}

export default Sidebar