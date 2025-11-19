import { Search, Bell, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  userName?: string;
}

export const TopBar = ({ userName = "Talia" }: TopBarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Welcome Message */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Welcome {userName},</h2>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mx-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 bg-background border-border"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
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
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
};
