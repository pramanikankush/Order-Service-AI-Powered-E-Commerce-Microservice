import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, Package, FileText, LayoutGrid, Zap } from "lucide-react";
import { useUi } from "../store";
import { cn } from "../utils/cn";

export function Navbar() {
  const { backendReady } = useUi();
  const loc = useLocation();
  const isLanding = loc.pathname === "/";

  const navItems = [
    { to: "/products", label: "Products", icon: Package },
    { to: "/cart", label: "Cart", icon: ShoppingBag },
    { to: "/orders", label: "Orders", icon: FileText },
  ];

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 mx-auto mt-4 w-[min(1200px,calc(100%-2rem))] rounded-full border border-zinc-200/70 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-sm">
            <Sparkles size={14} />
          </div>
          <span className="text-sm font-semibold tracking-tight">Order<span className="text-zinc-400">Service</span></span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-zinc-200/70 bg-white/70 px-1.5 py-1 md:flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                )
              }
            >
              <Icon size={14} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <StatusPill backendReady={backendReady} />
          {!isLanding && (
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 sm:flex"
            >
              <LayoutGrid size={12} /> Landing
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function StatusPill({ backendReady }: { backendReady: boolean | null }) {
  if (backendReady === null) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500">
        <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
        Connecting…
      </div>
    );
  }
  if (backendReady) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <Zap size={12} /> Live API
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
      <span className="size-1.5 rounded-full bg-amber-500" /> Demo mode
    </div>
  );
}
