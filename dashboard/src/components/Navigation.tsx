import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gamepad2, Info, Newspaper, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: "/", label: t("navigation.game"), icon: Gamepad2 },
    { path: "/context", label: t("navigation.contextInfo"), icon: Info },
    { path: "/media", label: t("navigation.media"), icon: Newspaper },
    {
      path: "/social",
      label: t("navigation.socialMedia"),
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon data-icon="inline-start" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-1 text-xs font-medium transition-colors min-w-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="truncate w-full text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div className="flex flex-col items-center justify-center flex-1 py-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}
