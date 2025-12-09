"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import PusherClient from 'pusher-js'
import { useSession } from 'next-auth/react'

interface PusherContextType {
    client: PusherClient | null
    isConnected: boolean
    isConfigured: boolean
}

const PusherContext = createContext<PusherContextType>({
    client: null,
    isConnected: false,
    isConfigured: false
})

export const usePusher = () => useContext(PusherContext)

interface PusherProviderProps {
    children: ReactNode
}

export function PusherProvider({ children }: PusherProviderProps) {
    const { data: session, status } = useSession()
    const [client, setClient] = useState<PusherClient | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isConfigured, setIsConfigured] = useState(false)

    useEffect(() => {
        if (status !== 'authenticated' || !session?.user?.id) {
            return
        }

        // Check if Pusher env vars are available
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

        if (!pusherKey || !pusherCluster) {
            console.info('[Chat] 💬 Real-time not configured. Using polling mode.')
            setIsConfigured(false)
            return
        }

        console.log('[Pusher] Connecting with key:', pusherKey, 'cluster:', pusherCluster)
        setIsConfigured(true)

        // Create Pusher client
        const pusher = new PusherClient(pusherKey, {
            cluster: pusherCluster,
            forceTLS: true
        })

        pusher.connection.bind('connected', () => {
            setIsConnected(true)
            console.log('[Pusher] ✅ Connected!')
        })

        pusher.connection.bind('disconnected', () => {
            setIsConnected(false)
            console.log('[Pusher] Disconnected')
        })

        pusher.connection.bind('error', (err: any) => {
            console.error('[Pusher] Connection Error Details:', JSON.stringify(err, null, 2))
            // Check for common errors
            if (err?.error?.data?.code === 4004) {
                console.error('[Pusher] Over limit or subscription error')
            }
        })

        setClient(pusher)

        return () => {
            pusher.disconnect()
            setClient(null)
            setIsConnected(false)
        }
    }, [session?.user?.id, status])

    return (
        <PusherContext.Provider value={{ client, isConnected, isConfigured }}>
            {children}
        </PusherContext.Provider>
    )
}

// Hook to subscribe to a channel
export function useChannel(
    channelName: string | null,
    eventName: string,
    callback: (data: any) => void
) {
    const { client, isConfigured, isConnected } = usePusher()
    const callbackRef = React.useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        if (!client || !channelName || !isConfigured || !isConnected) {
            return
        }

        const channel = client.subscribe(channelName)

        channel.bind(eventName, (data: any) => {
            console.log(`[Pusher] 📨 Received ${eventName} on ${channelName}`)
            callbackRef.current(data)
        })

        console.log(`[Pusher] 📡 Subscribed to ${channelName}`)

        return () => {
            channel.unbind(eventName)
            client.unsubscribe(channelName)
        }
    }, [client, channelName, eventName, isConfigured, isConnected])
}
