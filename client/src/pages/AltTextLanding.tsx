import AltTextHero from "./AltTextHero";
import AltTextFeatures from "./AltTextFeatures";
import AltTextPricing from "./AltTextPricing";
import AltTextROI from "./AltTextROI";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import AltTextHeader from "@/components/AltTextHeader";

export default function AltTextLanding() {
  return (
    <div className="min-h-screen">
      <AltTextHeader />
      {/* Hero Section */}
      <AltTextHero />

      {/* Features Section */}
      <AltTextFeatures />

      {/* ROI Calculator */}
      <AltTextROI />

      {/* Pricing Section */}
      <AltTextPricing />

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-b from-background/50 to-background">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-block p-4 rounded-full bg-trust-blue/20 mb-4">
              <Shield className="h-12 w-12 text-trust-blue" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Ready to Protect Your Business?</span>
            </h2>
            
            <p className="text-xl text-muted-foreground">
              Join thousands of businesses using The Alt Text to stay compliant and avoid costly lawsuits.
              Start your free 14-day trial today—no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-trust-blue hover:bg-trust-blue/90 text-white px-8 py-6 text-lg font-semibold"
              >
                Start Free Trial
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="glass border-white/30 hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                Schedule Demo
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              4,000+ businesses protected • 98% customer satisfaction • $50M+ in lawsuits prevented
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-background/80 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="space-y-4">
              <img src="/logo-horizontal.png" alt="The Alt Text" className="h-12" />
              <p className="text-sm text-muted-foreground">
                AI-powered accessibility compliance to protect your business from ADA lawsuits.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-trust-blue">Features</a></li>
                <li><a href="#" className="hover:text-trust-blue">Pricing</a></li>
                <li><a href="#" className="hover:text-trust-blue">ROI Calculator</a></li>
                <li><a href="#" className="hover:text-trust-blue">API Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-trust-blue">About Us</a></li>
                <li><a href="#" className="hover:text-trust-blue">Blog</a></li>
                <li><a href="#" className="hover:text-trust-blue">Case Studies</a></li>
                <li><a href="#" className="hover:text-trust-blue">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-trust-blue">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-trust-blue">Terms of Service</a></li>
                <li><a href="#" className="hover:text-trust-blue">WCAG 2.1 AA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 The Alt Text. All rights reserved. Powered by OZ Graphics & Video API.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
