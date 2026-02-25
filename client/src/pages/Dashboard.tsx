import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import {
  Eye, BarChart3, CheckCircle2, AlertTriangle, Clock, Upload,
  ArrowRight, Image as ImageIcon, TrendingUp, Shield
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const statsQuery = trpc.alttext.stats.useQuery(undefined, { enabled: !!user });
  const historyQuery = trpc.alttext.history.useQuery({ limit: 10, offset: 0 }, { enabled: !!user });
  const subQuery = trpc.subscription.get.useQuery(undefined, { enabled: !!user });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to access your dashboard</h1>
          <p className="text-muted-foreground mb-8">Track your compliance score, manage images, and monitor usage.</p>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = statsQuery.data;
  const history = historyQuery.data || [];
  const sub = subQuery.data;
  const usagePercent = stats ? Math.round((stats.imagesUsedThisMonth / Math.max(stats.imagesPerMonth, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-20 container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user.name || "there"}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/generate">
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Generate Alt Text
              </Button>
            </Link>
            <Link href="/bulk">
              <Button variant="outline" className="bg-transparent">
                Bulk Process
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-success-green" />
              <span className="text-xs text-muted-foreground font-medium">Compliance Score</span>
            </div>
            <div className="text-3xl font-bold">{stats?.complianceScore ?? 100}%</div>
            <Progress value={stats?.complianceScore ?? 100} className="mt-2 h-1.5" />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Images Processed</span>
            </div>
            <div className="text-3xl font-bold">{stats?.totalImages ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">{stats?.completedImages ?? 0} successful</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-warning-amber" />
              <span className="text-xs text-muted-foreground font-medium">Avg Confidence</span>
            </div>
            <div className="text-3xl font-bold">{stats?.avgConfidence ? `${Math.round(stats.avgConfidence)}%` : "N/A"}</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Monthly Usage</span>
            </div>
            <div className="text-3xl font-bold">{stats?.imagesUsedThisMonth ?? 0}<span className="text-lg text-muted-foreground">/{stats?.imagesPerMonth ?? 50}</span></div>
            <Progress value={usagePercent} className="mt-2 h-1.5" />
          </div>
        </div>

        {/* Plan Banner */}
        {sub && sub.plan === "free" && (
          <div className="glass-card p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-warning-amber/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-amber shrink-0" />
              <div>
                <div className="font-semibold text-sm">Free Plan — Limited to {sub.imagesPerMonth} images/month</div>
                <div className="text-xs text-muted-foreground">Upgrade to Pro for 2,000 images, bulk processing, and API access.</div>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="sm">Upgrade <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>
        )}

        {/* Recent Activity */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Eye className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-1">No images processed yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload your first image to get started</p>
              <Link href="/generate">
                <Button size="sm">Generate Alt Text</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.status === "completed" ? "bg-success-green/10" :
                    item.status === "failed" ? "bg-destructive/10" : "bg-primary/10"
                  }`}>
                    {item.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-success-green" /> :
                     item.status === "failed" ? <AlertTriangle className="w-4 h-4 text-destructive" /> :
                     <Clock className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.generatedAltText || item.imageFileName || "Processing..."}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.imageType} &middot; {item.confidence ? `${item.confidence}% confidence` : ""} &middot; {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {item.processingTimeMs && (
                    <div className="text-xs text-muted-foreground shrink-0">{item.processingTimeMs}ms</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
