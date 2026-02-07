import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, DollarSign, Home, Briefcase, TrendingUp, MapPin,
  CheckCircle2, XCircle, ArrowRight, BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function NomadCompare() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const slugsParam = urlParams.get('cities');
  const initialSlugs = slugsParam ? slugsParam.split(',').slice(0, 3) : [];

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const { data: allLocations } = trpc.nomad.locations.useQuery();

  // Fetch data for selected locations
  const location1 = trpc.nomad.locationBySlug.useQuery(
    { slug: selectedSlugs[0] || "" },
    { enabled: !!selectedSlugs[0] }
  );
  const location2 = trpc.nomad.locationBySlug.useQuery(
    { slug: selectedSlugs[1] || "" },
    { enabled: !!selectedSlugs[1] }
  );
  const location3 = trpc.nomad.locationBySlug.useQuery(
    { slug: selectedSlugs[2] || "" },
    { enabled: !!selectedSlugs[2] }
  );

  const locations = useMemo(() => {
    return [location1.data, location2.data, location3.data].filter(Boolean);
  }, [location1.data, location2.data, location3.data]);

  const handleAddLocation = (slug: string) => {
    if (selectedSlugs.length < 3 && !selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const handleRemoveLocation = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter(s => s !== slug));
  };

  const availableLocations = useMemo(() => {
    return allLocations?.filter(loc => !selectedSlugs.includes(loc.slug)) || [];
  }, [allLocations, selectedSlugs]);

  // Prepare chart data
  const salaryData = locations.map(loc => ({
    name: `${loc?.city}, ${loc?.state}`,
    salary: loc?.averageSalary || 0
  }));

  const costData = locations.map(loc => ({
    name: `${loc?.city}, ${loc?.state}`,
    rent: loc?.medianRent || 0,
    costIndex: loc?.costOfLivingIndex || 0
  }));

  const opportunityData = locations.map(loc => ({
    name: `${loc?.city}, ${loc?.state}`,
    jobs: loc?.jobOpenings || 0,
    score: loc?.opportunityScore || 0
  }));

  // Radar chart data for overall comparison
  const radarData = [
    {
      metric: "Opportunity Score",
      ...Object.fromEntries(locations.map((loc, idx) => [`City ${idx + 1}`, loc?.opportunityScore || 0]))
    },
    {
      metric: "Salary (x100)",
      ...Object.fromEntries(locations.map((loc, idx) => [`City ${idx + 1}`, (loc?.averageSalary || 0) / 100]))
    },
    {
      metric: "Job Openings",
      ...Object.fromEntries(locations.map((loc, idx) => [`City ${idx + 1}`, loc?.jobOpenings || 0]))
    },
    {
      metric: "Affordability",
      ...Object.fromEntries(locations.map((loc, idx) => [`City ${idx + 1}`, Math.max(0, 150 - (loc?.costOfLivingIndex || 100))]))
    }
  ];

  const getDemandBadgeVariant = (level: string) => {
    switch (level) {
      case "very_high": return "default";
      case "high": return "secondary";
      case "medium": return "outline";
      default: return "outline";
    }
  };

  const getDemandLabel = (level: string) => {
    return level.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  // Calculate estimated relocation costs
  const calculateRelocationCost = (location: typeof locations[0]) => {
    if (!location) return 0;
    const movingCost = 2000; // Average moving cost
    const firstMonthRent = location.medianRent || 0;
    const securityDeposit = location.medianRent || 0;
    const setupCosts = 1500; // Utilities, furniture, etc.
    return movingCost + firstMonthRent + securityDeposit + setupCosts;
  };

  const isLoading = location1.isLoading || location2.isLoading || location3.isLoading;

  if (selectedSlugs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-12">
          <Link href="/nomad">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Compare Locations</CardTitle>
              <CardDescription>
                Select 2-3 cities to compare side-by-side metrics, costs, and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Select Cities to Compare</Label>
                {[0, 1, 2].map(idx => (
                  <div key={idx}>
                    <Select
                      value={selectedSlugs[idx] || ""}
                      onValueChange={(value) => handleAddLocation(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select City ${idx + 1}${idx === 0 ? " (Required)" : " (Optional)"}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLocations.map(loc => (
                          <SelectItem key={loc.slug} value={loc.slug}>
                            {loc.city}, {loc.state} (Score: {loc.opportunityScore})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {selectedSlugs.length >= 2 && (
                  <Button className="w-full mt-4">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Compare Selected Cities
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <Link href="/nomad">
            <Button variant="ghost" size="sm" className="mb-4 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Location Comparison</h1>
          <p className="text-lg text-primary-foreground/90">
            Side-by-side analysis of {locations.length} cities
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Location Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selected Cities</CardTitle>
            <CardDescription>Add or remove cities to compare (2-3 cities recommended)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map(idx => (
                <div key={idx}>
                  {selectedSlugs[idx] ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {locations[idx]?.city}, {locations[idx]?.state}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLocation(selectedSlugs[idx]!)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value=""
                      onValueChange={handleAddLocation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Add City ${idx + 1}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLocations.map(loc => (
                          <SelectItem key={loc.slug} value={loc.slug}>
                            {loc.city}, {loc.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading comparison data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats Comparison */}
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              {locations.map((loc, idx) => (
                <Card key={idx} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {loc?.city}, {loc?.state}
                    </CardTitle>
                    <CardDescription>{loc?.region}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Opportunity Score</span>
                      <span className="text-2xl font-bold text-primary">{loc?.opportunityScore}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Salary</span>
                        <span className="font-semibold">${loc?.averageSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Median Rent</span>
                        <span className="font-semibold">${loc?.medianRent?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Job Openings</span>
                        <span className="font-semibold">{loc?.jobOpenings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cost Index</span>
                        <span className="font-semibold">{loc?.costOfLivingIndex}</span>
                      </div>
                    </div>
                    <Badge variant={getDemandBadgeVariant(loc?.demandLevel || "")} className="w-full justify-center">
                      {getDemandLabel(loc?.demandLevel || "")} Demand
                    </Badge>
                    <Link href={`/nomad/${loc?.slug}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Salary Comparison Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Average Salary Comparison</CardTitle>
                <CardDescription>Annual salary for tool & die makers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Bar dataKey="salary" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost of Living Comparison */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cost of Living Comparison</CardTitle>
                <CardDescription>Median rent and cost of living index</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="rent" fill="hsl(var(--primary))" name="Median Rent ($)" />
                    <Bar yAxisId="right" dataKey="costIndex" fill="hsl(var(--secondary))" name="Cost Index" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Opportunity Comparison */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Opportunity Metrics</CardTitle>
                <CardDescription>Job openings and opportunity scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={opportunityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="jobs" fill="hsl(var(--primary))" name="Job Openings" />
                    <Bar yAxisId="right" dataKey="score" fill="hsl(var(--chart-2))" name="Opportunity Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Overall Comparison Radar */}
            {locations.length >= 2 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Overall Comparison</CardTitle>
                  <CardDescription>Multi-dimensional comparison across key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis />
                      {locations.map((_, idx) => (
                        <Radar
                          key={idx}
                          name={`${locations[idx]?.city}, ${locations[idx]?.state}`}
                          dataKey={`City ${idx + 1}`}
                          stroke={`hsl(var(--chart-${idx + 1}))`}
                          fill={`hsl(var(--chart-${idx + 1}))`}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Relocation Cost Estimate */}
            <Card>
              <CardHeader>
                <CardTitle>Estimated Relocation Costs</CardTitle>
                <CardDescription>Initial costs to relocate to each city</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {locations.map((loc, idx) => (
                    <div key={idx} className="p-6 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold text-lg mb-4">{loc?.city}, {loc?.state}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Moving Costs</span>
                          <span className="font-medium">$2,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">First Month Rent</span>
                          <span className="font-medium">${loc?.medianRent?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Security Deposit</span>
                          <span className="font-medium">${loc?.medianRent?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Setup Costs</span>
                          <span className="font-medium">$1,500</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-semibold">Total Estimate</span>
                          <span className="text-xl font-bold text-primary">
                            ${calculateRelocationCost(loc).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
