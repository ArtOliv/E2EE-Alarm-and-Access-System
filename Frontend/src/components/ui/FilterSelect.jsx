import { useState, useEffect, useRef } from "react";
import { Filter, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export function FilterSelect({value, onChange, options, className}){
    const [isOpen, setIsOpen] = useState(false)
    const dropdownref = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(dropdownref.current && !dropdownref.current.contains(event.target)){
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectedOption = options.find(o => o.id === value)

    return(
        <div className={cn("relative", className)} ref={dropdownref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-center h-10 px-0 w-10 sm:w-auto sm:px-3 rounded-lg border transition-all duration-200 cursor-pointer",
                    "bg-secondary/50 border-border text-muted-foreground hover:bg-background hover:text-foreground"
                )}
            >
                <Filter className="h-4 w-4 sm:mr-2 shrink-0" />
                <span className="hidden sm:inline text-xs font-medium">
                    {selectedOption?.label || "Filtrar"}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 sm:left-0 mt-2 w-48 rounded-xl border border-border bg-background p-1.5 shadow-2xl z-50 animate-in fade-in zomm-in-95">
                    <div className="mb-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground tracking-wider">
                        Filtrar Logs
                    </div>
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                onChange(opt.id)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "flex w-full items-center justify-between rounded-md p-2 pu-2.5 text-sm transition-colors hover:bg-secondary/80 cursor-pointer",
                                value === opt.id ? "text-primary font-medium" : "text-foreground"
                            )}
                        >
                            {opt.label}
                            {value === opt.id && <Check className="h-4 w-4 text-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}