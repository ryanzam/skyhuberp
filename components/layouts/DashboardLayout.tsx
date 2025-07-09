import Sidebar from './Sidebar'
import Header from './Header'
import { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='h-screen flex'>
                <Sidebar />
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 overflow-y-auto p-6'>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout