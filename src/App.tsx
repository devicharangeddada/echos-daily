import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DesktopSidebar from "./components/echos/DesktopSidebar";
import BottomNav from "./components/echos/BottomNav";
import { useState } from "react";

const queryClient = new QueryClient();

const Layout = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      {!isMobile && (
        <DesktopSidebar activeTab={activeTab} onChange={setActiveTab} />
      )}

      <main
        className={`relative flex-1 overflow-y-auto ${
          isMobile ? "pb-28 pt-6 px-4 sm:px-6" : "pb-8 pt-8 px-6 md:px-8"
        }`}
      >
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col">
          <Routes>
            <Route
              path="/"
              element={<Index activeTab={activeTab} onChange={setActiveTab} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      {isMobile && <BottomNav active={activeTab} onChange={setActiveTab} />}
      <Toaster />
      <Sonner />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Layout />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
