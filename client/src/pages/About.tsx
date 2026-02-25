import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Eye, Heart, Shield, Zap, ArrowRight, Users, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold mb-4">About TheAltText</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe the internet should be accessible to everyone. TheAltText uses AI to make that vision a reality — one image at a time.
            </p>
          </div>

          {/* Mission */}
          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" /> Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Over 1 billion people worldwide live with some form of disability. For the visually impaired, alt text is the bridge between images and understanding. Yet millions of websites still lack proper image descriptions, creating barriers and exposing businesses to legal risk.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              TheAltText was created to solve this at scale. By leveraging advanced vision AI, we generate accurate, contextual, WCAG-compliant alt text automatically — making accessibility achievable for businesses of every size.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Shield, title: "Compliance First", desc: "Every alt text we generate meets WCAG 2.1 AA standards. We take compliance seriously because your business depends on it." },
              { icon: Zap, title: "Speed at Scale", desc: "Process thousands of images in minutes, not days. Our AI works 24/7 so your team doesn't have to." },
              { icon: Users, title: "Accessibility for All", desc: "We support neurodivergent users, low-vision users, and eco-conscious browsing with our priority accessibility modes." },
            ].map((v, i) => (
              <div key={i} className="glass-card p-6">
                <v.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" /> Built by GlowStarLabs
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TheAltText is a product of GlowStarLabs, founded by Audrey Evans. We build tools that make the web more inclusive, accessible, and compliant — because accessibility isn't optional, it's essential.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our team combines expertise in AI, accessibility standards, and web development to deliver enterprise-grade solutions at startup speed.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
              Start Making Your Site Accessible <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
