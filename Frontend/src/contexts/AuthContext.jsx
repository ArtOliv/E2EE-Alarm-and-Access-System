import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({children}){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        api.get("/verify") // Verifica sessão no Backend
            .then((response) => {
                setUser(response.data.user);
                setIsAuthenticated(true);
            })
            .catch(() => { // Se capturar erro, sem cookie ou expirou
                setIsAuthenticated(false);
                setUser(null);
            })
            .finally(() => {
                setIsCheckingSession(false);
            })
    }, []);

    // Função para autenticar o login
    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    // Função para logout
    const logout = async () => {
        try{
            await api.post("/logout");
        } catch(err){
            console.error("Erro ao fazer logout", err);
        } finally{
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return(
        <AuthContext.Provider value={{isAuthenticated, isCheckingSession, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}