import { Wifi, WifiOff, Clock, Cpu, ShieldCheck } from "lucide-react"
import { cn } from "../lib/utils"

export default function Header({isConnected, uptime}){
    return(
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground lg:text-2xl">
                        Sistema de Controle de Acesso
                    </h1>
                    <p className="text-sm text-muted-foreground">Dashboard Administrativo</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Status MQTT */}
                <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isConnected ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>
                    {isConnected ? (
                        <>
                            <Wifi className="h-4 w-4" />
                            <span className="hidden sm:inline">Broker MQTT</span>
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                            </span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-4 w-4" />
                            <span className="hidden sm:inline">Desconectado</span>
                            <span className="h-2 w-2 rounded-full bg-destructive"></span>
                        </>
                    )}
                </div>

                {/* Uptime ESP32 */}
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">ESP32</span>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-primary">{uptime}</span>
                </div>
            </div>
        </header>
    )
}