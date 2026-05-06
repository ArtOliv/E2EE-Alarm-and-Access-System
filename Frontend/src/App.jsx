import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Protege rotas
function PrivateRoute({children}){
  const {isAuthenticated, isCheckingSession} = useAuth();

  if(isCheckingSession){
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Verificando sessão...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes(){
  const {isAuthenticated} = useAuth();

  return(
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      {/* Rota Privada */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
    </Routes>
  )
}

export default function App(){
  return(
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}