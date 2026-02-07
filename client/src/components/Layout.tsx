import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Footer from "@/components/Footer";
import { 
  BookOpen, 
  LayoutDashboard, 
  Library, 
  FileText, 
  Bookmark, 
  Search,
  Menu,
  X,
  LogOut,
  MapPin,
  Target,
  Briefcase,
  Calculator,
  History,
  Shield,
  Lightbulb,
  TrendingUp,
  GraduationCap,
  Receipt,
  Users
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: BookOpen },
    { href: "/career-highway", label: "🚀 AI Career Highway", icon: TrendingUp },
    { href: "/browse", label: "Browse Topics", icon: Library },
    { href: "/industrial-ladder", label: "Career Ladder", icon: TrendingUp },
    { href: "/training-locator", label: "Training", icon: GraduationCap },
    { href: "/nomad", label: "Nomad Map", icon: MapPin },
    { href: "/employers", label: "Jobs", icon: Briefcase },
    { href: "/cost-estimator", label: "Cost Calculator", icon: Calculator },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resources", label: "Resources", icon: FileText },
    { href: "/sources", label: "Sources", icon: FileText },
    { href: "/changelog", label: "Changelog", icon: History },
    { href: "/admin", label: "Admin", icon: Shield },
    { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
    { href: "/tax", label: "Tax Module", icon: Receipt },
    { href: "/security/tools", label: "Security Tools", icon: Shield },
    { href: "/security/assessment", label: "Security Assessment", icon: Shield },
    { href: "/partners", label: "Partners", icon: Users },
    ...(isAuthenticated ? [
      { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
      { href: "/my-progress", label: "My Progress", icon: Target }
    ] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <span className="flex items-center gap-3 font-semibold text-xl text-foreground hover:text-primary transition-colors cursor-pointer">
                <img src="/mechatronopolis-logo-cyberpunk.jpg" alt="Mechatronopolis Logo" className="h-12 w-auto object-contain select-none" draggable="false" />
                <span className="hidden sm:inline">Mechatronopolis</span>
                <span className="sm:hidden">Mecha</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" asChild className="hidden md:flex">
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button variant="default" className="w-full" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer with Attributions */}
      <Footer />
    </div>
  );
}
