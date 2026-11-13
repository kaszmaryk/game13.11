import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DiscussionTimer, DiscussionTimerMobile } from "@/components/DiscussionTimer";
import { LoadingState } from "@/components/LoadingState";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/hooks/useGameContext";

const GamePage = lazy(() => import("@/pages/GamePage").then(m => ({ default: m.GamePage })));
const ContextInfoPage = lazy(() => import("@/pages/ContextInfoPage").then(m => ({ default: m.ContextInfoPage })));
const MediaPage = lazy(() => import("@/pages/MediaPage").then(m => ({ default: m.MediaPage })));
const SocialMediaPage = lazy(() => import("@/pages/SocialMediaPage").then(m => ({ default: m.SocialMediaPage })));

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <DiscussionTimer />
      <main className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-7xl pb-28 md:pb-8">
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/" element={<GamePage />} />
            <Route path="/context" element={<ContextInfoPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/social" element={<SocialMediaPage />} />
          </Routes>
        </Suspense>
      </main>
      <DiscussionTimerMobile />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/game13.11">
      <TooltipProvider>
        <GameProvider>
          <AppLayout />
        </GameProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
