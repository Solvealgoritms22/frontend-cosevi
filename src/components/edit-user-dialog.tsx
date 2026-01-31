'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import api, { uploadImage, API_BASE_URL } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'RESIDENT' | 'SECURITY';
    isActive: boolean;
    idNumber?: string;
    phone?: string;
    profileImage?: string;
    dateOfBirth?: string;
    residentProfile?: {
        id: string;
        unitNumber: string;
        assignedSpaces?: Space[];
    };
}

interface Space {
    id: string;
    name: string;
    type: string;
    residentProfileId: string | null;
}

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    onSuccess: () => void;
}

// Separate components to isolate renders
const RoleSection = memo(({ role, onRoleChange }: { role: string, onRoleChange: (val: string) => void }) => (
    <div className="grid gap-2">
        <Label htmlFor="edit-role" className="text-slate-600 dark:text-slate-400 font-bold">Role</Label>
        <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="RESIDENT">Resident</SelectItem>
                <SelectItem value="SECURITY">Security Guard</SelectItem>
            </SelectContent>
        </Select>
    </div>
));
RoleSection.displayName = 'RoleSection';

const ParkingSection = memo(({ spaces, selectedIds, currentResidentId, onToggle }: {
    spaces: Space[],
    selectedIds: string[],
    currentResidentId?: string,
    onToggle: (id: string) => void
}) => (
    <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
            Residency
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></span>
        </h3>
        <div className="grid gap-2">
            <Label className="text-slate-600 dark:text-slate-400 font-bold">Assigned Parking Spots</Label>
            <div className="grid grid-cols-2 gap-2 p-1">
                {spaces
                    .filter(s => s.type === 'PARKING' && (!s.residentProfileId || s.residentProfileId === currentResidentId))
                    .map(space => {
                        const isSelected = selectedIds.includes(space.id);
                        const isCurrentlyAssigned = space.residentProfileId === currentResidentId;
                        return (
                            <div
                                key={space.id}
                                onClick={() => onToggle(space.id)}
                                className={`
                                    cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all duration-200 relative
                                    ${isSelected
                                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 ring-1 ring-indigo-500/20'
                                        : 'bg-white border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}
                                `}
                            >
                                <Checkbox
                                    id={`edit-space-${space.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => { }}
                                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                />
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {space.name}
                                    </span>
                                    {isCurrentlyAssigned && <span className="text-[10px] text-emerald-500 font-bold">Current</span>}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    </div>
));
ParkingSection.displayName = 'ParkingSection';

const ActiveAccountSection = memo(({ isActive, onToggle }: {
    isActive: boolean,
    onToggle: (checked: boolean) => void
}) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-0.5">
            <Label htmlFor="edit-active" className="text-base font-bold text-slate-700 dark:text-slate-200">Active Account</Label>
            <span className="text-xs text-slate-500">Allow user to log in</span>
        </div>
        <Switch
            id="edit-active"
            checked={isActive}
            onCheckedChange={onToggle}
        />
    </div>
));
ActiveAccountSection.displayName = 'ActiveAccountSection';

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        password: '',
        idNumber: user.idNumber || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        unitNumber: user.residentProfile?.unitNumber || '',
        assignedSpaceIds: user.residentProfile?.assignedSpaces?.map(s => s.id) || [] as string[],
        profileImage: user.profileImage || '',
    });
    const [spaces, setSpaces] = useState<Space[]>([]);

    useEffect(() => {
        if (open) {
            const fetchSpaces = async () => {
                try {
                    const response = await api.get(`/spaces`);
                    setSpaces(response.data);
                } catch (error) {
                    console.error('Error fetching spaces:', error);
                }
            };
            fetchSpaces();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            setFormData({
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                password: '',
                idNumber: user.idNumber || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                unitNumber: user.residentProfile?.unitNumber || '',
                assignedSpaceIds: user.residentProfile?.assignedSpaces?.map(s => s.id) || [],
                profileImage: user.profileImage || '',
            });
        }
    }, [user.id, open]);

    const handleToggleSpace = useCallback((spaceId: string) => {
        setFormData(prev => {
            const isSelected = prev.assignedSpaceIds.includes(spaceId);
            return {
                ...prev,
                assignedSpaceIds: isSelected
                    ? prev.assignedSpaceIds.filter(id => id !== spaceId)
                    : [...prev.assignedSpaceIds, spaceId]
            };
        });
    }, []);

    const handleChangeRole = useCallback((role: string) => {
        setFormData(prev => ({ ...prev, role: role as any }));
    }, []);

    const handleToggleActive = useCallback((checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData: any = {
                name: formData.name,
                role: formData.role,
                isActive: formData.isActive,
                idNumber: formData.idNumber,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                unitNumber: formData.role === 'RESIDENT' ? formData.unitNumber : undefined,
                assignedSpaceIds: formData.role === 'RESIDENT' ? formData.assignedSpaceIds : undefined,
                profileImage: formData.profileImage,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await api.patch(`/users/${user.id}`, updateData);
            toast.success('User updated', {
                description: `${formData.name} has been successfully updated.`,
            });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.message || 'Failed to update user',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <DialogTitle className="text-2xl font-black text-slate-800 dark:text-slate-100">Edit User</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Update user information. Leave password empty to keep current password.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                            Personal Information
                            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></span>
                        </h3>

                        <div className="flex flex-col items-center justify-center gap-4 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg">
                                    {formData.profileImage ? (
                                        <img
                                            src={formData.profileImage.startsWith('http') ? formData.profileImage : `${API_BASE_URL}${formData.profileImage}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('edit-profile-upload')?.click()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    id="edit-profile-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                const url = await uploadImage(file);
                                                setFormData(prev => ({ ...prev, profileImage: url }));
                                            } catch (error) {
                                                toast.error('Failed to upload image');
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <span className="text-sm text-slate-500 font-medium">Click to upload photo</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name" className="text-slate-600 dark:text-slate-400 font-bold">Full Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-idNumber" className="text-slate-600 dark:text-slate-400 font-bold">ID Number</Label>
                                <Input
                                    id="edit-idNumber"
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                                    placeholder="1-1234-5678"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone" className="text-slate-600 dark:text-slate-400 font-bold">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="8888-8888"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-dob" className="text-slate-600 dark:text-slate-400 font-bold">Date of Birth</Label>
                            <Input
                                id="edit-dob"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                            Account Details
                            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></span>
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email" className="text-slate-600 dark:text-slate-400 font-bold">Email</Label>
                            <div className="relative">
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Read-only</span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password" className="text-slate-600 dark:text-slate-400 font-bold">New Password (Optional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Leave empty to keep current"
                                minLength={6}
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <RoleSection role={formData.role} onRoleChange={handleChangeRole} />
                    </div>

                    {formData.role === 'RESIDENT' && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-unitNumber" className="text-slate-600 dark:text-slate-400 font-bold">Unit Number</Label>
                                <Input
                                    id="edit-unitNumber"
                                    value={formData.unitNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
                                    placeholder="e.g. A-101"
                                    required={formData.role === 'RESIDENT'}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <ParkingSection
                                spaces={spaces}
                                selectedIds={formData.assignedSpaceIds}
                                currentResidentId={user.residentProfile?.id}
                                onToggle={handleToggleSpace}
                            />
                        </div>
                    )}

                    <ActiveAccountSection isActive={formData.isActive} onToggle={handleToggleActive} />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
