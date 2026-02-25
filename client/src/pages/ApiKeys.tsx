import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import {
  Key, Plus, Copy, Trash2, AlertTriangle, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ApiKeys() {
  const { user, loading } = useAuth();
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const subQuery = trpc.subscription.get.useQuery(undefined, { enabled: !!user });
  const keysQuery = trpc.apikeys.list.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  const createMutation = trpc.apikeys.create.useMutation({
    onSuccess: (data) => {
      setNewKey(data.key);
      setNewKeyName("");
      utils.apikeys.list.invalidate();
      toast.success("API key created!");
    },
    onError: (err) => toast.error(err.message),
  });

  const revokeMutation = trpc.apikeys.revoke.useMutation({
    onSuccess: () => {
      utils.apikeys.list.invalidate();
      toast.success("API key revoked");
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to manage API keys</h1>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isPro = subQuery.data && subQuery.data.plan !== "free";
  const keys = keysQuery.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-20 container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" /> API Keys
          </h1>
          <p className="text-muted-foreground mb-8">Manage your API keys for programmatic access to TheAltText.</p>

          {!isPro ? (
            <div className="glass-card p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-warning-amber mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Pro Plan Required</h2>
              <p className="text-muted-foreground mb-6">API access is available on Pro and Enterprise plans.</p>
              <Link href="/pricing"><Button>Upgrade Now <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          ) : (
            <>
              {/* New Key Created Banner */}
              {newKey && (
                <div className="glass-card p-5 mb-6 border-success-green/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success-green shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">API Key Created</h3>
                      <p className="text-xs text-muted-foreground mb-3">Copy this key now — you won't be able to see it again.</p>
                      <div className="flex gap-2">
                        <code className="flex-1 p-2 rounded bg-muted/30 text-xs font-mono break-all">{newKey}</code>
                        <Button variant="outline" size="icon" className="shrink-0 bg-transparent" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied!"); }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3" onClick={() => setNewKey(null)}>Dismiss</Button>
                </div>
              )}

              {/* Create Key */}
              <div className="glass-card p-5 mb-6">
                <h2 className="font-semibold mb-3">Create New Key</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Key name (e.g., Production, Staging)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <Button onClick={() => createMutation.mutate({ name: newKeyName })} disabled={!newKeyName.trim() || createMutation.isPending}>
                    <Plus className="mr-2 h-4 w-4" /> Create
                  </Button>
                </div>
              </div>

              {/* Key List */}
              <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-border/50">
                  <h2 className="font-semibold">Your API Keys ({keys.length})</h2>
                </div>
                {keys.length === 0 ? (
                  <div className="p-12 text-center">
                    <Key className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No API keys yet. Create one above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {keys.map((key) => (
                      <div key={key.id} className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{key.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <code>{key.keyPrefix}...</code> &middot; {key.monthlyUsed}/{key.monthlyLimit} calls &middot; Created {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${key.isActive ? "bg-success-green/10 text-success-green" : "bg-destructive/10 text-destructive"}`}>
                          {key.isActive ? "Active" : "Revoked"}
                        </div>
                        {key.isActive ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => revokeMutation.mutate({ id: key.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
