import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Rocket, Bug, Sparkles, Shield } from "lucide-react";

const entries = [
  {
    version: "1.0.0",
    date: "February 25, 2026",
    title: "Initial Launch",
    type: "release" as const,
    changes: [
      "AI-powered alt text generation using vision AI",
      "WCAG 2.1 AA compliance checking",
      "Single image and bulk processing",
      "Developer REST API with key management",
      "Dashboard with compliance score and usage tracking",
      "Three accessibility modes: Neurodivergent, ECO CODE, No Blue Light",
      "Glassmorphism dark theme UI",
      "Tiered pricing: Free (50 images), Pro ($29/mo), Enterprise ($99/mo)",
      "15+ industry-specific landing pages",
      "ROI calculator for cost savings",
      "CSV export for bulk results",
      "OAuth authentication",
    ],
  },
];

const typeConfig = {
  release: { icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
  feature: { icon: Sparkles, color: "text-success-green", bg: "bg-success-green/10" },
  fix: { icon: Bug, color: "text-warning-amber", bg: "bg-warning-amber/10" },
  security: { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Changelog</h1>
            <p className="text-muted-foreground">Track every update, feature, and improvement to TheAltText.</p>
          </div>

          <div className="space-y-8">
            {entries.map((entry, i) => {
              const config = typeConfig[entry.type];
              return (
                <div key={i} className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <div className="font-bold">v{entry.version} — {entry.title}</div>
                      <div className="text-xs text-muted-foreground">{entry.date}</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {entry.changes.map((change, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1.5 shrink-0">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
