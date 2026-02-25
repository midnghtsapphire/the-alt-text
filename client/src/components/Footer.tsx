import { Eye } from "lucide-react";
import { Link } from "wouter";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "API Documentation", href: "/api-docs" },
    { label: "ROI Calculator", href: "/roi-calculator" },
  ],
  Industries: [
    { label: "Healthcare", href: "/industries/healthcare" },
    { label: "E-commerce", href: "/industries/ecommerce" },
    { label: "Education", href: "/industries/education" },
    { label: "Legal", href: "/industries/legal" },
    { label: "View All", href: "/industries" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Changelog", href: "/changelog" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "VPAT", href: "/vpat" },
    { label: "Accessibility", href: "/accessibility-statement" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-foreground">TheAltText</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered alt text generation for ADA compliance. Protect your business from lawsuits.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm text-foreground mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TheAltText by Audrey Evans / GlowStarLabs. All Rights Reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            AI alt text generation powered by free sources and API &middot; Built with accessibility-first principles
          </p>
        </div>
      </div>
    </footer>
  );
}
