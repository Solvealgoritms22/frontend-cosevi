"use client";

import { CreateUserDialog } from "@/components/create-user-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/context/translation-context";
import api, { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    Filter,
    Plus,
    Search,
    Shield,
    Trash2,
    User,
    UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";

interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "RESIDENT" | "SECURITY";
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

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
    const { t, language } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    useEffect(() => {
        filterUsers();
    }, [users]);

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
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
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }
        setFilteredUsers(filtered);
    };

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
            console.error("Error deleting user:", error);
        }
    };

    const getRoleBadge = (role: string) => {
        const icons = {
            ADMIN: Shield,
            RESIDENT: User,
            SECURITY: UserCog,
        };
        const colors = {
            ADMIN: "bg-red-50 text-red-600 border-red-100 ",
            RESIDENT: "bg-blue-50 text-blue-600 border-blue-100 ",
            SECURITY: "bg-amber-50 text-amber-600 border-amber-100 ",
        };
        const Icon = icons[role as keyof typeof icons] || User;
        const colorClass =
            colors[role as keyof typeof colors] ||
            "bg-slate-50 text-slate-500 border-slate-100 ";
        return (
            <div
                className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm",
                    colorClass
                )}
            >
                <Icon className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {t(role.toLowerCase() + "Role")}
                </span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            language === "es" ? "es-ES" : "en-US",
            { year: "numeric", month: "short", day: "numeric" }
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:gap-6 lg:gap-10 h-full pb-10 px-2 sm:px-4"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12 px-4">
                <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                        {t('userManagement').substring(0, t('userManagement').lastIndexOf(' '))} <span className="text-blue-500">{t('userManagement').split(' ').pop()}</span>
                    </h2>
                    <p className="text-slate-500 text-base sm:text-xl font-medium tracking-tight opacity-70">{t('manageSystemUsers')}</p>
                </div>
                <GlassButton onClick={() => setCreateDialogOpen(true)} variant="primary" icon={Plus} glow className="h-16 px-10 text-lg shadow-2xl shadow-blue-500/20" >
                    {t('createUser')}
                </GlassButton>
            </div>

            {/* Constraints & Search */}
            <div className="flex flex-col lg:flex-row items-center gap-6 px-4">
                <div className="flex-1 relative group w-full">
                    <div className="absolute inset-0 bg-white/40 blur-md rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10"
                        size={20}
                    />
                    <input
                        placeholder={t("searchUsers")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative z-10 w-full h-14 sm:h-16 pl-14 pr-8 bg-white/40 border border-white/60 rounded-2xl text-base sm:text-lg font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-500 "
                    />
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="h-14 sm:h-16 bg-white/40 border border-white/60 rounded-2xl px-6 flex items-center gap-4 min-w-[160px] sm:min-w-[200px] shadow-sm w-full lg:w-auto">
                        <Filter size={18} className="text-blue-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-[10px] sm:text-sm font-black text-slate-700 uppercase tracking-widest outline-none cursor-pointer w-full"
                        >
                            <option value="all">{t("allRoles")}</option>
                            <option value="ADMIN">{t("adminRole")}</option>
                            <option value="RESIDENT">{t("residentRole")}</option>
                            <option value="SECURITY">{t("securityRole")}</option>
                        </select>
                        <ChevronDown size={14} className="text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Users List - Spatial UI */}
            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-28 rounded-3xl w-full" />
                        <Skeleton className="h-28 rounded-3xl w-full" />
                        <Skeleton className="h-28 rounded-3xl w-full" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="glass-panel p-20 rounded-4xl border border-white/60 text-center">
                        <div className="size-20 rounded-full bg-white shadow-inner flex items-center justify-center mx-auto mb-6 text-slate-500 ">
                            <User size={32} />
                        </div>
                        <p className="text-xl font-black text-slate-800 tracking-tight">
                            {t("noUsersDetected")}
                        </p>
                        <p className="text-sm text-slate-600 font-medium">
                            {t("clearFiltersMsg")}
                        </p>
                    </div>
                ) : (
                    <div className="glass-panel rounded-3xl sm:rounded-4xl border border-white/60 p-2 sm:p-10 flex flex-col gap-4 sm:gap-6 shadow-2xl relative overflow-hidden">
                        <AnimatePresence mode="popLayout">
                            {paginatedUsers.map((user) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={user.id}
                                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 sm:p-6 rounded-[2.5rem] bg-white border border-white hover:border-blue-100 transition-all group shadow-sm hover:shadow-xl duration-500 gap-6"
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="size-12 sm:size-16 rounded-xl sm:rounded-2xl bg-white shadow-sm border border-white flex items-center justify-center overflow-hidden text-slate-400 group-hover:text-blue-500 transition-all duration-500 group-hover:scale-110 shrink-0">
                                            <UserAvatar
                                                src={user.profileImage}
                                                name={user.name}
                                                role={user.role}
                                                iconSize={28}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-lg sm:text-xl text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-none">
                                                {user.name}
                                            </p>
                                            <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1 opacity-80 break-all">
                                                {user.email}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {user.idNumber && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                                        <span className="text-fluid-label font-black text-slate-500 uppercase tracking-widest break-all">
                                                            {t('identification')}: {user.idNumber}
                                                        </span>
                                                    </div>
                                                )}
                                                {user.phone && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                                        <span className="text-fluid-label font-black text-slate-500 uppercase tracking-widest">
                                                            {t('telephone')}: {user.phone}
                                                        </span>
                                                    </div>
                                                )}
                                                {user.residentProfile?.unitNumber && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
                                                        <span className="text-fluid-label font-black text-blue-500 uppercase tracking-widest">
                                                            Unit: {user.residentProfile.unitNumber}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 sm:gap-10 mt-2 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50 w-full lg:w-auto">
                                        <div className="text-left lg:text-right">
                                            <p className="text-fluid-label font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-60">
                                                {t("role")}
                                            </p>
                                            <div className="flex lg:justify-end">
                                                {getRoleBadge(user.role)}
                                            </div>
                                        </div>
                                        <div className="text-left lg:text-right">
                                            <p className="text-fluid-label font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-60">
                                                {t("status")}
                                            </p>
                                            <div
                                                className={cn(
                                                    "px-4 py-1.5 rounded-xl border font-black text-fluid-label uppercase tracking-[0.15em] shadow-sm text-center",
                                                    user.isActive
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 "
                                                        : "bg-slate-50 text-slate-500 border-slate-100 "
                                                )}
                                            >
                                                {user.isActive ? t("active") : t("inactive")}
                                            </div>
                                        </div>
                                        <div className="hidden xl:block text-right">
                                            <p className="text-fluid-label font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-60">
                                                {t("created")}
                                            </p>
                                            <p className="text-sm font-black text-slate-800 ">
                                                {formatDate(user.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto lg:ml-0">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="size-12 rounded-2xl bg-slate-50 shadow-sm border border-slate-100 hover:bg-white flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all duration-500 hover:shadow-lg"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="size-12 rounded-2xl bg-red-50 border border-transparent hover:border-red-100 hover:bg-white flex items-center justify-center text-red-400 transition-all duration-500 hover:shadow-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-10 border-t border-white/20 mt-4 px-4">
                                <p className="text-fluid-label font-black uppercase tracking-[0.2em] text-slate-400">
                                    {t("showing")} <span className="text-slate-800">{paginatedUsers.length}</span> {t("of")} <span className="text-slate-800">{filteredUsers.length}</span> {t("users")}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={cn(
                                            "size-10 rounded-xl flex items-center justify-center transition-all border border-white/60",
                                            currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm"
                                        )}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={cn(
                                                    "size-10 rounded-xl text-[10px] font-black transition-all",
                                                    currentPage === page
                                                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                        : "bg-white/40 text-slate-500 hover:bg-white border border-white/60"
                                                )}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className={cn(
                                            "size-10 rounded-xl flex items-center justify-center transition-all border border-white/60",
                                            currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm"
                                        )}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
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
