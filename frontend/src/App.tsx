import { BrowserRouter } from "react-router"
import { AppRouter } from "@/router";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
  )
}

export default App
