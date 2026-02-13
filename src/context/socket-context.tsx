"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import { usePathname } from 'next/navigation'

interface SocketContextType {
    pusher: Pusher | null
    tenantChannel: any | null
}

const SocketContext = createContext<SocketContextType>({ pusher: null, tenantChannel: null })

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [pusher, setPusher] = useState<Pusher | null>(null)
    const [tenantChannel, setTenantChannel] = useState<any | null>(null)
    const [currentToken, setCurrentToken] = useState<string | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        // Force removal of any trailing slashes and ensure /api is used if missing
        apiUrl = apiUrl.replace(/\/+$/, '');

        // Ensure the path to pusher auth is absolutely correct relative to our backend prefix
        const authEndpoint = `${apiUrl}/pusher/auth`.replace(/([^:])\/\//g, '$1/');

        if (!pusherKey) {
            console.warn('Pusher key not found in environment variables');
            return;
        }

        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');

        // Only initialize or re-initialize if the token changed
        if (token === currentToken && pusher) {
            return;
        }

        // If we had an old pusher instance, disconnect it
        if (pusher) {
            pusher.disconnect();
        }

        if (!token) {
            setPusher(null);
            setTenantChannel(null);
            setCurrentToken(null);
            return;
        }

        const pusherClient = new Pusher(pusherKey, {
            cluster: pusherCluster || 'mt1',
            authEndpoint: authEndpoint,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-tenant-id': tenantId,
                },
            },
        });

        setPusher(pusherClient);
        setCurrentToken(token);

        // If we have a tenantId, subscribe to its private channel automatically
        if (tenantId) {
            const channelName = `private-tenant-${tenantId}-visits`;
            const channel = pusherClient.subscribe(channelName);

            channel.bind('pusher:subscription_succeeded', () => {
                console.log(`Successfully subscribed to channel: ${channelName}`);
            });

            channel.bind('pusher:subscription_error', (error: any) => {
                console.error(`Subscription error for channel ${channelName}:`, error);
            });

            setTenantChannel(channel);
        }

        return () => {
            if (tenantId) {
                pusherClient.unsubscribe(`private-tenant-${tenantId}-visits`);
            }
            pusherClient.disconnect();
        }
    }, [pathname, currentToken])

    const value = React.useMemo(() => ({ pusher, tenantChannel }), [pusher, tenantChannel])

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

