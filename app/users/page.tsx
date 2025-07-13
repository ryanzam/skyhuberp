'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User } from '@/shared';

const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['admin', 'accountant', 'inventory_manager', 'user'])
});

type UserForm = z.infer<typeof userSchema>;

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'user'
        }
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: UserForm) => {
        try {
            const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            // Remove password if editing and it's empty
            if (editingUser && !data.password) {
                delete data.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
                setIsDialogOpen(false);
                setEditingUser(null);
                reset();
                fetchUsers();
            } else {
                const error = await response.json();
                toast.error(error.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
            }
        } catch (error) {
            toast.error(`Failed to ${editingUser ? 'update' : 'create'} user`);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setValue('name', user.name);
        setValue('email', user.email);
        setValue('role', user.role as any);
        setValue('password', ''); // Clear password field for editing
        setIsDialogOpen(true);
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/users/${userId}/toggle-status`, {
                method: 'PATCH',
            });

            if (response.ok) {
                toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                fetchUsers();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update user status');
            }
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('User deleted successfully');
                fetchUsers();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to delete user');
            }
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingUser(null);
        reset();
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'accountant': return 'default';
            case 'inventory_manager': return 'secondary';
            case 'user': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">Manage system users and permissions</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingUser ? 'Edit User' : 'Create New User'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingUser ? 'Update user details and permissions' : 'Add a new user to the system'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        {...register('name')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        {...register('email')}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">
                                        Password {editingUser && '(leave blank to keep current)'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                                        {...register('password')}
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select onValueChange={(value) => setValue('role', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="accountant">Accountant</SelectItem>
                                            <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDialogClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Users</CardTitle>
                        <CardDescription>
                            Manage user accounts and access permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading users...</div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleColor(user.role) as any}>
                                                        {user.role.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.isActive ? "default" : "secondary"}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                        >
                                                            {user.isActive ? (
                                                                <UserX className="h-4 w-4" />
                                                            ) : (
                                                                <UserCheck className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(user._id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {users.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No users found</p>
                                        <p className="text-sm mt-1">Add your first user to get started</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>)
}

export default UsersPage