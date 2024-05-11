import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                outline:
                    "border border-primary  hover:bg-primary/10",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                error: "bg-error text-error-foreground hover:bg-error/50 border border-error",
                info: "bg-info text-info-foreground hover:bg-info/50 border border-info",
                success: "bg-success text-success-foreground hover:bg-success/50 border border-success",
                warning: "bg-warning text-warning-foreground hover:bg-warning/50 border border-warning",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 text-lg rounded-md px-8",
                xl: "h-14 text-xl rounded-md px-8",
                icon: "h-10 w-10",
            },
            rounded: {
                default: "rounded-md",
                full: "rounded-full",
                none: "rounded-none",
                sm: "rounded-sm",
                lg: "rounded-lg",
                xl: "rounded-xl",
            },
            isBlock: {
                true: "w-full",
                false: "w-fit",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounded: "default",
            isBlock: false
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isBlock, rounded, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, isBlock, rounded, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
