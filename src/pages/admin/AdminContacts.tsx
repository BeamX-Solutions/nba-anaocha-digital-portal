import { useEffect, useState } from "react";
import { Mail, MailOpen, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminContacts = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reply dialog
  const [replyTarget, setReplyTarget] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setMessages(data || []);
        setLoading(false);
      });
  }, []);

  const toggleExpand = async (msg: any) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
    if (!msg.read) {
      const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", msg.id);
      if (!error) setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const toggleRead = async (msg: any) => {
    const newRead = !msg.read;
    const { error } = await supabase.from("contact_messages").update({ read: newRead }).eq("id", msg.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: newRead } : m));
  };

  const openReply = (msg: any) => {
    setReplyTarget(msg);
    setReplyText("");
  };

  const sendReply = async () => {
    if (!replyTarget || !replyText.trim()) return;
    setSending(true);

    // Send via Edge Function
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        type: "contact_reply",
        to: replyTarget.email,
        name: replyTarget.full_name,
        reply_message: replyText.trim(),
        original_message: replyTarget.message,
      },
    });

    if (error) {
      toast({ title: "Failed to send reply", description: "Email could not be delivered. Try again.", variant: "destructive" });
      setSending(false);
      return;
    }

    // Save reply record against the contact message
    await supabase
      .from("contact_messages")
      .update({ read: true, admin_reply: replyText.trim(), replied_at: new Date().toISOString() })
      .eq("id", replyTarget.id);

    setMessages((prev) =>
      prev.map((m) => m.id === replyTarget.id ? { ...m, read: true, admin_reply: replyText.trim() } : m)
    );

    setSending(false);
    setReplyTarget(null);
    toast({ title: "Reply sent", description: `Your reply was emailed to ${replyTarget.email}.` });
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
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
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
                      {msg.read ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
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
                          {msg.admin_reply && <Badge variant="outline" className="text-green-700 border-green-300">Replied</Badge>}
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

                          {msg.admin_reply && (
                            <div className="bg-green-50 border border-green-100 rounded-md p-4">
                              <p className="text-xs font-semibold text-green-700 mb-1">Your reply</p>
                              <p className="text-sm text-green-900 whitespace-pre-wrap">{msg.admin_reply}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toggleRead(msg)}>
                              {msg.read ? "Mark as Unread" : "Mark as Read"}
                            </Button>
                            <Button size="sm" onClick={() => openReply(msg)} className="gap-1.5">
                              <Send className="h-3.5 w-3.5" />
                              {msg.admin_reply ? "Reply Again" : "Reply"}
                            </Button>
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

      {/* Reply dialog */}
      <Dialog open={!!replyTarget} onOpenChange={(open) => { if (!open) setReplyTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Original message</p>
              <p className="line-clamp-3">{replyTarget?.message}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              placeholder="Type your reply here..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This will be sent to <span className="font-semibold text-foreground">{replyTarget?.email}</span> via email.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTarget(null)} disabled={sending}>Cancel</Button>
            <Button onClick={sendReply} disabled={sending || !replyText.trim()} className="gap-1.5">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminContacts;
