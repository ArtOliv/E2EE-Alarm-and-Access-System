import { useState, useEffect } from "react"
import { X, LogOut, Key, UserCircle, ShieldCheck, Plus, UserPlus, Trash2, Users } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { cn } from "../lib/utils"
import { api } from "../services/api"

export default function UserProfileSidebar({isOpen, onClose}){
    const {user, logout} = useAuth()

    // Estados para alteração de senha
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [message, setMessage] = useState({text: "", type: ""})
    const [isLoading, setIsLoading] = useState(false)

    // Estados para adicionar admins
    const [showAdminForm, setShowAdminForm] = useState(false)
    const [newAdmin, setNewAdmin] = useState({name: "", email: "", password: "", rfid_tag: ""})
    const [adminMessage, setAdminMessage] = useState({text: "", type: ""})
    const [isAdminLoading, setIsAdminLoading] = useState(false)

    // Estados para Lista de admins
    const [adminList, setAdminList] = useState([])

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (adminMessage.text) {
            const timer = setTimeout(() => {
                setAdminMessage({ text: "", type: "" });
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [adminMessage]);

    useEffect(() => {
        if(isOpen && user?.role === "MASTER"){
            fetchAdmins()
        }
    }, [isOpen, user])

    const fetchAdmins = async () => {
        try{
            const response =await api.get("/users/admins")
            setAdminList(response.data)
        } catch(error){
            console.error("Erro ao buscar admins:", error)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({text: "", type: ""})

        try{
            const response = await api.put("/auth/update-password", {oldPassword, newPassword})
            setMessage({text: response.data.message, type: "success"})
        } catch(error){
            setMessage({text: error.response?.data?.error || "Erro ao atualizar senha", type: "error"})
        } finally {
            setOldPassword("")
            setNewPassword("")
            setIsLoading(false)
        }
    }

    const handleCreateAdmin = async (e) => {
        e.preventDefault()
        setIsAdminLoading(true)
        setAdminMessage({text: "", type: ""})

        try{
            const response = await api.post("/users/create-admin", newAdmin)
            setAdminMessage({text: response.data.message, type: "success"})
            fetchAdmins()
        } catch(error){
            setAdminMessage({text: error.response?.data?.error || "Erro ao criar administrador", type: "error"})
        } finally {
            setNewAdmin({name: "", email: "", password: "", rfid_tag: ""})
            setIsAdminLoading(false)
        }
    }

    const handleDeleteAdmin = async (id) => {
        if(!window.confirm("Tem certeza que deseja excluir este administrador?")) return

        try{
            await api.delete(`/users/admin/${id}`)
            setAdminList(adminList.filter(admin => admin._id !== id))
        } catch(error){
            console.error("Erro ao excluir administrador:", error)
            alert("Não foi possível excluir o administrador.")
        }
    }

    return(
        <>
            <div className={cn("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300", isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")} onClick={onClose} />
            
            <div className={cn("fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl z-50 p-6 flex flex-col transition-transform duration-300 ease-in-out", isOpen ? "translate-x-0" : "translate-x-full")}>
                {/* Header da Sidebar */}
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <UserCircle className="text-primary" />
                        Perfil
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                {/* Informação do Usuário */}
                <div className="bg-secondary/30 rounded-lg p-4 mb-8 border-b border-border/50">
                    <p className="text-lg font-semibold text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                    <div className="inline-flex items-center gap-1.5 bg-primary/15 text-primary text-xs px-2.5 py-1 rounded-full font-medium border border-primary/20">
                        <ShieldCheck size={14} />
                        {user.role === "MASTER" ? "Administrador Mestre" : "Administrador"}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    {/* Atualização de senha */}
                    <div className="shrink-0">
                        <div className="flex items-center justify-between mb-4 border-t border-border/50 pt-6">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Key size={16} className="text-muted-foreground" />
                                Alterar senha
                            </h3>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                            >
                                <Plus className={cn("h-4 w-4 transition-transform duration-200", showPasswordForm ? "rotate-45" : "")} />
                            </Button>
                        </div>

                        <div className={cn("grid transition-all duration-300 ease-in-out", showPasswordForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                            <div className="overflow-hidden p-1">
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {message.text && (
                                        <div className={cn("p-3 rounded text-sm", message.type === "success" ? "bg-success/15 text-success border border-success/20" : "bg-destructive/15 text-destructive border border-destructive/20")}>
                                            {message.text}
                                        </div>
                                    )}
                                    <Input
                                        type="password"
                                        placeholder="Senha Atual"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Nova Senha"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" disabled={isLoading || !oldPassword || !newPassword} className="w-full cursor-pointer">
                                        {isLoading ? "Atualizando..." : "Mudar Senha"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    {/* Configurações do Admin Mestre */}
                    {user?.role === "MASTER" && (
                        <div className="flex-1 flex flex-col min-h-0 mb-4 pt-4">
                            {/* Adicionar Administrador */}
                            <div className="flex items-center justify-between mb-4 h-9">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <UserPlus size={16} className="text-muted-foreground" />
                                    Adicionar Administrador
                                </h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowAdminForm(!showAdminForm)}
                                    className="border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                                >
                                    <Plus className={cn("h-4 w-4 transition-transform duration-200", showAdminForm ? "rotate-45" : "")} />
                                </Button>
                            </div>

                            <div className={cn("grid transition-all duration-300 ease-in-out", showAdminForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                                <div className="overflow-hidden p-1">
                                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                                        {adminMessage.text && (
                                            <div className={cn("p-3 rounded text-sm", adminMessage.type === "success"? "bg-success/15 text-success border border-success/20" : "bg-destructive/15 text-destructive border border-destructive/20")}>
                                                {adminMessage.text}
                                            </div>
                                        )}
                                        <Input
                                            placeholder="Nome do Administrador"
                                            value={newAdmin.name}
                                            onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                                            required
                                        />
                                        <Input
                                            type="email"
                                            placeholder="E-mail"
                                            value={newAdmin.email}
                                            onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                                            required
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Senha Provisória"
                                            value={newAdmin.password}
                                            onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                            required
                                        />
                                        <Input
                                            placeholder="Tag ID (Opcional)"
                                            maxLength="8"
                                            value={newAdmin.rfid_tag}
                                            onChange={(e) => setNewAdmin({...newAdmin, rfid_tag: e.target.value})}
                                            className="font-mono uppercase"
                                        />
                                        <Button type="submit" disabled={isAdminLoading || !newAdmin.name || !newAdmin.email || !newAdmin.password} className="w-full cursor-pointer">
                                            {isAdminLoading ? "Cadastrando..." : "Cadastrar Admin"}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                            
                            {/* Tabela de Administradores Cadastrados */}
                            <div className="flex-1 flex flex-col mt-2 pt-5 border-t border-border/50 min-h-0">
                                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 shrink-0">
                                    <Users size={16} />
                                    Admins Ativos ({adminList.length})
                                </h4>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 pb-2">
                                    {adminList.map((admin) => (
                                        <div key={admin._id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{admin.name}</span>
                                                <span className="text-xs text-muted-foreground">{admin.email}</span>
                                                {admin.rfid_tag ? (
                                                    <span className="font-mono text-xs text-primary mt-1">{admin.rfid_tag}</span>
                                                ) : (
                                                    <span className="h-4 mt-1"></span>
                                                )}
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteAdmin(admin._id)}
                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {adminList.length === 0 && (
                                        <p className="text-xs text-center text-muted-foreground py-2">Nenhum administrador adicional.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Botão de Logout */}
                <div className="pt-6 border-t border-border/50 mt-auto">
                    <Button variant="ghost" onClick={logout} className="w-full text-destructive hover:bg-destructive/15 hover:text-destructive flex items-center gap-2 cursor-pointer">
                        <LogOut size={18} />
                        Sair
                    </Button>
                </div>
            </div>
        </>
    )
}