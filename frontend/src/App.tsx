import { BrowserRouter } from "react-router";
import { ThemeProvider as EduThemeProvider } from "@/hooks/useTheme";
import { AppRouter } from "@/router";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <EduThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </EduThemeProvider>
  );
}

export default App
