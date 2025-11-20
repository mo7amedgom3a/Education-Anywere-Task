import { Search, Bell, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface TopBarProps {
  userName?: string;
}

export const TopBar = ({ userName = "Talia" }: TopBarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("dashboard");
  const currentLang = i18n.language === "ar" ? "ar" : "en";

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Welcome Message */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            {t("topBar.welcome", { name: userName })}
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mx-8">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${
              currentLang === "ar" ? "right-3" : "left-3"
            }`}
          />
          <Input
            type="text"
            placeholder={t("topBar.searchPlaceholder")}
            className={`bg-background border-border ${
              currentLang === "ar" ? "pr-10 text-right" : "pl-10"
            }`}
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">{t("topBar.languageLabel")}</span>
            {(["en", "ar"] as const).map((lng) => (
              <Button
                key={lng}
                variant={currentLang === lng ? "default" : "outline"}
                size="sm"
                className="px-3 py-1"
                onClick={() => i18n.changeLanguage(lng)}
              >
                {t(`topBar.languageShort.${lng}`)}
              </Button>
            ))}
          </div>

          <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
            <Bell className="h-5 w-5 text-text-secondary" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-turquoise rounded-full"></span>
          </button>
          
          <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
            <Mail className="h-5 w-5 text-text-secondary" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-turquoise rounded-full"></span>
          </button>

          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            {t("topBar.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
};
