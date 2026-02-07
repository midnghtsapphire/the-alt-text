export default function AltTextFeatures() {
  const features = [
    {
      icon: "/feature-icon-scan.png",
      title: "Automated Scanning",
      description: "AI-powered scanner analyzes your entire website in minutes, detecting every WCAG 2.1 AA violation with precision.",
      color: "trust-blue",
    },
    {
      icon: "/feature-icon-fix.png",
      title: "One-Click Fixes",
      description: "Multi-LLM AI generates accurate alt text, fixes color contrast, and adds ARIA labels instantly. No coding required.",
      color: "success-green",
    },
    {
      icon: "/feature-icon-monitor.png",
      title: "24/7 Monitoring",
      description: "Real-time monitoring keeps you compliant. Get instant alerts when new violations are detected on your site.",
      color: "warning-amber",
    },
    {
      icon: "/feature-icon-report.png",
      title: "Compliance Reports",
      description: "Detailed reports with line-by-line code references, fix suggestions, and audit trails for legal documentation.",
      color: "trust-blue",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automated accessibility compliance in four simple steps. 
            Protect your business from lawsuits while expanding your customer base.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 hover:glass-strong transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={feature.icon} 
                  alt={feature.title}
                  className="w-24 h-24 mx-auto drop-shadow-2xl"
                />
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold mb-4 text-${feature.color}`}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Step Number */}
              <div className="mt-6 text-6xl font-bold opacity-10">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-trust-blue mb-2">98%</div>
            <div className="text-muted-foreground">of websites have violations</div>
          </div>
          
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-danger-red mb-2">4,000+</div>
            <div className="text-muted-foreground">ADA lawsuits filed in 2024</div>
          </div>
          
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-success-green mb-2">$10k-$100k</div>
            <div className="text-muted-foreground">average settlement cost</div>
          </div>
        </div>
      </div>
    </section>
  );
}
