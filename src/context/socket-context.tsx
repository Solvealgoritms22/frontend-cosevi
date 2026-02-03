"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
    socket: Socket | null
}

const SocketContext = createContext<SocketContextType>({ socket: null })

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        // Build the socket URL from API_URL (removing /api)
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'

        const newSocket = io(socketUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        })

        setSocket(newSocket)

        newSocket.on('connect', () => {
            console.log('Admin connected to socket')
        })

        newSocket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', error)
        })

        return () => {
            newSocket.disconnect()
        }
    }, [])

    const value = React.useMemo(() => ({ socket }), [socket])

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}
