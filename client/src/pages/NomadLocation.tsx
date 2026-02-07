import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, DollarSign, Home, Briefcase, TrendingUp, ArrowLeft, 
  CheckCircle2, Clock, AlertCircle, Calculator, GraduationCap,
  Building2, Users, Target
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NomadLocation() {
  const [, params] = useRoute("/nomad/:slug");
  const slug = params?.slug || "";

  const { data: location, isLoading: locationLoading } = trpc.nomad.locationBySlug.useQuery({ slug });
  const { data: preDepartureSteps } = trpc.nomad.relocationSteps.useQuery(
    { locationId: location?.id || 0, phase: "pre_departure" },
    { enabled: !!location }
  );
  const { data: postArrivalSteps } = trpc.nomad.relocationSteps.useQuery(
    { locationId: location?.id || 0, phase: "post_arrival" },
    { enabled: !!location }
  );
  const { data: trainingPrograms } = trpc.nomad.trainingPrograms.useQuery();

  // Job Probability Calculator State
  const [experienceLevel, setExperienceLevel] = useState<"entry" | "mid" | "senior" | "expert">("mid");
  const [hasApprenticeship, setHasApprenticeship] = useState(false);
  const [hasCertification, setHasCertification] = useState(false);
  const [hasDegree, setHasDegree] = useState(false);

  const { data: jobProbability } = trpc.nomad.calculateJobProbability.useQuery(
    {
      locationId: location?.id || 0,
      experienceLevel,
      hasApprenticeship,
      hasCertification,
      hasDegree
    },
    { enabled: !!location }
  );

  if (locationLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading location details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Location Not Found</CardTitle>
            <CardDescription>The requested location could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/nomad">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunity Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const employers = location.majorEmployers ? JSON.parse(location.majorEmployers) : [];
  const industries = location.industries ? JSON.parse(location.industries) : [];

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "high": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "medium": return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <Link href="/nomad">
            <Button variant="ghost" size="sm" className="mb-4 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {location.city}, {location.state}
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-4">{location.region}</p>
              <p className="text-lg text-primary-foreground/80 max-w-3xl">{location.description}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{location.opportunityScore}</div>
              <div className="text-sm text-primary-foreground/80">Opportunity Score</div>
              <Badge variant="secondary" className="mt-2">
                {getDemandLabel(location.demandLevel)} Demand
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${location.averageSalary?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Annual for tool & die makers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Median Rent</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${location.medianRent?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly for 1-2 bedroom</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Job Openings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{location.jobOpenings}</div>
              <p className="text-xs text-muted-foreground mt-1">Current opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Cost of Living</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{location.costOfLivingIndex}</div>
              <p className="text-xs text-muted-foreground mt-1">Index (100 = national avg)</p>
            </CardContent>
          </Card>
        </div>

        {/* Industry Info */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Major Employers
              </CardTitle>
              <CardDescription>Top companies hiring tool & die professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {employers.map((employer: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{employer}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Industries
              </CardTitle>
              <CardDescription>Manufacturing sectors with tool & die demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-sm py-2 px-3">
                    {industry}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="calculator">Job Calculator</TabsTrigger>
            <TabsTrigger value="pre-departure">Pre-Departure</TabsTrigger>
            <TabsTrigger value="post-arrival">Post-Arrival</TabsTrigger>
          </TabsList>

          {/* Job Probability Calculator */}
          <TabsContent value="calculator" id="calculator">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Job Probability Calculator
                </CardTitle>
                <CardDescription>
                  Calculate your chances of landing a job in {location.city} based on your experience and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={(value: any) => setExperienceLevel(value)}>
                      <SelectTrigger id="experience" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Credentials & Training</Label>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Completed Apprenticeship</div>
                          <div className="text-sm text-muted-foreground">DOL-approved 4-year program</div>
                        </div>
                      </div>
                      <Switch checked={hasApprenticeship} onCheckedChange={setHasApprenticeship} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Industry Certification</div>
                          <div className="text-sm text-muted-foreground">NIMS, AWS, or equivalent</div>
                        </div>
                      </div>
                      <Switch checked={hasCertification} onCheckedChange={setHasCertification} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Associate Degree or Higher</div>
                          <div className="text-sm text-muted-foreground">Manufacturing or related field</div>
                        </div>
                      </div>
                      <Switch checked={hasDegree} onCheckedChange={setHasDegree} />
                    </div>
                  </div>
                </div>

                {jobProbability && (
                  <div className="mt-8 p-6 bg-primary/5 border-2 border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">Your Job Probability</h3>
                        <p className="text-sm text-muted-foreground">Based on your profile</p>
                      </div>
                      <div className="text-5xl font-bold text-primary">{jobProbability.baseProbability}%</div>
                    </div>
                    <Progress value={jobProbability.baseProbability} className="h-3 mb-4" />
                    <div className="grid gap-4 md:grid-cols-2 mt-6">
                      <div className="p-4 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Expected Time to Hire</div>
                        <div className="text-xl font-semibold">{jobProbability.timeToHire}</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Expected Salary Range</div>
                        <div className="text-xl font-semibold">{jobProbability.expectedSalaryRange}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Training Recommendations */}
                {trainingPrograms && trainingPrograms.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Boost Your Chances with Training
                    </h3>
                    <div className="space-y-3">
                      {trainingPrograms.slice(0, 3).map(program => (
                        <Card key={program.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{program.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{program.provider}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    +{program.jobProbabilityBoost}% job probability
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    +${program.salaryImpact?.toLocaleString()} salary
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {program.duration}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-bold">${program.cost?.toLocaleString()}</div>
                                {program.availableOnline === 1 && (
                                  <Badge variant="secondary" className="text-xs mt-1">Online</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pre-Departure Checklist */}
          <TabsContent value="pre-departure">
            <Card>
              <CardHeader>
                <CardTitle>Pre-Departure Checklist</CardTitle>
                <CardDescription>
                  Complete these steps before moving to {location.city}. Start 3-6 months before your planned move date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preDepartureSteps && preDepartureSteps.length > 0 ? (
                  <div className="space-y-6">
                    {preDepartureSteps.map(step => {
                      const resources = step.resources ? JSON.parse(step.resources) : [];
                      return (
                        <div key={step.id} className="p-4 sm:p-6 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="mt-1 flex-shrink-0">{getPriorityIcon(step.priority)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold break-words">{step.title}</h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {step.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {getPriorityLabel(step.priority)} Priority
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 sm:text-right">
                                  {step.estimatedCost && step.estimatedCost > 0 && (
                                    <div className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                                      ${step.estimatedCost.toLocaleString()}
                                    </div>
                                  )}
                                  {step.estimatedTime && (
                                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{step.estimatedTime}</div>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-4">{step.description}</p>
                              {resources.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Resources:</div>
                                  <div className="space-y-1">
                                    {resources.map((resource: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-primary" />
                                        {resource.url ? (
                                          <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                          >
                                            {resource.name}
                                          </a>
                                        ) : (
                                          <span className="text-sm">{resource.name}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No pre-departure steps available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post-Arrival Checklist */}
          <TabsContent value="post-arrival">
            <Card>
              <CardHeader>
                <CardTitle>Post-Arrival Checklist</CardTitle>
                <CardDescription>
                  Complete these steps after arriving in {location.city}. Prioritize critical items in your first 30 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postArrivalSteps && postArrivalSteps.length > 0 ? (
                  <div className="space-y-6">
                    {postArrivalSteps.map(step => {
                      const resources = step.resources ? JSON.parse(step.resources) : [];
                      return (
                        <div key={step.id} className="p-4 sm:p-6 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="mt-1 flex-shrink-0">{getPriorityIcon(step.priority)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold break-words">{step.title}</h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {step.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {getPriorityLabel(step.priority)} Priority
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 sm:text-right">
                                  {step.estimatedCost && step.estimatedCost > 0 && (
                                    <div className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                                      ${step.estimatedCost.toLocaleString()}
                                    </div>
                                  )}
                                  {step.estimatedTime && (
                                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{step.estimatedTime}</div>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-4">{step.description}</p>
                              {resources.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Resources:</div>
                                  <div className="space-y-1">
                                    {resources.map((resource: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-primary" />
                                        {resource.url ? (
                                          <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                          >
                                            {resource.name}
                                          </a>
                                        ) : (
                                          <span className="text-sm">{resource.name}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No post-arrival steps available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
