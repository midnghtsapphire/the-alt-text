import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function AltTextPricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 5 domains",
        "Weekly compliance scans",
        "Basic violation reports",
        "1 custom logo set",
        "1 explainer video",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "For growing businesses with multiple websites",
      features: [
        "Up to 25 domains",
        "Daily compliance scans",
        "Real-time monitoring & alerts",
        "AI-powered instant fixes",
        "3 custom logo sets",
        "3 explainer videos + 5 custom scenes",
        "Unlimited regenerations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "/month",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited domains",
        "Real-time compliance monitoring",
        "White-label branding",
        "Unlimited custom logos & videos",
        "Marketing materials generation",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background/50 to-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">Simple, Transparent Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                tier.popular
                  ? 'glass-strong border-2 border-trust-blue shadow-2xl shadow-trust-blue/20 scale-105'
                  : 'glass'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-trust-blue text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-5xl font-bold text-trust-blue">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{tier.description}</p>

              {/* CTA Button */}
              <Button
                className={`w-full mb-6 ${
                  tier.popular
                    ? 'bg-trust-blue hover:bg-trust-blue/90'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                size="lg"
              >
                {tier.cta}
              </Button>

              {/* Features List */}
              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success-green flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            All plans include a <span className="text-success-green font-semibold">14-day free trial</span> and{' '}
            <span className="text-success-green font-semibold">30-day money-back guarantee</span>.
            No credit card required to start.
          </p>
        </div>
      </div>
    </section>
  );
}
