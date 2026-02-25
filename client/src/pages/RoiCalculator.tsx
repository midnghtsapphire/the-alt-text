import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Calculator, AlertTriangle, ArrowRight, DollarSign, Clock, Shield } from "lucide-react";
import { useState, useMemo } from "react";

export default function RoiCalculator() {
  const [images, setImages] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [minutesPerImage, setMinutesPerImage] = useState(3);

  const calc = useMemo(() => {
    const manualHours = (images * minutesPerImage) / 60;
    const manualCost = manualHours * hourlyRate;
    const aiCost = images <= 50 ? 0 : images <= 2000 ? 29 : 99;
    const savings = manualCost - aiCost;
    const timeSaved = manualHours;
    const lawsuitRisk = images > 0 ? 75000 : 0;
    return { manualHours: manualHours.toFixed(1), manualCost: Math.round(manualCost), aiCost, savings: Math.round(savings), timeSaved: timeSaved.toFixed(1), lawsuitRisk };
  }, [images, hourlyRate, minutesPerImage]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs mb-4">
              <Calculator className="w-3 h-3 text-primary" /> ROI Calculator
            </div>
            <h1 className="text-3xl font-bold mb-3">Calculate Your Savings</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See how much time and money you save with AI-generated alt text vs. manual writing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-6">Your Numbers</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Images per month</label>
                  <Input type="number" value={images} onChange={(e) => setImages(Number(e.target.value) || 0)} min={0} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hourly rate ($)</label>
                  <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value) || 0)} min={0} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Minutes per image (manual)</label>
                  <Input type="number" value={minutesPerImage} onChange={(e) => setMinutesPerImage(Number(e.target.value) || 0)} min={1} max={30} />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-success-green" />
                  <h3 className="font-semibold">Monthly Savings</h3>
                </div>
                <div className="text-4xl font-extrabold text-success-green">${calc.savings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Manual: ${calc.manualCost.toLocaleString()}/mo vs TheAltText: ${calc.aiCost}/mo
                </div>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Time Saved</h3>
                </div>
                <div className="text-4xl font-extrabold text-primary">{calc.timeSaved} hrs</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Per month — redirected to higher-value work
                </div>
              </div>

              <div className="glass-card p-5 border-destructive/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold">Lawsuit Risk Without Alt Text</h3>
                </div>
                <div className="text-4xl font-extrabold text-destructive">Up to ${calc.lawsuitRisk.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Average ADA web accessibility lawsuit settlement
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => window.location.href = getLoginUrl()}>
                Start Saving Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
