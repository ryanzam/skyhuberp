'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2, User, Shield, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Company } from '@/shared';

const companySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email address'),
    taxId: z.string().min(1, 'Tax ID is required'),
    currency: z.string().min(1, 'Currency is required'),
    financialYearStart: z.string().min(1, 'Financial year start is required'),
    financialYearEnd: z.string().min(1, 'Financial year end is required')
});

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
    confirmPassword: z.string().optional()
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type CompanyForm = z.infer<typeof companySchema>;
type ProfileForm = z.infer<typeof profileSchema>;

const SettingsPage = () => {
    const { data: session } = useSession();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    const companyForm = useForm<CompanyForm>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: '',
            address: '',
            phone: '',
            email: '',
            taxId: '',
            currency: 'USD',
            financialYearStart: '',
            financialYearEnd: ''
        }
    });

    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    useEffect(() => {
        fetchCompanySettings();
    }, []);

    useEffect(() => {
        if (session?.user) {
            profileForm.setValue('name', session.user.name || '');
            profileForm.setValue('email', session.user.email || '');
        }
    }, [session, profileForm]);

    const fetchCompanySettings = async () => {
        try {
            const response = await fetch('/api/company');
            if (response.ok) {
                const data = await response.json();
                setCompany(data);

                // Populate form
                companyForm.setValue('name', data.name);
                companyForm.setValue('address', data.address);
                companyForm.setValue('phone', data.phone);
                companyForm.setValue('email', data.email);
                companyForm.setValue('taxId', data.taxId);
                companyForm.setValue('currency', data.currency);
                companyForm.setValue('financialYearStart', data.financialYear.startDate.split('T')[0]);
                companyForm.setValue('financialYearEnd', data.financialYear.endDate.split('T')[0]);
            }
        } catch (error) {
            toast.error('Failed to fetch company settings');
        } finally {
            setLoading(false);
        }
    };

    const onCompanySubmit = async (data: CompanyForm) => {
        try {
            const response = await fetch('/api/company', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    financialYear: {
                        startDate: data.financialYearStart,
                        endDate: data.financialYearEnd
                    }
                }),
            });

            if (response.ok) {
                toast.success('Company settings updated successfully');
                fetchCompanySettings();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update company settings');
            }
        } catch (error) {
            toast.error('Failed to update company settings');
        }
    };

    const onProfileSubmit = async (data: ProfileForm) => {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Profile updated successfully');
                profileForm.setValue('currentPassword', '');
                profileForm.setValue('newPassword', '');
                profileForm.setValue('confirmPassword', '');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Loading settings...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-gray-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your system preferences</p>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-6">

                    <Tabs defaultValue="company" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="company" className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4" />
                                <span>Company</span>
                            </TabsTrigger>
                            <TabsTrigger value="profile" className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Security</span>
                            </TabsTrigger>
                            <TabsTrigger value="system" className="flex items-center space-x-2">
                                <Database className="h-4 w-4" />
                                <span>System</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="company">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Information</CardTitle>
                                    <CardDescription>
                                        Update your company details and financial year settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Company Name</Label>
                                                <Input
                                                    id="name"
                                                    {...companyForm.register('name')}
                                                    className={companyForm.formState.errors.name ? 'border-red-500' : ''}
                                                />
                                                {companyForm.formState.errors.name && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {companyForm.formState.errors.name.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="taxId">Tax ID</Label>
                                                <Input
                                                    id="taxId"
                                                    {...companyForm.register('taxId')}
                                                    className={companyForm.formState.errors.taxId ? 'border-red-500' : ''}
                                                />
                                                {companyForm.formState.errors.taxId && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {companyForm.formState.errors.taxId.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                {...companyForm.register('address')}
                                                className={companyForm.formState.errors.address ? 'border-red-500' : ''}
                                            />
                                            {companyForm.formState.errors.address && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {companyForm.formState.errors.address.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    {...companyForm.register('phone')}
                                                    className={companyForm.formState.errors.phone ? 'border-red-500' : ''}
                                                />
                                                {companyForm.formState.errors.phone && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {companyForm.formState.errors.phone.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...companyForm.register('email')}
                                                    className={companyForm.formState.errors.email ? 'border-red-500' : ''}
                                                />
                                                {companyForm.formState.errors.email && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {companyForm.formState.errors.email.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="currency">Currency</Label>
                                                <Select onValueChange={(value) => companyForm.setValue('currency', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="financialYearStart">Financial Year Start</Label>
                                                <Input
                                                    id="financialYearStart"
                                                    type="date"
                                                    {...companyForm.register('financialYearStart')}
                                                    className={companyForm.formState.errors.financialYearStart ? 'border-red-500' : ''}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="financialYearEnd">Financial Year End</Label>
                                                <Input
                                                    id="financialYearEnd"
                                                    type="date"
                                                    {...companyForm.register('financialYearEnd')}
                                                    className={companyForm.formState.errors.financialYearEnd ? 'border-red-500' : ''}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={companyForm.formState.isSubmitting}>
                                                {companyForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Settings</CardTitle>
                                    <CardDescription>
                                        Update your personal information and password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="profileName">Full Name</Label>
                                                <Input
                                                    id="profileName"
                                                    {...profileForm.register('name')}
                                                    className={profileForm.formState.errors.name ? 'border-red-500' : ''}
                                                />
                                                {profileForm.formState.errors.name && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {profileForm.formState.errors.name.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="profileEmail">Email Address</Label>
                                                <Input
                                                    id="profileEmail"
                                                    type="email"
                                                    {...profileForm.register('email')}
                                                    className={profileForm.formState.errors.email ? 'border-red-500' : ''}
                                                />
                                                {profileForm.formState.errors.email && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {profileForm.formState.errors.email.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h3 className="text-lg font-medium mb-4">Change Password</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="currentPassword">Current Password</Label>
                                                    <Input
                                                        id="currentPassword"
                                                        type="password"
                                                        {...profileForm.register('currentPassword')}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="newPassword">New Password</Label>
                                                    <Input
                                                        id="newPassword"
                                                        type="password"
                                                        {...profileForm.register('newPassword')}
                                                        className={profileForm.formState.errors.newPassword ? 'border-red-500' : ''}
                                                    />
                                                    {profileForm.formState.errors.newPassword && (
                                                        <p className="text-sm text-red-500 mt-1">
                                                            {profileForm.formState.errors.newPassword.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        {...profileForm.register('confirmPassword')}
                                                        className={profileForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
                                                    />
                                                    {profileForm.formState.errors.confirmPassword && (
                                                        <p className="text-sm text-red-500 mt-1">
                                                            {profileForm.formState.errors.confirmPassword.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                                {profileForm.formState.isSubmitting ? 'Saving...' : 'Update Profile'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>
                                        Manage security preferences and access controls
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Two-Factor Authentication</h4>
                                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                            </div>
                                            <Button variant="outline">Enable 2FA</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Session Management</h4>
                                                <p className="text-sm text-gray-600">View and manage active sessions</p>
                                            </div>
                                            <Button variant="outline">Manage Sessions</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Login Notifications</h4>
                                                <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                                            </div>
                                            <Button variant="outline">Configure</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="system">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Settings</CardTitle>
                                    <CardDescription>
                                        Configure system-wide preferences and maintenance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Database Backup</h4>
                                                <p className="text-sm text-gray-600">Create and manage database backups</p>
                                            </div>
                                            <Button variant="outline">Create Backup</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Data Export</h4>
                                                <p className="text-sm text-gray-600">Export your data in various formats</p>
                                            </div>
                                            <Button variant="outline">Export Data</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">System Logs</h4>
                                                <p className="text-sm text-gray-600">View system activity and error logs</p>
                                            </div>
                                            <Button variant="outline">View Logs</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Cache Management</h4>
                                                <p className="text-sm text-gray-600">Clear system cache to improve performance</p>
                                            </div>
                                            <Button variant="outline">Clear Cache</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default SettingsPage