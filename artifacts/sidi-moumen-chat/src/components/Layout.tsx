import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Moon, Sun } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useFirebaseAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SM</span>
            </div>
            <h1 className="font-bold text-lg tracking-tight hidden sm:block">
              Sidi Moumen Community Chat
            </h1>
            <h1 className="font-bold text-lg tracking-tight sm:hidden">
              Sidi Moumen
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.displayName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user.displayName?.split(" ")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                  title="Log out"
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
