"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
}>({
    open: false,
    onOpenChange: () => { },
})

export const Dialog = ({ children, open, onOpenChange }: any) => {
    // Internal state if controlled state is not provided
    const [isOpen, setIsOpen] = React.useState(false)

    const isControlled = open !== undefined
    const currentOpen = isControlled ? open : isOpen
    const setOpen = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen)
        }
        if (!isControlled) {
            setIsOpen(newOpen)
        }
    }

    return (
        <DialogContext.Provider value={{ open: currentOpen, onOpenChange: setOpen }}>
            {children}
        </DialogContext.Provider>
    )
}

export const DialogTrigger = ({ children, asChild, onClick }: any) => {
    const { onOpenChange } = React.useContext(DialogContext)

    const handleClick = (e: any) => {
        if (onClick) onClick(e)
        onOpenChange(true)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick
        })
    }

    return (
        <button onClick={handleClick}>{children}</button>
    )
}

export const DialogContent = ({ children, className }: any) => {
    const { open, onOpenChange } = React.useContext(DialogContext)

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0" onClick={() => onOpenChange(false)} />
            <div className={cn("relative z-50 grid w-full max-w-lg gap-4 border bg-white dark:bg-gray-900 p-6 shadow-lg duration-200 sm:rounded-lg md:w-full animate-in zoom-in-95", className)}>
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    )
}

export const DialogHeader = ({ className, ...props }: any) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

export const DialogTitle = ({ className, ...props }: any) => (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

export const DialogDescription = ({ className, ...props }: any) => (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

export const DialogFooter = ({ className, ...props }: any) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
