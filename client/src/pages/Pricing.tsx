import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Pricing() {
  const { user } = useAuth();
  const plansQuery = trpc.subscription.getPlans.useQuery();
  const upgradeMutation = trpc.subscription.upgrade.useMutation({
    onSuccess: (data) => {
      toast.success(`Upgraded to ${data.plan} plan!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const plans = plansQuery.data || [];

  const handlePlanAction = (planId: string) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (planId === "free") {
      window.location.href = "/dashboard";
      return;
    }
    if (planId === "enterprise") {
      toast.info("Enterprise plan — contact sales@thealttext.com for custom pricing.");
      return;
    }
    upgradeMutation.mutate({ plan: planId as "pro" | "enterprise" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Simple, transparent pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Choose Your <span className="text-gradient">Protection Level</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Every plan includes AI-powered alt text generation. Upgrade for bulk processing, API access, and priority support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`glass-card p-8 flex flex-col relative ${
                  plan.highlighted ? "border-primary/30 glow-blue" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={plan.highlighted ? "w-full" : "w-full bg-transparent"}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={upgradeMutation.isPending}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "What happens if I exceed my monthly limit?", a: "You'll receive a notification at 80% usage. Once you hit the limit, new requests will be paused until the next billing cycle or you upgrade your plan." },
                { q: "Can I cancel anytime?", a: "Yes, all plans are month-to-month with no long-term commitment. Cancel anytime from your dashboard." },
                { q: "Is there a free trial for Pro?", a: "The Free tier gives you 50 images per month forever. Pro includes a 7-day trial with full features." },
                { q: "Do you offer annual billing?", a: "Yes! Annual billing saves you 20%. Contact us for annual pricing on Enterprise plans." },
                { q: "What AI model do you use?", a: "We use state-of-the-art vision AI models optimized for accessibility descriptions, ensuring high accuracy and WCAG compliance." },
              ].map((faq, i) => (
                <div key={i} className="glass-card p-5">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
