import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={`w-full ${isMobile ? 'pb-24' : 'ml-64 px-12'}`}>
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Layout>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
