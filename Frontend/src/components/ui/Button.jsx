import { cn } from "../../lib/utils"

export function Button({children, className, variant = "default", size = "default", disabled, ...props}){
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-trasparent hover:bg-secondary",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
    }

    return(
        <button className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
            {children}
        </button>
    )
}