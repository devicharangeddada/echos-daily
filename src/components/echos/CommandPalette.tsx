import { Command } from "lucide-react";
import { useEffect, useState } from "react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-xl apple-glass rounded-3xl overflow-hidden shadow-2xl scale-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Command className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Find tasks or settings..."
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="p-2 max-h-96 overflow-y-auto">
          <p className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Suggestions
          </p>
        </div>
      </div>
    </div>
  );
}
