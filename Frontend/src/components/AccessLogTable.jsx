import { Activity, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { cn } from "../lib/utils"

export default function AccessLogTable({logs}){
    return(
        <Card className="flex flex-col h-auto lg:h-142 overflow-hidden">
            <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Activity className="h-5 w-5 text-primary" />
                            Log de Eventos
                        </CardTitle>
                        <CardDescription>Histórico de acesso e tentativas</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                {/* Header da Tabela - Desktop */}
                <div className="sticky top-0 hidden border-b border-border bg-card/95 backdrop-blur-3xl sm:grid sm:grid-cols-4 sm:gap-4 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium uppercase text-muted-foreground">Horário</span>
                    <span className="text-xs font-medium uppercase text-muted-foreground">Usuário</span>
                    <span className="text-xs font-medium uppercase text-muted-foreground">TAG ID</span>
                    <span className="text-xs font-medium uppercase text-muted-foreground">Status</span>
                </div>

                {/* Lista de Eventos */}
                <div className="flex-1 min-h-0 max-h-150 lg:max-h-none overflow-y-auto pr-1" style={{ scrollbarGutter: 'stable' }}>
                    {logs.map((log, index) => (
                        <div key={log.id} className={cn("border-b border-border/50 p-4 transition-colors hover:bg-secondary/50", index === 0 && "bg-primary/5")}>
                            {/* Mobile Layout */}
                            <div className="flex flex-col gap-2 sm:hidden">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm text-muted-foreground">{log.time}</span>
                                    <StatusBadge status={log.status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground">{log.user}</span>
                                    <span className="font-mono text-xs text-primary">{log.tagId}</span>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
                                <span className="font-mono text-sm text-muted-foreground">{log.time}</span>
                                <span className="font-medium text-foreground">{log.user}</span>
                                <span className="font-mono text-sm text-primary">{log.tagId}</span>
                                <StatusBadge status={log.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({status}){
const badgeStyle = "lg:w-25 justify-center shadow-sm"

    if(status === "success"){
        return(
            <Badge className={cn(badgeStyle, "bg-success/20 text-success")}>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Autorizado
            </Badge>
        )
    }

    return(
        <Badge className={cn(badgeStyle, "bg-destructive/20 text-destructive")}>
            <XCircle className="mr-1 h-3 w-3" />
            Negado
        </Badge>
    )
}
