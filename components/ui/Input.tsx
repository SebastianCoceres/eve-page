import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

// 48px field on white, 1px border at 3:1. Focus turns the border cobalt and adds the ring.
export const fieldClasses =
    "w-full rounded-xs border border-input-border bg-field px-4 text-base text-foreground transition-colors duration-150 ease-out placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-error disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn("flex h-12", fieldClasses, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
