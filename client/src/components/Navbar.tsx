import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAccessibility, AccessibilityMode } from "@/contexts/AccessibilityContext";
import {
  Eye, Menu, X, LogOut, LayoutDashboard, Key, Settings,
  Brain, Leaf, Sun, Monitor
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const A11Y_MODES: { id: AccessibilityMode; label: string; icon: typeof Brain; desc: string }[] = [
  { id: "default", label: "Standard", icon: Monitor, desc: "Default experience" },
  { id: "neurodivergent", label: "Neurodivergent", icon: Brain, desc: "High contrast, no motion" },
  { id: "eco", label: "ECO CODE", icon: Leaf, desc: "Low power mode" },
  { id: "no-blue-light", label: "No Blue Light", icon: Sun, desc: "Warm amber palette" },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { mode, setMode } = useAccessibility();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/api-docs", label: "API" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              The<span className="text-gradient">AltText</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Accessibility Mode Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Accessibility mode">
                  {mode === "neurodivergent" ? <Brain className="h-4 w-4" /> :
                   mode === "eco" ? <Leaf className="h-4 w-4" /> :
                   mode === "no-blue-light" ? <Sun className="h-4 w-4" /> :
                   <Eye className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Accessibility Mode</div>
                {A11Y_MODES.map(m => (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={mode === m.id ? "bg-primary/10 text-primary" : ""}
                  >
                    <m.icon className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth */}
            {loading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email || ""}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/api-keys"}>
                    <Key className="mr-2 h-4 w-4" />API Keys
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                    <Settings className="mr-2 h-4 w-4" />Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>
                  Get Started Free
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border/50 mt-2 pt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <span className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}>{link.label}</span>
                </Link>
              ))}
              {!user && (
                <Button className="mt-2" onClick={() => window.location.href = getLoginUrl()}>
                  Get Started Free
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
