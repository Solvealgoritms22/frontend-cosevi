'use client';

import { CreateUserDialog } from '@/components/create-user-dialog';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { EditUserDialog } from '@/components/edit-user-dialog';
import { GlassButton } from '@/components/ui/glass-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/translation-context';
import api, { API_BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Edit, Filter, Plus, Search, Shield, Trash2, User, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';



interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'RESIDENT' | 'SECURITY';
    isActive: boolean;
    createdAt: string;
    residentProfile?: {
        id: string;
        unitNumber: string;
        assignedSpaces?: any[];
    };
    idNumber?: string;
    phone?: string;
    dateOfBirth?: string;
    profileImage?: string;
}

export default function UsersPage() {
    const { t, language } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const getImageUrl = (path?: string) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${normalizedPath}`;
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by role
        if (roleFilter !== 'all') {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await api.delete(`/users/${selectedUser.id}`);
            setDeleteDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const getRoleBadge = (role: string) => {
        const icons = {
            ADMIN: Shield,
            RESIDENT: User,
            SECURITY: UserCog,
        };

        const colors = {
            ADMIN: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800",
            RESIDENT: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
            SECURITY: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
        };

        const Icon = icons[role as keyof typeof icons] || User;
        const colorClass = colors[role as keyof typeof colors] || "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700";

        return (
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm", colorClass)}>
                <Icon className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t(role.toLowerCase() + 'Role')}</span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 lg:gap-12 h-full pb-10"
        >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                <div className="space-y-1">
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-800 dark:text-slate-100">
                        {t('adminUsers')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium tracking-tight text-sm lg:text-lg">
                        {t('accessLevels')}
                    </p>
                </div>
                <GlassButton
                    onClick={() => setCreateDialogOpen(true)}
                    variant="primary"
                    icon={Plus}
                    glow
                    className="h-12 lg:h-14 px-6 lg:px-8 w-full sm:w-auto"
                >
                    {t('createUser')}
                </GlassButton>
            </div>

            {/* Constraints & Search */}
            <div className="flex flex-col lg:flex-row items-center gap-6 px-4">
                <div className="flex-1 relative group w-full">
                    <div className="absolute inset-0 bg-white/40 blur-md rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={20} />
                    <input
                        placeholder={t('searchUsers')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative z-10 w-full h-14 lg:h-16 pl-14 pr-8 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-2xl text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="h-14 lg:h-16 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-2xl px-6 flex items-center gap-4 min-w-[160px] lg:min-w-[200px] shadow-sm">
                        <Filter size={18} className="text-indigo-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-[10px] lg:text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest outline-none cursor-pointer w-full"
                        >
                            <option value="all">{t('allRoles')}</option>
                            <option value="ADMIN">{t('adminRole')}</option>
                            <option value="RESIDENT">{t('residentRole')}</option>
                            <option value="SECURITY">{t('securityRole')}</option>
                        </select>
                        <ChevronDown size={14} className="text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Users List - Spatial UI */}
            <div className="space-y-6">
                {loading ? (
                    <>
                        <Skeleton className="h-28 rounded-3xl w-full" />
                        <Skeleton className="h-28 rounded-3xl w-full" />
                        <Skeleton className="h-28 rounded-3xl w-full" />
                    </>
                ) : filteredUsers.length === 0 ? (
                    <div className="glass-panel p-20 rounded-4xl border border-white/60 text-center">
                        <div className="size-20 rounded-full bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center mx-auto mb-6 text-slate-500 dark:text-slate-400">
                            <User size={32} />
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('noUsersDetected')}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('clearFiltersMsg')}</p>
                    </div>
                ) : (
                    <div className="glass-panel rounded-4xl border border-white/60 p-10 flex flex-col gap-6 shadow-2xl elevation-3 relative">
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={user.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-5 lg:p-7 rounded-3xl bg-white/45 dark:bg-slate-800/45 border border-white/60 dark:border-slate-700/60 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-white dark:hover:border-slate-600 transition-all group elevation-1 hover:elevation-2 duration-500 gap-6"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-white dark:border-slate-700 flex items-center justify-center overflow-hidden text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-all duration-500 group-hover:scale-110">
                                            {user.profileImage && !imageErrors[user.id] ? (
                                                <img
                                                    src={getImageUrl(user.profileImage) || ''}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [user.id]: true }))}
                                                />
                                            ) : (
                                                user.role === 'ADMIN' ? <Shield size={28} strokeWidth={1.5} /> : <User size={28} strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">{user.name}</p>
                                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1 opacity-80">{user.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {user.idNumber && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900/30 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {user.idNumber}</span>
                                                    </div>
                                                )}
                                                {user.phone && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900/30 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tel: {user.phone}</span>
                                                    </div>
                                                )}
                                                {user.residentProfile?.unitNumber && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Unit: {user.residentProfile.unitNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10 mt-6 md:mt-0">
                                        <div className="hidden lg:block text-right">
                                            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-95">{t('role')}</p>
                                            <div className="flex justify-end">{getRoleBadge(user.role)}</div>
                                        </div>
                                        <div className="hidden lg:block text-right">
                                            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-95">{t('status')}</p>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-[0.15em] shadow-sm text-center",
                                                user.isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700"
                                            )}>
                                                {user.isActive ? t('active') : t('inactive')}
                                            </div>
                                        </div>
                                        <div className="hidden xl:block text-right">
                                            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-95">{t('created')}</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{formatDate(user.createdAt)}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-white dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-all duration-500 group-hover:scale-105"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="size-12 rounded-xl bg-red-50/20 dark:bg-red-900/10 border border-transparent hover:border-red-100 dark:hover:border-red-800 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-red-400 transition-all duration-500 group-hover:scale-105"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CreateUserDialog
                key={`create-${createDialogOpen}`}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchUsers}
            />

            {selectedUser && (
                <>
                    <EditUserDialog
                        key={`edit-${selectedUser.id}-${editDialogOpen}`}
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        user={selectedUser}
                        onSuccess={fetchUsers}
                    />

                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        onConfirm={handleDeleteConfirm}
                        userName={selectedUser.name}
                    />
                </>
            )}
        </motion.div>
    );
}
