"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Light only (no dark mode in this project). Flat: hairline border, no shadow.
const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            position="bottom-center"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-field group-[.toaster]:text-foreground group-[.toaster]:font-sans group-[.toaster]:text-[15px] group-[.toaster]:border group-[.toaster]:border-hairline group-[.toaster]:rounded-xs group-[.toaster]:shadow-none",
                    description: "group-[.toast]:text-muted-foreground",
                    success: "group-[.toaster]:[&_[data-icon]]:text-success",
                    error: "group-[.toaster]:[&_[data-icon]]:text-error",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-surface group-[.toast]:text-muted-foreground",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
