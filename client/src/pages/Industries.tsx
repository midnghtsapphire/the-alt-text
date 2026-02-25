import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { industries } from "@/data/industries";
import { ArrowRight, Shield, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Industries() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs mb-4">
            <Globe className="w-3 h-3 text-primary" /> Industry Solutions
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Alt Text for Every Industry</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ADA compliance requirements vary by industry. TheAltText provides specialized alt text generation tailored to your sector's unique needs and regulations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {industries.map((ind) => (
            <Link key={ind.slug} href={`/industries/${ind.slug}`}>
              <div className="glass-card p-6 h-full hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{ind.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ind.lawsuitRisk === "Very High" || ind.lawsuitRisk === "Mandatory" ? "bg-destructive/10 text-destructive" :
                    ind.lawsuitRisk === "High" ? "bg-warning-amber/10 text-warning-amber" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {ind.lawsuitRisk} Risk
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">{ind.subheadline}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Avg settlement: {ind.avgSettlement}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
            Start Free — Works for Any Industry <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
