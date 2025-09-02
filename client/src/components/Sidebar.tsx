import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  PieChart, 
  Receipt, 
  PiggyBank, 
  TrendingUp, 
  Target, 
  Settings, 
  Bot, 
  LogOut,
  Wallet
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [location] = useLocation();

  const navigation = [
    { name: t("nav.dashboard"), href: "/", icon: PieChart },
    { name: t("nav.expenses"), href: "/expenses", icon: Receipt },
    { name: t("nav.budgets"), href: "/budgets", icon: PiggyBank },
    { name: t("nav.analytics"), href: "/analytics", icon: TrendingUp },
    { name: t("nav.goals"), href: "/goals", icon: Target },
    { name: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  const sidebarClasses = cn(
    "fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg z-40 transition-transform duration-300",
    isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
  );

  return (
    <aside className={sidebarClasses}>
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground" data-testid="text-app-title">{t("app.title")}</h2>
            <p className="text-xs text-muted-foreground">Financial tracking</p>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mb-6">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover" 
            data-testid="img-user-profile"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate" data-testid="text-user-name">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
            </p>
            <p className="text-sm text-muted-foreground truncate" data-testid="text-user-email">
              {user?.email}
            </p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={isMobile ? onClose : undefined}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`button-nav-${item.href.slice(1) || 'dashboard'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom Actions */}
      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <button 
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
          data-testid="button-ai-advisor"
        >
          <Bot className="w-5 h-5" />
          <span>{t("nav.aiAdvisor")}</span>
        </button>
        <a 
          href="/api/logout"
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          data-testid="link-logout"
        >
          <LogOut className="w-5 h-5" />
          <span>{t("auth.logout")}</span>
        </a>
      </div>
    </aside>
  );
}
