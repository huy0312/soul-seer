
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import GameHome from "./pages/GameHome";
import GameLobby from "./pages/GameLobby";
import GameQuestions from "./pages/GameQuestions";
import GameRoom from "./pages/GameRoom";
import GameResults from "./pages/GameResults";
import GameJoin from "./pages/GameJoin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GameHome />} />
            <Route path="/game/lobby/:code" element={<GameLobby />} />
            <Route path="/game/questions/:code" element={<GameQuestions />} />
            <Route path="/game/room/:code" element={<GameRoom />} />
            <Route path="/game/results/:code" element={<GameResults />} />
            <Route path="/game/join/:code" element={<GameJoin />} />
            <Route path="/game/join" element={<GameJoin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
