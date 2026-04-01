import { useEffect, useState } from "react";
import { Mail, MailOpen, ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminContacts = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, []);

  const toggleExpand = async (msg: any) => {
    if (expanded === msg.id) {
      setExpanded(null);
      return;
    }
    setExpanded(msg.id);
    if (!msg.read) {
      await supabase.from("contact_messages").update({ read: true }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const toggleRead = async (msg: any) => {
    const newRead = !msg.read;
    const { error } = await supabase.from("contact_messages").update({ read: newRead }).eq("id", msg.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: newRead } : m));
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No contact messages yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <Card key={msg.id} className={`shadow-card transition-shadow ${!msg.read ? "border-l-4 border-l-primary" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {msg.read
                        ? <MailOpen className="h-5 w-5 text-muted-foreground" />
                        : <Mail className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${!msg.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {msg.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{msg.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!msg.read && <Badge>Unread</Badge>}
                          <p className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => toggleExpand(msg)}>
                            {expanded === msg.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {expanded === msg.id && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-muted/50 rounded-md p-4 text-sm text-foreground whitespace-pre-wrap">
                            {msg.message}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toggleRead(msg)}>
                              {msg.read ? "Mark as Unread" : "Mark as Read"}
                            </Button>
                            <a href={`mailto:${msg.email}`}>
                              <Button size="sm">
                                <Mail className="h-4 w-4 mr-1" /> Reply via Email
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
