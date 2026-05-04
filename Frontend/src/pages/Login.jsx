import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"
import LoginManager from "../components/LoginManager"

export default function Login(){
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleLogin = async (email, password) => {
        setIsLoading(true)
        setError("")

        try{
            const response = await api.post("/login", {email, password});

            console.log("Sucesso:", response.data.message);

            navigate("/");
        } catch(error){
            if(error.response && error.response.data){
                setError(error.response.data.error || "Erro de autenticação");
            } else {
                setError("Não foi possível conectar ao servidor.");
                console.error("Erro de requisição:", error);
            }
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <LoginManager isLoading={isLoading} onLogin={handleLogin} error={error} />
    )
}