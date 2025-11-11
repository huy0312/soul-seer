
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import GameLanding from "./pages/GameLanding";
import GameLobby from "./pages/GameLobby";
import GameQuestions from "./pages/GameQuestions";
import GameRoom from "./pages/GameRoom";
import GameHost from "./pages/GameHost";
import GameResults from "./pages/GameResults";
import GameJoinNew from "./pages/GameJoinNew";
import GameCreate from "./pages/GameCreate";
import GameIntro from "./pages/GameIntro";
import GamePlay from "./pages/GamePlay";
import Auth from "./pages/Auth";
import CharacterSelection from "./pages/CharacterSelection";
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
            <Route path="/" element={<GameLanding />} />
            <Route path="/game/join/:code" element={<GameJoinNew />} />
            <Route path="/game/join" element={<GameJoinNew />} />
            <Route path="/game/create" element={<GameCreate />} />
            <Route path="/game/lobby/:code" element={<GameLobby />} />
            <Route path="/game/questions/:code" element={<GameQuestions />} />
            <Route path="/game/room/:code" element={<GameRoom />} />
            <Route path="/game/host/:code" element={<GameHost />} />
            <Route path="/game/results/:code" element={<GameResults />} />
            <Route path="/game/intro/:code" element={<GameIntro />} />
            <Route path="/game/play/:code" element={<GamePlay />} />
            <Route path="/game/character/:code" element={<CharacterSelection />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
