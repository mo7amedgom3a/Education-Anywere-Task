import { ReactNode } from "react";
import { Home, Calendar, BookOpen, GraduationCap, TrendingUp, Megaphone } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { t, i18n } = useTranslation("dashboard");
  const navItems = [
    { label: t("layout.nav.dashboard"), icon: Home, path: "/" },
    { label: t("layout.nav.schedule"), icon: Calendar, path: "/schedule" },
    { label: t("layout.nav.courses"), icon: BookOpen, path: "/courses" },
    { label: t("layout.nav.gradebook"), icon: GraduationCap, path: "/gradebook" },
    { label: t("layout.nav.performance"), icon: TrendingUp, path: "/performance" },
    { label: t("layout.nav.announcement"), icon: Megaphone, path: "/announcement" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background" dir={i18n.dir()} lang={i18n.language}>
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-teal-dark to-teal-medium shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">{t("layout.brand")}</h1>
        </div>
        
        <nav className="mt-6 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition-all duration-200",
                  "hover:bg-white hover:text-teal-medium"
                )}
                activeClassName="bg-white text-teal-medium shadow-sm"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
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
