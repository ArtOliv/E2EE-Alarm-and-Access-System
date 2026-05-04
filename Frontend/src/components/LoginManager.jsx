import { useState, useEffect } from "react"
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"

export default function LoginManager({isLoading, onLogin, error}){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        if(error){
            setPassword("")
        }
    }, [error])

    const handleSubmit = (e) => {
        e.preventDefault()
        onLogin(email, password)
    }

    return(
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            <Card className="w-full max-w-md relative z-10 border-border shadow-2xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-3 pb-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">Acesso Restrito</CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">Insira suas credenciais para acessar o sistema</CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="email" 
                                    placeholder="admin@sistema.com" 
                                    className="pl-10 bg-secondary/50 border-border/50 focus:border-primary" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="password" 
                                    placeholder="•••••••••" 
                                    className="pl-10 bg-secondary/50 border-border/50 focus:border-primary" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-4 cursor-pointer transition-all" disabled={isLoading || !email || !password}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}