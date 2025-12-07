import Pusher from 'pusher'

// Server-side Pusher client (for API routes)
let pusherServer: Pusher | null = null

export const getPusherServer = () => {
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
        return null
    }

    if (!pusherServer) {
        pusherServer = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        })
    }

    return pusherServer
}

// Check if Pusher is configured
export const isPusherConfigured = () => {
    return !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER)
}

// Channel name helpers
export const getConversationChannel = (conversationId: string) =>
    `conversation-${conversationId}`

export const getUserChannel = (userId: string) =>
    `private-user-${userId}`
