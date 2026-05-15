import { useState, useEffect, useRef } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"
import { Toast } from "./ui/Toast"
import { cn } from "../lib/utils"
import { api } from "../services/api"

export default function AlarmControl(){
    const [active, setActive] = useState(false)
    const [isWaitingAck, setIsWaitingAck] = useState(false)
    const [toast, setToast] = useState({show: false, message: "", type: "success"})
    const ackTimeoutRef = useRef(null)

    useEffect(() => {
        const fetchInitialStatus = async () => {
            try{
                const response = await api.get("/alarm/status")
                setActive(response.data.isArmed)
            } catch(error){
                console.error("Erro ao buscar status inicial do alarme")
            }
        }
        fetchInitialStatus();

        const wsBaseUrl = import.meta.env.VITE_WS_URL
        const ws = new WebSocket(`${wsBaseUrl}/alarm/ws`)

        ws.onopen = () => {
            console.log("WebSocket conectado ao servidor.")
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if(data.event === "cmd_ack"){
                if(ackTimeoutRef.current){
                    clearTimeout(ackTimeoutRef.current)
                }

                if(data.cmd === "ARM"){
                    setActive(true)
                    setToast({show: true, message: "Alarme ativado com sucesso!", type: "success"})
                } else if(data.cmd === "DISARM"){
                    setActive(false);
                    setToast({show: true, message: "Alarme desativado com sucesso!", type: "success"})
                }
                setIsWaitingAck(false)
            }
        }

        ws.onerror = (error) => {
            console.error("Erro no WebSocket:", error)
        }

        return () => {
            if(ws && (ws.readyState === 1 || ws.readyState === 0)){
                ws.close()
            }
            if(ackTimeoutRef.current){
                clearTimeout(ackTimeoutRef.current)
            }
        }
    }, [])

    const handleToggle = async () => {
        setIsWaitingAck(true)
        const commandToSend = active ? "DISARM" : "ARM"

        try{
            await api.post("/alarm/command", {cmd: commandToSend})

            ackTimeoutRef.current = setTimeout(() => {
                setIsWaitingAck(false)
                setToast({show: true, message: "Tempo limite excedido: Sem resposta.", type: "error"})
            }, 5000)
        } catch(error){
            setToast({show: true, message: "Erro ao enviar o comando.", type: "error"})
            setIsWaitingAck(false)
        }
    }

    return(
        <>
            <Card className={cn("transition-colors duration-500", active ? "border-destructive/50 bg-destructive/10" : "border-success/50 bg-success/10")}>
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
                            "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500", 
                            active ? "bg-destructive/20" : "bg-success/20"
                        )}>
                            {isWaitingAck ? (
                                <Loader2 className={cn("h-10 w-10 animate-spin", active ? "text-destructive" : "text-success")} />
                            ) : active ? (
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
                                {isWaitingAck ? "Aguardando ESP32..." : (active ? "Armado" : "Desarmado")}
                            </span>
                        </p>
                        <Button 
                            onClick={handleToggle}
                            disabled={isWaitingAck}
                            className={cn("w-full transition-all duration-300", active ? "bg-destructive text-background hover:bg-destructive/90 cursor-pointer" : "bg-success text-background hover:bg-success/90 cursor-pointer")}
                        >
                            {active ? "Desativar Alarme" : "Ativar Alarme"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({...toast, show: false})}
            />
        </>
    )
}