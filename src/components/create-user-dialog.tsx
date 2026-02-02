'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import api, { API_BASE_URL, uploadImage } from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/user-avatar';

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface Space {
    id: string;
    name: string;
    type: string;
    residentProfileId: string | null;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RESIDENT' as 'ADMIN' | 'RESIDENT' | 'SECURITY',
        isActive: true,
        idNumber: '',
        phone: '',
        dateOfBirth: '',
        unitNumber: '',
        assignedSpaceIds: [] as string[],
        profileImage: '',
    });

    const [spaces, setSpaces] = useState<Space[]>([]);

    useEffect(() => {
        if (open) {
            fetchSpaces();
        }
    }, [open]);

    const fetchSpaces = async () => {
        try {
            const response = await api.get(`/spaces`);
            setSpaces(response.data);
        } catch (error) {
            console.error('Error fetching spaces:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/users`, formData);
            toast.success('User created', {
                description: `${formData.name} has been successfully created.`,
            });
            onSuccess();
            onOpenChange(false);
            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'RESIDENT',
                isActive: true,
                idNumber: '',
                phone: '',
                dateOfBirth: '',
                unitNumber: '',
                assignedSpaceIds: [],
                profileImage: '',
            });
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.message || 'Failed to create user',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-slate-100 mb-6">
                    <DialogTitle className="text-2xl font-black text-slate-800 ">Create New User</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Add a new user to the system. They will be able to login with these credentials.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center justify-center gap-4 mb-8">
                        <div className="relative group">
                            <div className="size-24 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center shadow-lg">
                                <UserAvatar
                                    src={formData.profileImage}
                                    name={formData.name}
                                    role={formData.role}
                                    iconSize={40}
                                />
                                <div
                                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => document.getElementById('profile-upload')?.click()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="profile-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            const url = await uploadImage(file);
                                            setFormData({ ...formData, profileImage: url });
                                        } catch (error) {
                                            toast.error('Failed to upload image');
                                        }
                                    }
                                }}
                            />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Profile Image</span>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-100"></span> Personal Information <span className="flex-1 h-px bg-slate-100"></span>
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-600 font-bold ml-1">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="idNumber" className="text-slate-600 font-bold ml-1">ID Number</Label>
                                <Input
                                    id="idNumber"
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    placeholder="1-1234-5678"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-slate-600 font-bold ml-1">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="8888-8888"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dob" className="text-slate-600 font-bold ml-1">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-100"></span> Account Details <span className="flex-1 h-px bg-slate-100"></span>
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-600 font-bold ml-1">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                required
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-600 font-bold ml-1">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Min. 6 characters"
                                minLength={6}
                                required
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role" className="text-slate-600 font-bold ml-1">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="RESIDENT">Resident</SelectItem>
                                    <SelectItem value="SECURITY">Security Guard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.role === 'RESIDENT' && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-100"></span> Residency <span className="flex-1 h-px bg-slate-100"></span>
                            </h3>

                            <div className="grid gap-2">
                                <Label htmlFor="unitNumber" className="text-slate-600 font-bold ml-1">Unit Number</Label>
                                <Input
                                    id="unitNumber"
                                    value={formData.unitNumber}
                                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                    placeholder="e.g. A-101"
                                    required={formData.role === 'RESIDENT'}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-slate-600 font-bold ml-1">Assign Parking Spots</Label>
                                <div className="grid grid-cols-2 gap-2 p-1">
                                    {spaces
                                        .filter((s) => s.type === 'PARKING' && !s.residentProfileId)
                                        .map((space) => (
                                            <div
                                                key={space.id}
                                                onClick={() => {
                                                    const isSelected = formData.assignedSpaceIds.includes(space.id);
                                                    if (!isSelected) {
                                                        setFormData({ ...formData, assignedSpaceIds: [...formData.assignedSpaceIds, space.id] });
                                                    } else {
                                                        setFormData({ ...formData, assignedSpaceIds: formData.assignedSpaceIds.filter((id) => id !== space.id) });
                                                    }
                                                }}
                                                className={`cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all duration-200 ${formData.assignedSpaceIds.includes(space.id)
                                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                                                    : 'bg-white border-slate-200 hover:border-indigo-300'
                                                    }`}
                                            >
                                                <Checkbox
                                                    id={`space-${space.id}`}
                                                    checked={formData.assignedSpaceIds.includes(space.id)}
                                                    onCheckedChange={() => { }} // Handled by div click
                                                />
                                                <span className={`text-sm font-bold ${formData.assignedSpaceIds.includes(space.id) ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                    {space.name}
                                                </span>
                                            </div>
                                        ))}
                                    {spaces.filter((s) => s.type === 'PARKING' && !s.residentProfileId).length === 0 && (
                                        <p className="col-span-2 text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
                                            No available spots
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 ">
                        <div className="flex flex-col gap-0.5">
                            <Label htmlFor="active" className="text-base font-bold text-slate-700 ">Active Account</Label>
                            <span className="text-xs text-slate-500 font-medium">Allow user to log in</span>
                        </div>
                        <Switch
                            id="active"
                            checked={formData.isActive}
                            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                        />
                    </div>

                    <DialogFooter className="pt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11">
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} className="rounded-xl h-11 px-8 bg-indigo-600 hover:bg-indigo-700">
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}