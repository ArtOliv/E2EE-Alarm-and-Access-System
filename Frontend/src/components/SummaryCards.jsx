import { Activity, Users, ShieldAlert, Car } from "lucide-react";
import { Card, CardContent } from "./ui/Card"

export default function SummaryCards({todayAccesses, activeUsers, deniedAttempts}){
    return(
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Acessos Hoje</p>
                        <p className="text-2xl font-bold text-foreground">{todayAccesses}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                        <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                        <p className="text-2xl font-bold text-foreground">{activeUsers}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Alertas de Segurança</p>
                        <p className="text-2xl font-bold text-foreground">{deniedAttempts}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}