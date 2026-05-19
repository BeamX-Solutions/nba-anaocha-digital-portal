import { useState, useEffect, useRef } from "react";
import { Search, ClipboardList, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  approved: "text-green-600",
  rejected: "text-red-500",
  pending:  "text-yellow-600",
};

const HeaderSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || !user) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("service_applications")
        .select("id, service_type, status, created_at")
        .eq("user_id", user.id)
        .or(`service_type.ilike.%${query}%,status.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(5);
      setResults(data || []);
      setOpen(true);
      setLoading(false);
    }, 300);
  }, [query, user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleSelect = () => {
    setOpen(false);
    setQuery("");
    navigate("/anaocha/applications");
  };

  return (
    <div className="relative flex-1 max-w-sm mx-auto hidden md:block" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        placeholder="Search applications..."
        className="w-full h-9 pl-9 pr-8 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:bg-primary-foreground/15 focus:border-primary-foreground/40 transition-all"
      />
      {query && (
        <button
          aria-label="Clear search"
          onClick={() => { setQuery(""); setOpen(false); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-background border border-border/60 rounded-md shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">No applications found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground/60">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((app) => (
                <button
                  key={app.id}
                  onClick={handleSelect}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-t border-border/40 first:border-0 text-left"
                >
                  <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground leading-snug truncate">
                      {SERVICE_LABELS[app.service_type] || app.service_type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(app.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-[10px] tracking-wider uppercase font-semibold shrink-0 mt-1 capitalize ${STATUS_COLORS[app.status] ?? "text-muted-foreground"}`}>
                    {app.status}
                  </span>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-border/40 bg-muted/20">
                <button onClick={handleSelect} className="text-[11px] tracking-wider uppercase font-semibold text-primary hover:text-accent transition-colors">
                  View all applications →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
