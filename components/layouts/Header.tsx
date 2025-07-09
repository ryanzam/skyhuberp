import React from 'react'
import { Button } from '../ui/button'
import { Bell, Menu, Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const Header = () => {

    const session = { user: { name: "John Doe", companyName: "Google", image: "https://github.com/shadcn.png" } }

    return (
        <header className="h-16 bg-white border-b shadow-sm">
            <div className="flex items-center justify-end h-full px-4">
                <div className="flex items-center space-x-4 mr-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-10 w-64 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                        <Bell className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {session?.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {session?.user?.companyName || 'Company'}
                            </p>
                        </div>
                        <Avatar>
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback>
                                {session?.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header