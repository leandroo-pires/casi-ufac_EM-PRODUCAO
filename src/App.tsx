import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Perfil from "./pages/Perfil";
import PerfilPublico from "./pages/PerfilPublico";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Editais from "./pages/Editais";
import Eventos from "./pages/Eventos";
import Academico from "./pages/Academico";
import MatrizCurricular from "./pages/MatrizCurricular";
import CalendarioAcademico from "./pages/CalendarioAcademico";
import Documentos from "./pages/Documentos";
import Ouvidoria from "./pages/Ouvidoria";
import Comunidade from "./pages/Comunidade";
import Acervo from "./pages/Acervo";
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
          <Route path="/perfil/:id" element={<PerfilPublico />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/academico" element={<Academico />} />
          <Route path="/academico/matriz" element={<MatrizCurricular />} />
          <Route path="/academico/calendario" element={<CalendarioAcademico />} />
          <Route path="/academico/documentos" element={<Documentos />} />
          <Route path="/ouvidoria" element={<Ouvidoria />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/editais" element={<Editais />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
