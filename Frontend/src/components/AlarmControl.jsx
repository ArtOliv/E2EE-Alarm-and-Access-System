import { Bell, BellOff, Car } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"
import { cn } from "../lib/utils"

export default function AlarmControl({active, onToggle}){
    return(
        <Card className={active ? "border-destructive/50 bg-destructive/10" : "border-success/50 bg-success/10"}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            {active ? (
                                <Bell className="h-5 w-5 text-destructive" />
                            ) : (
                                <BellOff className="h-5 w-5 text-success" />
                            )}
                            Controle Remoto
                        </CardTitle>
                        <CardDescription>Gerenciar sistema de alarme</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        "relative flex h-20 w-20 items-center justify-center rounded-full transition-all", 
                        active ? "bg-destructive/20" : "bg-success/20"
                    )}>
                        {active ? (
                            <>
                                <Bell className="absolute h-10 w-10 animate-ping text-destructive opacity-75" />
                                <Bell className="relative h-10 w-10 text-destructive" />
                            </>
                        ) : (
                            <BellOff className="h-10 w-10 text-success" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        <span className={active ? "font-medium text-destructive" : "text-success"}>
                            {active ? "Armado" : "Desarmado"}
                        </span>
                    </p>
                    <Button onClick={onToggle}
                        className={cn(
                            "w-full transition-all",
                            active
                                ? "bg-destructive text-background hover:bg-destructive/90 cursor-pointer"
                                : "bg-success text-background hover:bg-success/90 cursor-pointer"
                        )}
                    >
                        {active ? "Desativar Alarme" : "Ativar Alarme"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}