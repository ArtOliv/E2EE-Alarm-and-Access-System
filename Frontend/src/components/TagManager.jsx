import { useState, useEffect } from "react"
import { Tag, Plus, Trash2, Users } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { cn } from "../lib/utils"
import { api } from "../services/api"

export default function TagManager(){
    // Estados para a lista de usuários
    const [membersList, setMembersList] = useState([])
    const [message, setMessage] = useState({text: "", type: ""})
    const [isLoading, setIsLoading] = useState(false)

    // Estados para adicionar usuários
    const [showForm, setShowForm] = useState(false)
    const [newMember, setNewMember] = useState({name: "", rfid_tag: ""})

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try{
            const response = await api.get("/users/members")
            setMembersList(response.data)
        } catch(error){
            console.error("Erro ao buscar usuários:", error)
        }
    }

    const handleCreateMember = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({text: "", type: ""})

        try{
            const response = await api.post("/users/create-member", newMember)
            setMessage({text: response.data.message, type: "success"})
            fetchMembers()
        } catch(error){
            setMessage({text: error.response?.data?.error || "Erro ao cadastrar usuário", type: "error"})
        } finally {
            setNewMember({name: "", rfid_tag: ""})
            setIsLoading(false)
        }
    }

    const handleDeleteMember = async (id) => {
        if(!window.confirm("Tem certeza que deseja excluir este usuário?")) return

        try{
            await api.delete(`/users/member/${id}`)
            setMembersList(membersList.filter(member => member._id !== id))
        } catch(error){
            console.error("Erro ao remover usuário:", error)
            alert("Não foi possível excluir o usuário.")
        }
    }

    return(
        <Card className="flex flex-col w-full h-71.5 min-h-0 overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Tag className="h-5 w-5 text-accent" />
                            Gerenciar Usuários
                        </CardTitle>
                        <CardDescription>Cadastrar e remover TAG IDs</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="border-accent/50 text-accent hover:bg-accent/10 cursor-pointer">
                        <Plus className={cn("h-4 w-4 transition-transform duration-200", showForm ? "rotate-45" : "")} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Formulário de Novos Usuários Autorizados */}
                <div className={cn("grid transition-all duration-300 ease-in-out shrink-0", showForm ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden p-1">
                        <form onSubmit={handleCreateMember} className="space-y-3 rounded-lg border border-border bg-secondary/30 p-3">
                            {message.text && (
                                <div className={cn("p-3 rounded text-sm", message.type === "success" ? "bg-success/15 text-success border border-success/20" : "bg-destructive/15 text-destructive border border-destructive/20")}>
                                    {message.text}
                                </div>
                            )}
                            <Input
                                placeholder="Nome do Usuário"
                                value={newMember.name}
                                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                required
                            />
                            <Input
                                placeholder="TAG ID (ex: A1B2C3D4)"
                                maxLength="8"
                                value={newMember.rfid_tag}
                                onChange={(e) => setNewMember({...newMember, rfid_tag: e.target.value})}
                                className="font-mono uppercase"
                                required
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !newMember.name.trim() || !newMember.rfid_tag.trim()}
                                className="w-full bg-accent text-background hover:bg-accent/90 cursor-pointer"
                            >
                                {isLoading ? "Cadastrando..." : "Cadastrar Tag"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Lista de Usuários Autorizados */}
                <div className="flex-1 flex flex-col min-h-0 pt-2">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 shrink-0">
                        <Users size={16} />
                        Membros Ativos ({membersList.length})
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2 pb-2">
                        {membersList.map((member) => (
                            <div key={member._id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                                    <span className="font-mono text-xs text-primary">{member.rfid_tag}</span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteMember(member._id)}
                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/20 hover:text-destructive cursor-pointer shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {membersList.length === 0 && (
                            <p className="text-xs text-center text-muted-foreground py-2">Nenhum usuário cadastrado.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}