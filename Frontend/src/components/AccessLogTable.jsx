import { useState, useEffect, useCallback, useRef } from "react"
import { Activity, CheckCircle2, XCircle, CircleMinus, ShieldAlert, CalendarDays, FilterX } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/Popover"
import { Calendar } from "./ui/Calendar"
import { FilterSelect } from "./ui/FilterSelect"
import { cn } from "../lib/utils"
import { api } from "../services/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AccessLogTable(){
    const [logs, setLogs] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // Estados para rolagem da tabela e filtros
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    // Estados para filtros
    const [filterType, setFilterType] = useState(() => {return localStorage.getItem("log_filter") || "access"})
    const [selectedDate, setSelectedDate] = useState({from: null, to:null})
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [onlyAlerts, setOnlyAlerts] = useState(false)
    
    const filterTypeRef = useRef(filterType)
    const selectedDateRef = useRef(selectedDate)
    const onlyAlertsRef = useRef(onlyAlerts)

    const filterOptions = [
        {id: "access", label: "Acessos"},
        {id: "command", label: "Comandos"},
        {id: "system", label: "Sistema"}
    ]
    
    useEffect(() => {filterTypeRef.current = filterType}, [filterType]);
    useEffect(() => {selectedDateRef.current = selectedDate}, [selectedDate]);
    useEffect(() => {onlyAlertsRef.current = onlyAlerts}, [onlyAlerts]);

    useEffect(() => {
        setPage(1)
        setHasMore(true)
        fetchLogs(1, filterType, selectedDate, true)
    }, [filterType, selectedDate, onlyAlerts])

    useEffect(() => {
        let isMounted = true;
        const wsBaseUrl = import.meta.env.VITE_WS_URL
        const ws = new WebSocket(`${wsBaseUrl}/logs/ws`)

        ws.onopen = () => {
            console.log("WebSocket conectado ao servidor.")
        }

        ws.onmessage = (event) => {
            if(!isMounted) return
            const data = JSON.parse(event.data)

            if(data.event === "new_log"){
                const newLog = data.log;

                const currentFilter = filterTypeRef.current
                const currentAlerts = onlyAlertsRef.current
                const currentDate = selectedDateRef.current

                const matchesType = (currentFilter === "access" && newLog.source === "LOG" && ["ADMIN", "USER", "UNKNOWN"].includes(newLog.role)) ||
                                    (currentFilter === "system" && newLog.source === "LOG" && newLog.role === "SYSTEM") ||
                                    (currentFilter === "command" && newLog.source === "COMMAND")

                const matchesAlert = !onlyAlerts || (newLog.status === "UNAUTHORIZED" || newLog.status === "ALARM_TRIGGERED")
                const isFilteringDate = !!selectedDate?.from

                if(matchesType && matchesAlert && !isFilteringDate){
                    setLogs(prev => [newLog, ...prev])
                }
            } else if(data.event === "cmd_ack"){
                setLogs(prev => prev.map(log =>
                    log.id === data.id ? {...log, status: data.status} : log
                ))
            }
        }

        return () => {
            isMounted = false
            if(ws && (ws.readyState === 1 || ws.readyState === 0)){
                ws.close()
            }
        }
    }, [])

    const fetchLogs = useCallback(async (pageNum, currentFilter, currentDate, reset = false) => {
        if(!hasMore && !reset) return
        setIsLoading(true)

        try{
            let url = `/logs?page=${pageNum}&limit=20&type=${currentFilter}`

            if(currentDate && currentDate.from){
                const start = new Date(currentDate.from)
                start.setHours(0, 0, 0, 0);
                url += `&startDate=${start.toISOString()}`

                const end = currentDate.to ? new Date(currentDate.to) : new Date(currentDate.from);
                end.setHours(23, 59, 59, 999);
                url += `&endDate=${end.toISOString()}`
            }

            const response = await api.get(url)
            let newLogs = response.data;

            if(onlyAlerts){
                newLogs = newLogs.filter(l => l.status === "UNAUTHORIZED" || l.status === "ALARM_TRIGGERED")
            }

            if(newLogs.length < 20 && !onlyAlerts){
                setHasMore(false)
            }

            setLogs(prev => reset ? newLogs : [...prev, ...newLogs])
        } catch(error){
            console.error("Erro ao buscar logs:", error)
        } finally {
            setIsLoading(false)
        }
    }, [hasMore, onlyAlerts])

    const handleFilterChange = (newType) => {
        setFilterType(newType)
        localStorage.setItem("log_filter", newType)
    }

    const handleScroll = (e) => {
        const {scrollTop, clientHeight, scrollHeight} = e.currentTarget
        if(scrollHeight - scrollTop <= clientHeight + 10 && !isLoading && hasMore){
            const nextPage = page + 1
            setPage(nextPage)
            fetchLogs(nextPage, filterType, false);
        }
    }

    const getCalendarButtonText = () => {
        if(!selectedDate?.from) return "Filtrar Data"

        if(!selectedDate.to || selectedDate.from.toDateString() === selectedDate.to.toDateString()){
            return format(selectedDate.from, "dd 'de' MMM", {locale: ptBR})
        }

        return `${format(selectedDate.from, "dd/MM")} até ${format(selectedDate.to, "dd/MM")}`
    }

    return(
        <Card className="flex flex-col h-auto lg:h-142 overflow-hidden">
            <CardHeader className="border-b border-border pb-4 shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Activity className="h-5 w-5 text-primary" />
                            Log de Eventos
                        </CardTitle>
                        <CardDescription>Histórico de acesso e tentativas</CardDescription>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <FilterSelect options={filterOptions} value={filterType} onChange={handleFilterChange} />

                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <button 
                                    className={cn(
                                        "flex items-center justify-center h-10 px-3 rounded-lg border transition-all duration-200 min-w-10 cursor-pointer",
                                        "bg-secondary/50 border-border text-muted-foreground hover:bg-background hover:text-foreground"
                                    )}
                                >
                                    <CalendarDays className="h-4 w-4 sm:mr-2 shrink-0" />
                                    <span className="hidden sm:inline text-xs font-medium">
                                        {getCalendarButtonText()}
                                    </span>
                                </button>
                            </PopoverTrigger>

                            <PopoverContent align="end" className="bg-background shadow-2xl border-border p-2">
                                <Calendar
                                    selected={selectedDate}
                                    onSelect={(range) => {setSelectedDate(range)}}
                                />
                                {selectedDate?.from && (
                                    <button
                                        onClick={() => {
                                            setSelectedDate({from: null, to: null})
                                            setIsCalendarOpen(false)
                                        }}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                                    >
                                        <FilterX className="h-3 w-3" />
                                        Limpar Filtro
                                    </button>
                                )}
                            </PopoverContent>
                        </Popover>
                        
                        <button
                            onClick={() => setOnlyAlerts(!onlyAlerts)}
                            className={cn(
                                "flex items-center justify-center h-10 w-10 sm:w-auto sm:px-3 rounded-lg border transition-all duration-200 cursor-pointer shrink-0",
                                onlyAlerts ? "bg-destructive/10 border-destructive/50 text-destructive shadow-sm" : "bg-secondary/50 border-border text-muted-foreground hover:bg-background hover:text-foreground"
                            )}
                            title="Apenas logs de alerta"
                        >
                            <ShieldAlert className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline text-xs font-medium">Alertas</span>
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                {/* Header da Tabela - Desktop */}
                <div className="sticky top-0 hidden border-b border-border bg-card/95 backdrop-blur-3xl sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 sm:py-3 z-10">
                    <span className="text-xs font-medium uppercase text-muted-foreground">Data/Hora</span>
                    <span className="text-xs font-medium uppercase text-muted-foreground">Usuário</span>
                    <span className="text-xs font-medium uppercase text-muted-foreground">Info</span>
                    <span className="text-xs font-medium uppercase text-muted-foreground">Status</span>
                </div>

                {/* Lista de Eventos */}
                <div className="flex-1 min-h-0 max-h-150 lg:max-h-none overflow-y-auto pr-1" style={{ scrollbarGutter: 'stable' }} onScroll={handleScroll}>
                    {logs.map((log) => (
                        <div key={log.id} className={cn("border-b border-border/50 px-4 py-3 transition-colors hover:bg-secondary/50 sm:px-6")}>
                            {/* Mobile Layout */}
                            <div className="flex flex-col gap-3 sm:hidden">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm text-muted-foreground">{log.date} às {log.time}</span>
                                    <ActionBadge status={log.status} state={log.state} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={cn("font-medium truncate", log.role === "UNKNOWN" ? "text-destructive" : (log.role === "ADMIN") ? "text-accent/80 font-semibold" : "text-primary-foreground/80")}>{log.user}</span>
                                    <span className="font-mono text-sm text-primary">{log.tagId !== "-" ? log.tagId : log.state}</span>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-primary-foreground/80  font-medium">{log.date}</span>
                                    <span className="font-mono text-xs text-muted-foreground">{log.time}</span>
                                </div>
                                <span className={cn("font-medium truncate", log.role === "UNKNOWN" ? "text-destructive" : (log.role === "ADMIN") ? "text-accent/80 font-semibold" : "text-primary-foreground/80")}>{log.user}</span>
                                <span className="font-mono text-sm text-primary">{log.tagId !== "-" ? log.tagId : log.state}</span>
                                <div className="flex"><ActionBadge status={log.status} state={log.state} /></div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-center items-center py-8 text-muted-foreground w-full">
                            Carregando...
                        </div>
                    )}

                    {!isLoading && logs.length === 0 && (
                        <div className="flex flex-col justify-center items-center py-12 text-muted-foreground w-full">
                            Nenhum log encontrado.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function ActionBadge({status, state}){
    if(status === "AUTHORIZED") return <Badge className={cn("sm:w-28 justify-center bg-success/20 text-success border-none shadow-none", state === "ARM" && "text-destructive bg-destructive/20")}><CheckCircle2 className="mr-1 h-3 w-3" /> {state === "ARM" ? "Armou" : state === "DISARM" ? "Desarmou" : "Autorizado"}</Badge>
    if(status === "UNAUTHORIZED") return <Badge className="sm:w-28 justify-center bg-destructive/20 text-destructive border-none shadow-none"><XCircle className="mr-1 h-3 w-3" /> Negado</Badge>
    if(status === "PENDING") return <Badge className="sm:w-28 justify-center text-warning bg-warning/20 border-none shadow-none"><CircleMinus className="mr-1 h-3 w-3" /> Pendente</Badge>
    if(status === "ALARM_TRIGGERED") return <Badge className="sm:w-28 justify-center bg-destructive/20 text-destructive border-none shadow-none"><ShieldAlert className="mr-1 h-3 w-3" /> DISPARADO</Badge>
    return <Badge className="sm:w-28 justify-center text-primary bg-primary/20"><ShieldAlert className="mr-1 h-3 w-3" /> {status}</Badge>
}