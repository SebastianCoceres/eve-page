import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Primary = cobalt pill with white text (7.99:1). Flat: no shadow, no border weight.
// The outline ring follows the pill because outlines track border-radius.
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-progress motion-reduce:transition-none",
    {
        variants: {
            variant: {
                default: "rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
                link: "text-link underline decoration-1 underline-offset-[3px] decoration-transparent hover:decoration-current",
                quiet: "text-foreground underline decoration-1 underline-offset-[3px] decoration-hairline hover:decoration-current",
                outline: "rounded-field border border-input-border bg-field text-foreground hover:border-muted-foreground",
            },
            size: {
                default: "min-h-12 px-7 text-[15px]",
                compact: "min-h-11 px-6 text-[15px]",
                inline: "min-h-11 text-[15px]",
                icon: "size-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
