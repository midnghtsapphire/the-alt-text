import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DollarSign, TrendingUp, Users, AlertTriangle } from "lucide-react";

export default function AltTextROI() {
  const [monthlyTraffic, setMonthlyTraffic] = useState(10000);
  const [currentViolations, setCurrentViolations] = useState(50);
  
  // Calculate metrics
  const disabledUsers = Math.round(monthlyTraffic * 0.15); // 15% of population has disabilities
  const lostRevenue = disabledUsers * 50; // Assume $50 average order value
  const lawsuitRisk = currentViolations > 30 ? "High" : currentViolations > 15 ? "Medium" : "Low";
  const lawsuitCost = 50000; // Average settlement
  const complianceCost = 299 * 12; // Professional plan annual cost
  const savings = lawsuitCost - complianceCost;
  const roi = Math.round((savings / complianceCost) * 100);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/50">
      <div className="container max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">Calculate Your ROI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how much you could save by preventing lawsuits and expanding your customer base.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <Card className="glass p-8 space-y-8">
            <div>
              <label className="text-lg font-semibold mb-4 block">
                Monthly Website Traffic
              </label>
              <Slider
                value={[monthlyTraffic]}
                onValueChange={(value) => setMonthlyTraffic(value[0])}
                min={1000}
                max={1000000}
                step={1000}
                className="mb-2"
              />
              <div className="text-right text-2xl font-bold text-trust-blue">
                {monthlyTraffic.toLocaleString()} visitors/month
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold mb-4 block">
                Current Accessibility Violations
              </label>
              <Slider
                value={[currentViolations]}
                onValueChange={(value) => setCurrentViolations(value[0])}
                min={0}
                max={200}
                step={5}
                className="mb-2"
              />
              <div className="text-right text-2xl font-bold text-warning-amber">
                {currentViolations} violations
              </div>
            </div>

            <Button className="w-full bg-trust-blue hover:bg-trust-blue/90" size="lg">
              Get Free Compliance Scan
            </Button>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {/* Lost Revenue */}
            <Card className="glass p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-danger-red/20">
                  <Users className="h-6 w-6 text-danger-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Lost Revenue Opportunity</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {disabledUsers.toLocaleString()} disabled users can't access your site
                  </p>
                  <div className="text-3xl font-bold text-danger-red">
                    ${lostRevenue.toLocaleString()}/month
                  </div>
                </div>
              </div>
            </Card>

            {/* Lawsuit Risk */}
            <Card className="glass p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-warning-amber/20">
                  <AlertTriangle className="h-6 w-6 text-warning-amber" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Lawsuit Risk Level</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Based on {currentViolations} violations
                  </p>
                  <div className={`text-3xl font-bold ${
                    lawsuitRisk === "High" ? "text-danger-red" :
                    lawsuitRisk === "Medium" ? "text-warning-amber" :
                    "text-success-green"
                  }`}>
                    {lawsuitRisk} Risk
                  </div>
                </div>
              </div>
            </Card>

            {/* Potential Savings */}
            <Card className="glass-strong p-6 border-2 border-success-green">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-success-green/20">
                  <DollarSign className="h-6 w-6 text-success-green" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Potential Savings</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Lawsuit prevention vs. compliance cost
                  </p>
                  <div className="text-3xl font-bold text-success-green">
                    ${savings.toLocaleString()}/year
                  </div>
                </div>
              </div>
            </Card>

            {/* ROI */}
            <Card className="glass p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-trust-blue/20">
                  <TrendingUp className="h-6 w-6 text-trust-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Return on Investment</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    First-year ROI with Professional plan
                  </p>
                  <div className="text-3xl font-bold text-trust-blue">
                    {roi}% ROI
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            * Calculations based on industry averages. Actual results may vary. 
            Average ADA lawsuit settlement: $50,000. 15% of population has disabilities.
          </p>
        </div>
      </div>
    </section>
  );
}
