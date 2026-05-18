import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useChatStats } from "@/hooks/use-firestore-chat";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { Redirect } from "wouter";

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, login, loginError } = useFirebaseAuth();
  const stats = useChatStats();

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/chat" />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center relative z-10 py-12">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20 mb-6 transform rotate-3">
              <span className="text-primary-foreground font-bold text-3xl transform -rotate-3">SM</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Welcome to Sidi Moumen Community Chat
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Your neighborhood digital café. Connect with neighbors, share local news, and stay in touch with the vibrant Sidi Moumen community in Casablanca.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-3xl font-bold text-primary">
                  {stats.totalMembers}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-1.5 font-medium">
                  <Users className="w-4 h-4" /> Neighbors
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-3xl font-bold text-primary">
                  {stats.totalMessages}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-1.5 font-medium">
                  <MessageSquare className="w-4 h-4" /> Total Messages
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-3xl font-bold text-accent">
                  {stats.messagesLast24h}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4" /> Last 24h
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Login error */}
          {loginError && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm text-left whitespace-pre-line">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{loginError}</p>
            </div>
          )}

          <Button
            size="lg"
            data-testid="button-login"
            className="text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            onClick={login}
          >
            Log in with Google
          </Button>
        </div>
      </main>
    </div>
  );
}
