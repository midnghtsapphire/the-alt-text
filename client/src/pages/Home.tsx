import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import {
  Eye, Shield, Zap, BarChart3, Code2, Upload, CheckCircle2,
  AlertTriangle, ArrowRight, Star, Globe, Lock
} from "lucide-react";

const stats = [
  { value: "$75K", label: "Max ADA lawsuit penalty" },
  { value: "98%", label: "Alt text accuracy" },
  { value: "< 2s", label: "Average processing time" },
  { value: "50+", label: "Free images per month" },
];

const features = [
  { icon: Eye, title: "AI-Powered Analysis", desc: "Vision AI analyzes images and generates contextually accurate, WCAG-compliant alt text in seconds." },
  { icon: Shield, title: "ADA Compliance", desc: "Meet WCAG 2.1 AA standards and protect your business from $5K-$75K ADA lawsuits." },
  { icon: Zap, title: "Bulk Processing", desc: "Process hundreds of images at once. Upload, scan, and generate alt text for entire websites." },
  { icon: Code2, title: "Developer API", desc: "RESTful API with simple authentication. Integrate alt text generation into your CI/CD pipeline." },
  { icon: BarChart3, title: "Compliance Dashboard", desc: "Track your compliance score, monitor usage, and generate audit-ready reports." },
  { icon: Upload, title: "Easy Integration", desc: "Works with any website. Upload images, paste URLs, or use our API for automated workflows." },
];

const industries = [
  { name: "Healthcare", href: "/industries/healthcare", risk: "HIPAA + ADA" },
  { name: "E-commerce", href: "/industries/ecommerce", risk: "Product images" },
  { name: "Education", href: "/industries/education", risk: "Section 508" },
  { name: "Legal", href: "/industries/legal", risk: "Court filings" },
  { name: "Finance", href: "/industries/financial-services", risk: "Regulatory" },
  { name: "Government", href: "/industries/government", risk: "Section 508" },
];

const testimonials = [
  { name: "Sarah Chen", role: "CTO, MedTech Solutions", text: "TheAltText saved us from a potential ADA lawsuit. We processed 10,000 images in under an hour.", stars: 5 },
  { name: "Marcus Johnson", role: "Web Director, EduFirst", text: "The API integration was seamless. Our CI/CD pipeline now automatically generates alt text for every image.", stars: 5 },
  { name: "Lisa Park", role: "Owner, Park & Associates", text: "As a small law firm, we couldn't afford the risk. TheAltText made compliance simple and affordable.", stars: 5 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm mb-8">
              <AlertTriangle className="w-4 h-4 text-warning-amber" />
              <span className="text-muted-foreground">Businesses face <strong className="text-foreground">$5K-$75K fines</strong> for missing alt text</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              AI-Generated Alt Text for{" "}
              <span className="text-gradient">ADA Compliance</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop risking lawsuits. TheAltText uses advanced vision AI to automatically generate
              WCAG-compliant alt text for every image on your website — in seconds, not hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="text-base px-8 h-12 glow-blue" onClick={() => window.location.href = getLoginUrl()}>
                Start Free — 50 Images/Month
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 bg-transparent">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to full ADA compliance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Upload Images", desc: "Paste URLs, upload files, or connect via API. Process single images or bulk batches." },
              { step: "2", title: "AI Generates Alt Text", desc: "Our vision AI analyzes each image and generates contextually accurate, WCAG-compliant descriptions." },
              { step: "3", title: "Export & Implement", desc: "Download results, copy alt text, or auto-deploy via API integration to your website." },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 text-center relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need for Compliance</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Enterprise-grade accessibility tools at every price point</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="glass-card p-6 group hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Every Industry</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">ADA compliance requirements vary by industry. We've got you covered.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((ind, i) => (
              <Link key={i} href={ind.href}>
                <div className="glass-card p-4 text-center hover:border-primary/20 transition-all cursor-pointer">
                  <div className="font-semibold text-sm mb-1">{ind.name}</div>
                  <div className="text-xs text-muted-foreground">{ind.risk}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/industries">
              <Button variant="outline" className="bg-transparent">
                View All Industries <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Businesses Nationwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warning-amber text-warning-amber" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { icon: Shield, label: "WCAG 2.1 AA Compliant" },
              { icon: Lock, label: "SOC 2 Type II" },
              { icon: Globe, label: "Section 508 Ready" },
              { icon: CheckCircle2, label: "ADA Title III" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <badge.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="glass-card p-12 text-center max-w-3xl mx-auto glow-blue">
            <h2 className="text-3xl font-bold mb-4">Don't Wait for a Lawsuit</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              ADA lawsuits increased 300% since 2018. Start protecting your business today with AI-powered alt text generation.
            </p>
            <Button size="lg" className="text-base px-8 h-12" onClick={() => window.location.href = getLoginUrl()}>
              Start Free — No Credit Card Required
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
