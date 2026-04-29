import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Perfil from "./pages/Perfil";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Editais from "./pages/Editais";
import Eventos from "./pages/Eventos";
import Academico from "./pages/Academico";
import Ouvidoria from "./pages/Ouvidoria";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/academico" element={<Academico />} />
          <Route path="/ouvidoria" element={<Ouvidoria />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/editais" element={<Editais />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
