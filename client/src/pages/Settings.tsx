import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Settings as SettingsIcon, User, CreditCard, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const { user, loading } = useAuth();
  const subQuery = trpc.subscription.get.useQuery(undefined, { enabled: !!user });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to access settings</h1>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const sub = subQuery.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-20 container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground mb-8">Manage your account and subscription.</p>

          {/* Profile */}
          <div className="glass-card p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{user.name || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user.email || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="glass-card p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Subscription</h2>
            {sub ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <span className="text-sm font-medium capitalize">{sub.plan}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-muted-foreground">Images per month</span>
                  <span className="text-sm font-medium">{sub.imagesPerMonth}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-muted-foreground">Used this month</span>
                  <span className="text-sm font-medium">{sub.imagesUsedThisMonth}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-medium ${sub.status === "active" ? "text-success-green" : "text-warning-amber"}`}>
                    {sub.status}
                  </span>
                </div>
                {sub.plan === "free" && (
                  <Link href="/pricing">
                    <Button className="w-full mt-4">Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading subscription info...</p>
            )}
          </div>

          {/* Compliance */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Compliance</h2>
            <p className="text-sm text-muted-foreground mb-4">
              TheAltText generates alt text following WCAG 2.1 AA standards. For full compliance audits and reporting, upgrade to Pro or Enterprise.
            </p>
            <div className="flex gap-3">
              <Link href="/api-docs"><Button variant="outline" size="sm" className="bg-transparent">API Docs</Button></Link>
              <Link href="/pricing"><Button variant="outline" size="sm" className="bg-transparent">View Plans</Button></Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
