"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    read: boolean;
    time?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = React.useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
        const id = crypto.randomUUID();
        const newNotification = { ...notification, id, read: false };
        setNotifications(prev => [newNotification, ...prev]);

        // Auto remove after 10 seconds if it's just a success/info
        if (notification.type === 'success' || notification.type === 'info') {
            const timer = setTimeout(() => {
                removeNotification(id);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, []);

    const removeNotification = React.useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markAsRead = React.useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const clearRead = React.useCallback(() => {
        setNotifications(prev => prev.filter(n => !n.read));
    }, []);

    const value = React.useMemo(() => ({
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        clearRead
    }), [notifications, unreadCount, addNotification, removeNotification, markAsRead, clearRead]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}