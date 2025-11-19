import { ReactNode } from "react";
import { Home, Calendar, BookOpen, GraduationCap, TrendingUp, Megaphone } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Schedule", icon: Calendar, path: "/schedule" },
  { name: "Courses", icon: BookOpen, path: "/courses" },
  { name: "Gradebook", icon: GraduationCap, path: "/gradebook" },
  { name: "Performance", icon: TrendingUp, path: "/performance" },
  { name: "Announcement", icon: Megaphone, path: "/announcement" },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-teal-dark to-teal-medium shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Coligo</h1>
        </div>
        
        <nav className="mt-6 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition-all duration-200",
                  "hover:bg-white hover:text-teal-medium"
                )}
                activeClassName="bg-white text-teal-medium shadow-sm"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
