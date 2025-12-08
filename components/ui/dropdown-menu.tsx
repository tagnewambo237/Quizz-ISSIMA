"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
    open: boolean
    setOpen: (open: boolean) => void
    triggerRef: React.RefObject<HTMLButtonElement | null> | null
    contentRef: React.RefObject<HTMLDivElement | null> | null
}>({ open: false, setOpen: () => { }, triggerRef: null, contentRef: null })

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside both the container AND the content (which is in a portal)
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                contentRef.current &&
                !contentRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
            <div ref={containerRef} className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

const DropdownMenuTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)

    return (
        <button
            ref={triggerRef as React.RefObject<HTMLButtonElement>}
            onClick={(e) => {
                setOpen(!open)
                onClick?.(e)
            }}
            className={cn("inline-flex justify-center w-full", className)}
            {...props}
        >
            {props.children}
        </button>
    )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }
>(({ className, align = "center", ...props }, ref) => {
    const { open, triggerRef, contentRef } = React.useContext(DropdownMenuContext)
    const [position, setPosition] = React.useState({ top: 0, left: 0, right: 'auto' as string | number })

    React.useEffect(() => {
        if (open && triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const scrollLeft = window.scrollX || document.documentElement.scrollLeft

            if (align === "end") {
                setPosition({
                    top: rect.bottom + scrollTop + 4,
                    left: 'auto' as unknown as number,
                    right: window.innerWidth - rect.right - scrollLeft
                })
            } else if (align === "start") {
                setPosition({
                    top: rect.bottom + scrollTop + 4,
                    left: rect.left + scrollLeft,
                    right: 'auto'
                })
            } else {
                setPosition({
                    top: rect.bottom + scrollTop + 4,
                    left: rect.left + scrollLeft + rect.width / 2,
                    right: 'auto'
                })
            }
        }
    }, [open, align, triggerRef])

    if (!open) return null

    const content = (
        <div
            ref={(node) => {
                // Set both the forwarded ref and the context ref
                if (contentRef) {
                    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node
                }
                if (typeof ref === 'function') {
                    ref(node)
                } else if (ref) {
                    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
                }
            }}
            style={{
                position: 'fixed',
                top: position.top,
                left: align === "end" ? 'auto' : position.left,
                right: align === "end" ? position.right : 'auto',
                transform: align === "center" ? 'translateX(-50%)' : undefined,
            }}
            className={cn(
                "z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-gray-800 p-1 text-popover-foreground shadow-lg",
                className
            )}
            {...props}
        />
    )

    // Use portal to render outside of any overflow container
    if (typeof window !== 'undefined') {
        return ReactDOM.createPortal(content, document.body)
    }

    return content
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext)

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                inset && "pl-8",
                className
            )}
            onClick={(e) => {
                // Execute the action
                onClick?.(e)

                // Close the menu after a brief delay to ensure action completes
                setTimeout(() => setOpen(false), 0)
            }}
            {...props}
        />
    )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "px-2 py-1.5 text-sm font-semibold",
            inset && "pl-8",
            className
        )}
        {...props}
    />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props}
    />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
}
