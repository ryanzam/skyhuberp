"use client"

import { cn } from '@/lib/utils'
import { BarChart3, Building2, ChevronDown, ChevronRight, FileText, Home, LogOut, Package, Settings, ShoppingCart, Tally5, Users, X } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useStore } from '@/lib/store';

const menuItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home
    },
    {
        title: 'Accounting',
        icon: BarChart3,
        children: [
            { title: 'Ledgers', href: '/accounting/ledgers' },
            { title: 'Transactions', href: '/accounting/transactions' },
            { title: 'Journal Entries', href: '/accounting/journal' }
        ]
    },
    {
        title: 'Inventory',
        icon: Package,
        children: [
            { title: 'Stock Items', href: '/inventory/stock' },
            { title: 'Categories', href: '/inventory/categories' },
            { title: 'Stock Movements', href: '/inventory/movements' }
        ]
    },
    {
        title: 'Orders',
        icon: ShoppingCart,
        children: [
            { title: 'Sales Orders', href: '/orders/sales' },
            { title: 'Purchase Orders', href: '/orders/purchase' },
            { title: 'Invoices', href: '/orders/invoices' }
        ]
    },
    {
        title: 'Reports',
        icon: FileText,
        children: [
            { title: 'Balance Sheet', href: '/reports/balance-sheet' },
            { title: 'P&L Statement', href: '/reports/profit-loss' },
            { title: 'Trial Balance', href: '/reports/trial-balance' },
            { title: 'Stock Reports', href: '/reports/stock' }
        ]
    },
    {
        title: 'Company',
        href: '/company',
        icon: Building2
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings
    }
];

const Sidebar = () => {

    const [expandedItems, setExpandedItems] = useState<string[]>(['Accounting']);
    const pathname = usePathname();
    const { sidebarOpen, setSidebarOpen } = useStore();

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-16 px-4 border-b">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <Tally5 className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">SkyhubERP</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <nav className='flex-1 px-2 py-4 space-y-2 overflow-y-auto'>
                    {menuItems.map((item) => (
                        <div key={item.title}>
                            {item.children ? (
                                <div>
                                    <button
                                        onClick={() => toggleExpanded(item.title)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                            "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="h-5 w-5 mr-3" />
                                            {item.title}
                                        </div>
                                        {expandedItems.includes(item.title) ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>

                                    {expandedItems.includes(item.title) && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "block px-3 py-2 text-sm rounded-lg transition-colors",
                                                        isActive(child.href)
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    )}
                                                >
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                        isActive(item.href)
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.title}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </Button>
                </div>
            </div >
        </>
    )
}

export default Sidebar