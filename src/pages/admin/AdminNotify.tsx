import { useEffect, useState } from "react";
import { Send, CheckCircle, Users, User } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminNotify = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [recipient, setRecipient] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id, first_name, surname, email")
      .order("surname")
      .then(({ data, error: err }) => { if (!err) setMembers(data || []); });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({ title: "Required", description: "Title and message are required.", variant: "destructive" });
      return;
    }
    if (recipient === "single" && !selectedUserId) {
      toast({ title: "Required", description: "Please select a member.", variant: "destructive" });
      return;
    }

    setSending(true);

    const targets = recipient === "all"
      ? members.map((m) => m.user_id)
      : [selectedUserId];

    const notifications = targets.map((uid) => ({
      user_id: uid,
      title: title.trim(),
      message: message.trim(),
      type: "admin_announcement",
    }));

    const { error } = await supabase.from("notifications").insert(notifications);
    setSending(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setSentCount(targets.length);
    setSent(true);
    toast({ title: "Notifications sent!", description: `Sent to ${targets.length} member${targets.length !== 1 ? "s" : ""}.` });
  };

  const reset = () => {
    setTitle("");
    setMessage("");
    setSelectedUserId("");
    setRecipient("all");
    setSent(false);
    setSentCount(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Send Notification</h1>
          <p className="text-muted-foreground mt-1">Send an announcement or message to one or all members.</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            {sent ? (
              <div className="flex flex-col items-center text-center py-8 space-y-4">
                <CheckCircle className="h-14 w-14 text-green-600" />
                <h3 className="font-heading text-xl font-semibold text-foreground">Notification Sent</h3>
                <p className="text-muted-foreground text-sm">
                  "{title}" was delivered to {sentCount} member{sentCount !== 1 ? "s" : ""}.
                </p>
                <Button variant="outline" onClick={reset}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-5">
                {/* Recipient */}
                <div>
                  <label className="text-sm font-medium text-foreground">Send to</label>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setRecipient("all")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        recipient === "all"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input text-foreground hover:bg-muted"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      All Members ({members.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipient("single")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        recipient === "single"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input text-foreground hover:bg-muted"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Specific Member
                    </button>
                  </div>
                </div>

                {/* Member selector */}
                {recipient === "single" && (
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Select Member <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">— Choose a member —</option>
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {[m.surname, m.first_name].filter(Boolean).join(" ") || m.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Notification Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AGC Notice, Branch Dues Reminder..."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your notification message here..."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full">
                  {sending
                    ? "Sending..."
                    : <><Send className="h-4 w-4 mr-2" />Send to {recipient === "all" ? `All ${members.length} Members` : "Selected Member"}</>
                  }
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotify;
