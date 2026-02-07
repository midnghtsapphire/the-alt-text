import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Home,
  Bell,
  Zap,
  Shield,
  Signal,
  Package,
  Link as LinkIcon,
  Activity,
  Code,
  FileText,
  Key,
  Webhook,
  Boxes,
  Puzzle,
  BookOpen,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function TaxModuleNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [productsOpen, setProductsOpen] = useState(true);
  const [platformOpen, setPlatformOpen] = useState(true);
  const [developersOpen, setDevelopersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="w-64 bg-background border-r border-border h-screen overflow-y-auto flex flex-col">
      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-1">
        {/* Home */}
        <Link href="/tax">
          <a
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/tax")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </a>
        </Link>

        {/* Notifications */}
        <Link href="/tax/notifications">
          <a
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/tax/notifications")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
          </a>
        </Link>

        {/* Get production access */}
        <Link href="/tax/production">
          <a
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/tax/production")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>Get production access</span>
          </a>
        </Link>

        {/* PRODUCTS Section */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Products
          </div>

          {/* Account Verification */}
          <button
            onClick={() => setProductsOpen(!productsOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <Shield className="w-5 h-5" />
            <span>Account Verification</span>
            {productsOpen ? (
              <ChevronDown className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>

          {/* Signal */}
          <Link href="/tax/signal">
            <a
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/tax/signal")
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Signal className="w-5 h-5" />
              <span>Signal</span>
            </a>
          </Link>

          {/* All products */}
          <Link href="/tax/products">
            <a
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/tax/products")
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Package className="w-5 h-5" />
              <span>All products</span>
            </a>
          </Link>
        </div>

        {/* PLATFORM Section */}
        <div className="pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform
          </div>

          {/* Link */}
          <button
            onClick={() => setPlatformOpen(!platformOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <LinkIcon className="w-5 h-5" />
            <span>Link</span>
            {platformOpen ? (
              <ChevronDown className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>

          {/* Activity */}
          <Link href="/tax/activity">
            <a
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/tax/activity")
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Activity</span>
            </a>
          </Link>

          {/* Developers */}
          <button
            onClick={() => setDevelopersOpen(!developersOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <Code className="w-5 h-5" />
            <span>Developers</span>
            {developersOpen ? (
              <ChevronDown className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>

          {/* Developers Submenu */}
          {developersOpen && (
            <div className="ml-8 space-y-1 mt-1">
              <Link href="/tax/developers/logs">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/logs")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Logs</span>
                </a>
              </Link>

              <Link href="/tax/developers/keys">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/keys")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Keys</span>
                </a>
              </Link>

              <Link href="/tax/developers/api">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/api")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>API</span>
                </a>
              </Link>

              <Link href="/tax/developers/webhooks">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/webhooks")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Webhook className="w-4 h-4" />
                  <span>Webhooks</span>
                </a>
              </Link>

              <Link href="/tax/developers/sandbox">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/sandbox")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Sandbox</span>
                </a>
              </Link>

              <Link href="/tax/developers/integrations">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/integrations")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Puzzle className="w-4 h-4" />
                  <span>Integrations</span>
                </a>
              </Link>

              <Link href="/tax/developers/docs">
                <a
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive("/tax/developers/docs")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Docs</span>
                </a>
              </Link>
            </div>
          )}
        </div>

        {/* Get Help */}
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors mt-4"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Get Help</span>
          {helpOpen ? (
            <ChevronDown className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </button>

        {/* Settings */}
        <Link href="/tax/settings">
          <a
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/tax/settings")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </a>
        </Link>
      </div>

      {/* User Profile at Bottom */}
      <div className="border-t border-border p-4">
        <Link href="/profile">
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user?.name || "User"}
            </span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
