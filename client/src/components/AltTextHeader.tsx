import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function AltTextHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center space-x-2">
            <img src="/logo-horizontal.png" alt="The Alt Text" className="h-8" />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard">
            <a className="text-sm font-medium hover:text-trust-blue transition-colors">
              Dashboard
            </a>
          </Link>
          <Link href="/oz-dashboard">
            <a className="text-sm font-medium hover:text-trust-blue transition-colors">
              OZ Marketing
            </a>
          </Link>
          <Link href="/affiliate-credentials">
            <a className="text-sm font-medium hover:text-trust-blue transition-colors">
              Affiliate Tools
            </a>
          </Link>
          <Link href="/free-images">
            <a className="text-sm font-medium hover:text-trust-blue transition-colors">
              Free Images
            </a>
          </Link>
          <Link href="/rewards">
            <a className="text-sm font-medium hover:text-trust-blue transition-colors">
              Rewards
            </a>
          </Link>
          <a href="#pricing" className="text-sm font-medium hover:text-trust-blue transition-colors">
            Pricing
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Button size="sm" className="bg-trust-blue hover:bg-trust-blue/90 text-white">
            Start Free Trial
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <nav className="container py-4 flex flex-col space-y-4">
            <Link href="/dashboard">
              <a className="text-sm font-medium hover:text-trust-blue transition-colors">
                Dashboard
              </a>
            </Link>
            <Link href="/oz-dashboard">
              <a className="text-sm font-medium hover:text-trust-blue transition-colors">
                OZ Marketing
              </a>
            </Link>
            <Link href="/affiliate-credentials">
              <a className="text-sm font-medium hover:text-trust-blue transition-colors">
                Affiliate Tools
              </a>
            </Link>
            <Link href="/free-images">
              <a className="text-sm font-medium hover:text-trust-blue transition-colors">
                Free Images
              </a>
            </Link>
            <Link href="/rewards">
              <a className="text-sm font-medium hover:text-trust-blue transition-colors">
                Rewards
              </a>
            </Link>
            <a href="#pricing" className="text-sm font-medium hover:text-trust-blue transition-colors">
              Pricing
            </a>
            <div className="pt-4 space-y-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Button size="sm" className="w-full bg-trust-blue hover:bg-trust-blue/90 text-white">
                Start Free Trial
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
