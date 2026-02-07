import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Scan, Zap } from "lucide-react";

export default function AltTextHero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/hero-3d-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="animate-float">
            <img 
              src="/logo-3d-main.png" 
              alt="The Alt Text Logo" 
              className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl"
            />
          </div>
          
          {/* Headline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="text-gradient neon-cyan">
                Protect Your Business
              </span>
              <br />
              <span className="text-white">
                from ADA Lawsuits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Automated WCAG compliance powered by AI. 
              <span className="text-trust-blue font-semibold"> 4,000+ lawsuits filed in 2024</span> with 
              <span className="text-danger-red font-semibold"> $10k-$100k settlements</span>. 
              Don't be next.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-trust-blue hover:bg-trust-blue/90 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-trust-blue/50"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="glass border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
            >
              <Scan className="mr-2 h-5 w-5" />
              Scan My Website
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success-green" />
              <span>WCAG 2.1 AA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning-amber" />
              <span>60-Second Scans</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-trust-blue" />
              <span>24/7 Monitoring</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
