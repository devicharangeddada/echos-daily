import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavigationProvider, useNavigationState } from '@/hooks/use-navigation-state';
import { useIsMobile } from '@/hooks/use-mobile';
import DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimport DesktopSidebarimp  <CommandPalette />

      {!isMobile && (
        <aside className="w-72 h-full bg-card/30 backdrop-blur-3xl border-r border-white/10">
          <DesktopSidebar activeTab={activeTab} onChange={setActiveTab} />
        </aside>
      )}

      <main className="flex-1 h-full overflow-y-auto scroll-smooth-container">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-32 safe-area-bottom">
          <Routes>
            <Route path="/" element={<Index activeTab={activeTab} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      {isMobile && <BottomNav active={activeTab} onChange={setActiveTab} />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
