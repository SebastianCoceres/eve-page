import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldClasses } from "@/components/ui/Input"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn("flex min-h-40 resize-y py-3 leading-[1.6]", fieldClasses, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
