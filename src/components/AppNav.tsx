import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AppNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground/70 hover:bg-muted hover:text-foreground",
    );

  return (
    <nav className="flex items-center justify-center gap-2 py-4">
      <NavLink to="/" className={linkClass} end>
        Start
      </NavLink>
      <NavLink to="/rezepte" className={linkClass}>
        Rezepte
      </NavLink>
    </nav>
  );
}
