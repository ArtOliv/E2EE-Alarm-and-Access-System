import { useState } from "react";
import { X, LogOut, Key, UserCircle, ShieldCheck, Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { api } from "../services/api";

export default function UserProfileSidebar({isOpen, onClose}){
    const {user, logout} = useAuth();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState({text: "", type: ""});
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({text: "", type: ""});

        try{
            const response = await api.put("/update-password", {oldPassword, newPassword});
            setMessage({text: response.data.message, type: "success"});
            setOldPassword("");
            setNewPassword("");
        } catch(error){
            setMessage({text: error.response?.data?.error || "Erro ao atualizar senha", type: "error"});
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <>
            <div className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`} onClick={onClose} />
            
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl z-50 p-6 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <UserCircle className="text-primary" />
                        Perfil
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-secondary/30 rounded-lg p-4 mb-8 border border-border/50">
                    <p className="text-lg font-semibold text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                    <div className="inline-flex items-center gap-1.5 bg-primary/15 text-primary text-xs px-2.5 py-1 rounded-full font-medium border border-primary/20">
                        <ShieldCheck size={14} />
                        {user.role === "MASTER" ? "Administrador Mestre" : "Administrador"}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
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
                            <Plus className="h-4 w-4 transition-transform duration-200" />
                        </Button>
                    </div>

                    <div className={`grid transition-all duration-300 ease-in-out ${showPasswordForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden p-1">
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {message.text && (
                                    <div className={`p-3 rounded text-sm ${message.type === "success"? "bg-success/15 text-success border border-success/20" : "bg-destructive/15 text-destructive border border-destructive/20"}`}>
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