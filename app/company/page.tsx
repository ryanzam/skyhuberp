'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Phone, Mail, FileText, Calendar } from 'lucide-react';
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
    currency: z.string().min(3, 'Currency is required'),
    financialYearStart: z.string().min(1, 'Financial year start is required'),
    financialYearEnd: z.string().min(1, 'Financial year end is required')
});

type CompanyForm = z.infer<typeof companySchema>;

const CompanyPage = () => {
    const { data: session } = useSession();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CompanyForm>({
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

    useEffect(() => {
        fetchCompanyDetails();
    }, []);

    const fetchCompanyDetails = async () => {
        try {
            const response = await fetch('/api/company');
            if (response.ok) {
                const data = await response.json();
                setCompany(data);

                // Populate form
                setValue('name', data.name);
                setValue('address', data.address);
                setValue('phone', data.phone);
                setValue('email', data.email);
                setValue('taxId', data.taxId);
                setValue('currency', data.currency);
                setValue('financialYearStart', data.financialYear.startDate.split('T')[0]);
                setValue('financialYearEnd', data.financialYear.endDate.split('T')[0]);
            }
        } catch (error) {
            toast.error('Failed to fetch company details');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CompanyForm) => {
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
                toast.success('Company details updated successfully');
                fetchCompanyDetails();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update company details');
            }
        } catch (error) {
            toast.error('Failed to update company details');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Loading company details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <Building2 className="h-8 w-8 text-gray-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
                        <p className="text-gray-600 mt-1">Manage your company information and settings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Company Overview */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Overview</CardTitle>
                                <CardDescription>
                                    Quick overview of your company details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {company && (
                                    <>
                                        <div className="flex items-center space-x-3">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{company.name}</p>
                                                <p className="text-sm text-gray-500">Company Name</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{company.address}</p>
                                                <p className="text-sm text-gray-500">Address</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{company.phone}</p>
                                                <p className="text-sm text-gray-500">Phone</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{company.email}</p>
                                                <p className="text-sm text-gray-500">Email</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{company.taxId}</p>
                                                <p className="text-sm text-gray-500">Tax ID</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(company.financialYear.startDate).toLocaleDateString()} - {new Date(company.financialYear.endDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-500">Financial Year</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Company Details Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                                <CardDescription>
                                    Update your company details and financial year settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Company Name</Label>
                                            <Input
                                                id="name"
                                                {...register('name')}
                                                className={errors.name ? 'border-red-500' : ''}
                                                disabled={session?.user?.role !== 'admin'}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="taxId">Tax ID</Label>
                                            <Input
                                                id="taxId"
                                                {...register('taxId')}
                                                className={errors.taxId ? 'border-red-500' : ''}
                                                disabled={session?.user?.role !== 'admin'}
                                            />
                                            {errors.taxId && (
                                                <p className="text-sm text-red-500 mt-1">{errors.taxId.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            {...register('address')}
                                            className={errors.address ? 'border-red-500' : ''}
                                            disabled={session?.user?.role !== 'admin'}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                {...register('phone')}
                                                className={errors.phone ? 'border-red-500' : ''}
                                                disabled={session?.user?.role !== 'admin'}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register('email')}
                                                className={errors.email ? 'border-red-500' : ''}
                                                disabled={session?.user?.role !== 'admin'}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select
                                                onValueChange={(value) => setValue('currency', value)}
                                                disabled={session?.user?.role !== 'admin'}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="financialYearStart">Financial Year Start</Label>
                                            <Input
                                                id="financialYearStart"
                                                type="date"
                                                {...register('financialYearStart')}
                                                className={errors.financialYearStart ? 'border-red-500' : ''}
                                                disabled={session?.user?.role !== 'admin'}
                                            />
                                            {errors.financialYearStart && (
                                                <p className="text-sm text-red-500 mt-1">{errors.financialYearStart.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="financialYearEnd">Financial Year End</Label>
                                            <Input
                                                id="financialYearEnd"
                                                type="date"
                                                {...register('financialYearEnd')}
                                                className={errors.financialYearEnd ? 'border-red-500' : ''}
                                                disabled={session?.user?.role !== 'admin'}
                                            />
                                            {errors.financialYearEnd && (
                                                <p className="text-sm text-red-500 mt-1">{errors.financialYearEnd.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {session?.user?.role === 'admin' && (
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    )}

                                    {session?.user?.role !== 'admin' && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-sm text-yellow-800">
                                                Only administrators can modify company settings. Contact your system administrator to make changes.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Created:</span>
                                    <span className="text-sm font-medium">
                                        {company ? new Date(company.createdAt).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Last Updated:</span>
                                    <span className="text-sm font-medium">
                                        {company ? new Date(company.updatedAt).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Currency:</span>
                                    <span className="text-sm font-medium">
                                        {company?.currency || 'USD'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export Company Data
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Generate Report
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Financial Calendar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contact Support
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Documentation
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Schedule Call
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CompanyPage