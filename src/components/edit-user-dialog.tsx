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
import React, { memo, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/user-avatar';
import { useTranslation } from '@/context/translation-context';

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

const RoleSection = memo(({ role, onRoleChange }: { role: string, onRoleChange: (val: string) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="grid gap-2">
            <Label htmlFor="edit-role" className="text-slate-600 font-bold ml-1">{t('role')}</Label>
            <Select value={role} onValueChange={onRoleChange}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                    <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">{t('adminRole')}</SelectItem>
                    <SelectItem value="RESIDENT">{t('residentRole')}</SelectItem>
                    <SelectItem value="SECURITY">{t('securityRole')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
});
RoleSection.displayName = 'RoleSection';

const ParkingSection = memo(({ spaces, selectedIds, currentResidentId, onToggle }: { spaces: Space[], selectedIds: string[], currentResidentId?: string, onToggle: (id: string) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-8 h-px bg-slate-100"></span> {t('residency')} <span className="flex-1 h-px bg-slate-100"></span>
            </h3>
            <div className="grid gap-2">
                <Label className="text-slate-600 font-bold ml-1">{t('assignedParkingSpots')}</Label>
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
                                    className={`cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all duration-200 relative ${isSelected ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-500/20' : 'bg-white border-slate-200 hover:border-orange-300'
                                        }`}
                                >
                                    <Checkbox
                                        id={`edit-space-${space.id}`}
                                        checked={isSelected}
                                        onCheckedChange={() => { }}
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-orange-700' : 'text-slate-600'}`}>
                                            {space.name}
                                        </span>
                                        {isCurrentlyAssigned && <span className="text-[10px] text-emerald-500 font-bold">{t('current')}</span>}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
});
ParkingSection.displayName = 'ParkingSection';

const ActiveAccountSection = memo(({ isActive, onToggle }: { isActive: boolean, onToggle: (checked: boolean) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex flex-col gap-0.5">
                <Label htmlFor="edit-active" className="text-base font-bold text-slate-700">{t('activeAccount')}</Label>
                <span className="text-xs text-slate-500 font-medium">{t('allowLoginMsg')}</span>
            </div>
            <Switch id="edit-active" checked={isActive} onCheckedChange={onToggle} />
        </div>
    );
});
ActiveAccountSection.displayName = 'ActiveAccountSection';

interface FormData {
    name: string;
    role: 'ADMIN' | 'RESIDENT' | 'SECURITY';
    isActive: boolean;
    password: string;
    idNumber: string;
    phone: string;
    dateOfBirth: string;
    unitNumber: string;
    assignedSpaceIds: string[];
    profileImage: string;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
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
    }, [user.id, open, user.name, user.role, user.isActive, user.idNumber, user.phone, user.dateOfBirth, user.residentProfile]);

    const handleToggleSpace = useCallback((spaceId: string) => {
        setFormData((prev: FormData) => {
            const isSelected = prev.assignedSpaceIds.includes(spaceId);
            return { ...prev, assignedSpaceIds: isSelected ? prev.assignedSpaceIds.filter((id: string) => id !== spaceId) : [...prev.assignedSpaceIds, spaceId] };
        });
    }, []);

    const handleChangeRole = useCallback((role: string) => {
        setFormData((prev: FormData) => ({ ...prev, role: role as 'ADMIN' | 'RESIDENT' | 'SECURITY' }));
    }, []);

    const handleToggleActive = useCallback((checked: boolean) => {
        setFormData((prev: FormData) => ({ ...prev, isActive: checked }));
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
            toast.success(t('userUpdated'), {
                description: `${formData.name} ${t('successUpdateMsg')}`,
            });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(t('error'), {
                description: error.response?.data?.message || t('failedUpdateUser'),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-slate-100 mb-6">
                    <DialogTitle className="text-2xl font-black text-slate-800 ">{t('editUser')}</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        {t('updateUserMsg')}
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
                                    onClick={() => document.getElementById('edit-profile-upload')?.click()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                            setFormData((prev) => ({ ...prev, profileImage: url }));
                                        } catch (error) {
                                            toast.error(t('failedUploadImage'));
                                        }
                                    }
                                }}
                            />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('updatePhoto')}</span>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-100"></span> {t('personalInformation')} <span className="flex-1 h-px bg-slate-100"></span>
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-name" className="text-slate-600 font-bold ml-1">{t('fullName')}</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-idNumber" className="text-slate-600 font-bold ml-1">{t('idNumber')}</Label>
                                <Input
                                    id="edit-idNumber"
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
                                    placeholder="1-1234-5678"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone" className="text-slate-600 font-bold ml-1">{t('phone')}</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                    placeholder="8888-8888"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-dob" className="text-slate-600 font-bold ml-1">{t('dob')}</Label>
                            <Input
                                id="edit-dob"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-100"></span> {t('accountDetails')} <span className="flex-1 h-px bg-slate-100"></span>
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email" className="text-slate-600 font-bold ml-1">{t('email')}</Label>
                            <div className="relative">
                                <Input id="edit-email" type="email" value={user.email} disabled className="h-11 rounded-xl bg-slate-100 border-slate-200 opacity-70" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black uppercase">{t('fixed')}</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-password" className="text-slate-600 font-bold ml-1">{t('password')} ({t('optional') || 'Optional'})</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                placeholder={t('passwordKeepMsg')}
                                minLength={6}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <RoleSection role={formData.role} onRoleChange={handleChangeRole} />
                    </div>

                    {formData.role === 'RESIDENT' && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-unitNumber" className="text-slate-600 font-bold ml-1">{t('unitNumber')}</Label>
                                <Input
                                    id="edit-unitNumber"
                                    value={formData.unitNumber}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, unitNumber: e.target.value }))}
                                    placeholder="e.g. A-101"
                                    required={formData.role === 'RESIDENT'}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
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

                    <DialogFooter className="pt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11">
                            {t('cancel')}
                        </Button>
                        <Button type="submit" loading={loading} className="rounded-xl h-11 px-8 bg-orange-600 hover:bg-orange-700">
                            {t('saveChanges') || 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}