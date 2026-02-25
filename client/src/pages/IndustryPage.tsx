import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Shield, AlertTriangle, ArrowRight, CheckCircle2, BarChart3,
  DollarSign, Scale, Eye
} from "lucide-react";

export type IndustryData = {
  slug: string;
  name: string;
  headline: string;
  subheadline: string;
  lawsuitRisk: string;
  avgSettlement: string;
  regulations: string[];
  painPoints: string[];
  benefits: string[];
  stats: { value: string; label: string }[];
  seoTitle: string;
  seoDescription: string;
};

export default function IndustryPage({ data }: { data: IndustryData }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm mb-6">
              <AlertTriangle className="w-4 h-4 text-warning-amber" />
              <span className="text-muted-foreground">{data.lawsuitRisk} risk for {data.name.toLowerCase()}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {data.headline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              {data.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 h-12" onClick={() => window.location.href = getLoginUrl()}>
                Start Free — 50 Images/Month <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 bg-transparent">View Pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-t border-border/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {data.stats.map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Requirements */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-primary" /> Compliance Requirements
                </h2>
                <div className="space-y-3">
                  {data.regulations.map((reg, i) => (
                    <div key={i} className="flex items-start gap-3 glass-card p-4">
                      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{reg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-warning-amber" /> Pain Points
                </h2>
                <div className="space-y-3">
                  {data.painPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 glass-card p-4">
                      <DollarSign className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">How TheAltText Helps {data.name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 glass-card p-5">
                  <CheckCircle2 className="w-5 h-5 text-success-green shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="glass-card p-12 text-center max-w-3xl mx-auto glow-blue">
            <h2 className="text-3xl font-bold mb-4">Protect Your {data.name} Business Today</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Average {data.name.toLowerCase()} ADA settlement: {data.avgSettlement}. Don't wait for a demand letter.
            </p>
            <Button size="lg" className="text-base px-8 h-12" onClick={() => window.location.href = getLoginUrl()}>
              Start Free — No Credit Card Required <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
