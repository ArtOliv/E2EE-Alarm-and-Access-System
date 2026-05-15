import { useEffect } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"
import { cn } from "../../lib/utils"

export function Toast({show, message, type = "success", onClose}){
    useEffect(() => {
        if(show){
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer); 
        }
    }, [show, onClose]);

    if(!show) return;

    return(
        <div className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl transition-all animate-in slide-in-from-top-5 fade-in duration-500 w-[90%] sm:w-fit max-w-md", type === "success" ? "bg-success text-background" : "bg-destructive text-background")}>
            {type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-sm font-medium flex-1 text-left">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}