import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Eye, Shield, Zap, Code2, Upload, BarChart3, Brain, Leaf, Sun,
  FileText, Globe, Lock, ArrowRight, CheckCircle2
} from "lucide-react";

const features = [
  { icon: Eye, title: "Vision AI Analysis", desc: "State-of-the-art vision models analyze image content, context, text, objects, and scenes to generate accurate descriptions.", category: "Core" },
  { icon: Shield, title: "WCAG 2.1 AA Compliance", desc: "Every generated alt text is checked against WCAG 2.1 AA standards with confidence scoring and compliance status.", category: "Compliance" },
  { icon: Zap, title: "Bulk Processing", desc: "Process up to 100 images per batch. Upload URLs, files, or connect via API for automated workflows.", category: "Core" },
  { icon: Code2, title: "Developer API", desc: "RESTful API with Bearer token auth. Generate alt text programmatically in your CI/CD pipeline or CMS.", category: "Integration" },
  { icon: BarChart3, title: "Compliance Dashboard", desc: "Track compliance score, monitor usage, view processing history, and generate audit-ready reports.", category: "Analytics" },
  { icon: Upload, title: "Multiple Input Methods", desc: "Paste URLs, upload files, drag & drop, or use the API. Works with PNG, JPG, WebP, and more.", category: "Core" },
  { icon: Brain, title: "Neurodivergent Mode", desc: "High contrast, reduced motion, and optimized typography for users with ADHD, dyslexia, or autism.", category: "Accessibility" },
  { icon: Leaf, title: "ECO CODE Mode", desc: "Low-power mode that reduces animations and visual complexity to save energy and battery.", category: "Accessibility" },
  { icon: Sun, title: "No Blue Light Mode", desc: "Warm amber palette that eliminates blue light for comfortable nighttime use and reduced eye strain.", category: "Accessibility" },
  { icon: FileText, title: "CSV Export", desc: "Export bulk processing results as CSV for easy import into spreadsheets and content management systems.", category: "Integration" },
  { icon: Globe, title: "Section 508 Ready", desc: "Meets Section 508 requirements for federal agencies and government contractors.", category: "Compliance" },
  { icon: Lock, title: "Secure by Design", desc: "API keys are hashed, images are not stored after processing, and all data is encrypted in transit.", category: "Security" },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-4">Features</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make your website accessible and ADA-compliant.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-6 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground">{f.category}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
