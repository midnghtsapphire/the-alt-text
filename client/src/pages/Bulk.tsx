import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import {
  Upload, CheckCircle2, AlertTriangle, Loader2, ArrowRight,
  Download, Copy, Layers
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Bulk() {
  const { user, loading } = useAuth();
  const [urls, setUrls] = useState("");
  const [pageContext, setPageContext] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const subQuery = trpc.subscription.get.useQuery(undefined, { enabled: !!user });

  const bulkMutation = trpc.bulk.create.useMutation({
    onSuccess: (data) => {
      setResults(data.results);
      toast.success(`Processed ${data.results.length} images!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBulkProcess = () => {
    const imageUrls = urls.split("\n").map(u => u.trim()).filter(u => u.length > 0);
    if (imageUrls.length === 0) {
      toast.error("Please enter at least one image URL");
      return;
    }
    if (imageUrls.length > 100) {
      toast.error("Maximum 100 URLs per batch");
      return;
    }
    setResults([]);
    bulkMutation.mutate({ imageUrls, pageContext: pageContext || undefined });
  };

  const exportCSV = () => {
    const csv = ["Image URL,Alt Text,Confidence,Status", ...results.map(r =>
      `"${r.imageUrl}","${r.altText?.replace(/"/g, '""') || ""}",${r.confidence},"${r.status}"`
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alttext-bulk-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in for bulk processing</h1>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isPro = subQuery.data && subQuery.data.plan !== "free";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-20 container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Bulk Processing
          </h1>
          <p className="text-muted-foreground mb-8">Process multiple images at once. Paste one URL per line.</p>

          {!isPro ? (
            <div className="glass-card p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-warning-amber mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Pro Plan Required</h2>
              <p className="text-muted-foreground mb-6">Bulk processing is available on Pro and Enterprise plans.</p>
              <Link href="/pricing">
                <Button>Upgrade Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="glass-card p-6 mb-6">
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1.5 block">Image URLs (one per line)</label>
                  <Textarea
                    placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg\nhttps://example.com/image3.jpg"}
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {urls.split("\n").filter(u => u.trim()).length} URLs entered (max 100)
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-medium mb-1.5 block">Page Context <span className="text-muted-foreground">(optional)</span></label>
                  <Input
                    placeholder="e.g., E-commerce product catalog"
                    value={pageContext}
                    onChange={(e) => setPageContext(e.target.value)}
                  />
                </div>

                <Button onClick={handleBulkProcess} disabled={bulkMutation.isPending} className="w-full">
                  {bulkMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Process All Images</>
                  )}
                </Button>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="p-5 border-b border-border/50 flex items-center justify-between">
                    <h2 className="font-semibold">Results ({results.length} images)</h2>
                    <Button variant="outline" size="sm" className="bg-transparent" onClick={exportCSV}>
                      <Download className="mr-2 h-3 w-3" /> Export CSV
                    </Button>
                  </div>
                  <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
                    {results.map((r, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          r.status === "completed" ? "bg-success-green/10" : "bg-destructive/10"
                        }`}>
                          {r.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5 text-success-green" /> : <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground truncate mb-1">{r.imageUrl}</div>
                          {r.altText && (
                            <div className="flex items-start gap-2">
                              <p className="text-sm">{r.altText}</p>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { navigator.clipboard.writeText(r.altText); toast.success("Copied!"); }}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          {r.status === "failed" && <p className="text-sm text-destructive">Failed to process</p>}
                        </div>
                        {r.confidence > 0 && <span className="text-xs text-muted-foreground shrink-0">{r.confidence}%</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
