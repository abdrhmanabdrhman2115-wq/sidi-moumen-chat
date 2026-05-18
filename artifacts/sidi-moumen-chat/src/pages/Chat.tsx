import { useState, useRef, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useMessages, sendMessage, deleteMessage, useOnlineUsers } from "@/hooks/use-firestore-chat";
import { usePresence } from "@/hooks/use-presence";
import { Redirect } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import { Send, Trash2, Users, MessageSquare, Wifi } from "lucide-react";

export default function Chat() {
  const { user, isAuthenticated, isLoading: authLoading } = useFirebaseAuth();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading: messagesLoading } = useMessages();
  const onlineUsers = useOnlineUsers();

  usePresence(user);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <header className="h-16 border-b bg-card" />
        <div className="flex-1 flex">
          <div className="flex-1 p-4"><Skeleton className="h-full w-full" /></div>
          <div className="w-64 border-l p-4 hidden md:block"><Skeleton className="h-full w-full" /></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || sending) return;
    setSending(true);
    try {
      await sendMessage(user, content.trim());
      setContent("");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
  };

  const UsersList = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Online Neighbors</h3>
        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          {onlineUsers.length}
        </span>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2">No neighbors active recently.</p>
        ) : (
          <div className="space-y-1">
            {onlineUsers.map((ou) => (
              <div key={ou.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={ou.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {ou.displayName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{ou.displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    active {formatDistanceToNow(ou.lastActiveAt)} ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">

          {/* Live bar */}
          <div className="px-4 py-2 border-b bg-card/50 flex items-center gap-2 text-xs text-muted-foreground">
            <Wifi className="w-3.5 h-3.5 text-green-500" />
            <span>Live</span>
            <span className="mx-1 opacity-30">·</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              {onlineUsers.length} online
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth">
            {messagesLoading ? (
              <div className="space-y-6 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 max-w-2xl">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">No messages yet. Be the first to say hello!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isOwnMessage = user?.uid === msg.userId;
                  const prevMsg = messages[idx - 1];
                  const isSameSender = prevMsg?.userId === msg.userId;
                  const showHeader = !isSameSender;

                  return (
                    <div
                      key={msg.id}
                      data-testid={`message-${msg.id}`}
                      className={`flex gap-3 group ${isOwnMessage ? "flex-row-reverse" : "flex-row"} ${showHeader ? "mt-4" : "mt-0.5"}`}
                    >
                      <div className="w-10 shrink-0 flex items-end">
                        {showHeader && (
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={msg.userPhotoURL || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {msg.userDisplayName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className={`flex flex-col gap-0.5 max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                        {showHeader && (
                          <div className="flex items-baseline gap-2 px-1">
                            <span className="text-sm font-semibold text-foreground/90">
                              {isOwnMessage ? "You" : msg.userDisplayName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {format(msg.createdAt, "h:mm a")}
                            </span>
                          </div>
                        )}

                        <div className="relative group/msg flex items-center gap-2">
                          {isOwnMessage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`delete-message-${msg.id}`}
                              className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                              onClick={() => handleDelete(msg.id)}
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          <div className={`px-4 py-2 rounded-2xl text-[15px] leading-relaxed break-words ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                              : "bg-card border border-border/50 text-card-foreground rounded-bl-sm shadow-sm"
                          }`}>
                            {msg.content}
                          </div>

                          {!showHeader && (
                            <span className={`text-[10px] text-muted-foreground opacity-0 group-hover/msg:opacity-100 transition-opacity ${isOwnMessage ? "order-first" : ""}`}>
                              {format(msg.createdAt, "h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-background border-t">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <div className="md:hidden">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground relative" data-testid="button-online-users">
                      <Users className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                        {onlineUsers.length}
                      </span>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="p-4 pb-8 max-h-[80vh]">
                      <UsersList />
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              <form onSubmit={handleSend} className="flex-1 flex gap-2 relative">
                <Input
                  data-testid="input-message"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-card border-border/50 rounded-full pl-5 pr-14 h-12 text-[15px] shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50"
                  disabled={sending}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  data-testid="button-send"
                  className="absolute right-1.5 top-1 h-10 w-10 rounded-full shadow-sm"
                  disabled={!content.trim() || sending}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden md:flex w-72 border-l bg-card/30 flex-col p-4">
          <UsersList />
        </div>
      </div>
    </Layout>
  );
}
