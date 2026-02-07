import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, Clock, Award, TrendingUp, Zap } from "lucide-react";

interface CareerLevel {
  id: number;
  title: string;
  salaryRange: string;
  timeToReach: string;
  description: string;
  skills: string[];
  certifications: string[];
  entryPoints: string[];
}

const careerLevels: CareerLevel[] = [
  {
    id: 1,
    title: "Entry-Level Technician",
    salaryRange: "$45,000 - $65,000",
    timeToReach: "0-6 months",
    description: "Start your journey in mechatronics with hands-on technical work. Perfect for career changers and recent graduates.",
    skills: ["Basic electronics", "Hand tools", "Safety protocols", "Blueprint reading"],
    certifications: ["OSHA 10", "Basic Manufacturing Certification", "Forklift License"],
    entryPoints: ["Manufacturing worker", "Military veteran", "Trade school graduate", "Career changer"]
  },
  {
    id: 2,
    title: "Robotics Technician",
    salaryRange: "$55,000 - $75,000",
    timeToReach: "6-18 months",
    description: "Specialize in robotics systems, automation, and industrial equipment maintenance.",
    skills: ["PLC programming", "Robotics maintenance", "Electrical troubleshooting", "CAD basics"],
    certifications: ["FANUC Robotics", "NIMS Level 1", "Electrical Safety"],
    entryPoints: ["Entry-level technician", "Electrician", "IT support"]
  },
  {
    id: 3,
    title: "Automation Specialist",
    salaryRange: "$75,000 - $95,000",
    timeToReach: "1.5-3 years",
    description: "Design and implement automated systems. Bridge mechanical and software engineering.",
    skills: ["Advanced PLC", "HMI programming", "System integration", "Process optimization"],
    certifications: ["Siemens Mechatronics", "Rockwell Automation", "Six Sigma Green Belt"],
    entryPoints: ["Robotics technician", "Controls engineer", "Process technician"]
  },
  {
    id: 4,
    title: "Mechatronics Engineer",
    salaryRange: "$95,000 - $120,000",
    timeToReach: "3-5 years",
    description: "Full-stack mechatronics professional combining mechanical, electrical, and software expertise.",
    skills: ["System design", "Embedded systems", "IoT integration", "Project management"],
    certifications: ["PE License (optional)", "PMP", "Advanced Robotics"],
    entryPoints: ["Automation specialist", "Mechanical engineer", "Software engineer"]
  },
  {
    id: 5,
    title: "Senior Specialist / Team Lead",
    salaryRange: "$120,000 - $150,000",
    timeToReach: "5-8 years",
    description: "Lead complex projects and mentor junior engineers. Strategic technical decision-maker.",
    skills: ["Team leadership", "Budget management", "Advanced troubleshooting", "Vendor relations"],
    certifications: ["Industry 4.0 Certification", "Leadership Training", "Specialized vendor certs"],
    entryPoints: ["Mechatronics engineer", "Senior technician", "Project engineer"]
  },
  {
    id: 6,
    title: "Principal Engineer / Director",
    salaryRange: "$150,000 - $200,000+",
    timeToReach: "8-12 years",
    description: "Strategic leadership role shaping company technology direction and innovation.",
    skills: ["Strategic planning", "Innovation leadership", "Cross-functional management", "Business acumen"],
    certifications: ["Executive Leadership", "Industry-specific advanced certs"],
    entryPoints: ["Senior specialist", "Engineering manager", "Technical director"]
  }
];

export default function CareerHighway() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [startingPoint, setStartingPoint] = useState<string | null>(null);

  const startingOptions = [
    { id: "manufacturing", label: "Manufacturing Worker", icon: "🏭" },
    { id: "it", label: "IT / Tech Support", icon: "💻" },
    { id: "trades", label: "Electrician / Trades", icon: "⚡" },
    { id: "military", label: "Military Veteran", icon: "🎖️" },
    { id: "graduate", label: "Recent Graduate", icon: "🎓" },
    { id: "career-change", label: "Career Changer", icon: "🔄" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b border-border">
        <div className="container py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 text-lg px-4 py-2" variant="secondary">
              <Zap className="h-5 w-5 mr-2 inline" />
              Infomechatronics Career Highway
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Discover Where You Stand. Know Where You're Going.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              You don't know your true position in the tech landscape. AI reveals your hidden qualifications, maps your transferable skills, and shows you the exact path to $100k+ mechatronics careers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 bg-card px-6 py-3 rounded-lg border border-border">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">$75k</div>
                  <div className="text-sm text-muted-foreground">Avg Salary Increase</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-card px-6 py-3 rounded-lg border border-border">
                <Clock className="h-5 w-5 text-accent" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">18-36 mo</div>
                  <div className="text-sm text-muted-foreground">Avg Transition Time</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-card px-6 py-3 rounded-lg border border-border">
                <Award className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">87%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Starting Point Selector */}
        <Card className="mb-12 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <span className="text-4xl">🚀</span>
              Where Are You Starting From?
            </CardTitle>
            <CardDescription className="text-lg">
              Select your current background to see your personalized career highway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {startingOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={startingPoint === option.id ? "default" : "outline"}
                  className="h-auto py-6 flex flex-col gap-2"
                  onClick={() => setStartingPoint(option.id)}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              ))}
            </div>
            {startingPoint && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Great choice!</strong> Your journey is highlighted below. Scroll down to see your personalized roadmap.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Highway Visualization */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Career Highway</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Each level builds on the previous one. Click any level to see detailed requirements, certifications, and entry points.
          </p>

          <div className="relative">
            {/* Highway Road */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary transform -translate-x-1/2 hidden md:block" />

            {/* Career Levels */}
            <div className="space-y-8">
              {careerLevels.map((level, index) => (
                <div
                  key={level.id}
                  className={`relative ${index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-auto'} md:w-[calc(50%-2rem)]`}
                >
                  {/* Milestone Marker */}
                  <div className="absolute left-1/2 top-8 w-8 h-8 bg-primary rounded-full border-4 border-background transform -translate-x-1/2 z-10 hidden md:flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{level.id}</span>
                  </div>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedLevel === level.id ? 'border-2 border-primary shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Level {level.id}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {level.timeToReach}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl mb-2">{level.title}</CardTitle>
                          <div className="flex items-center gap-2 text-primary font-bold text-xl">
                            <DollarSign className="h-5 w-5" />
                            {level.salaryRange}
                          </div>
                        </div>
                        <ArrowRight className={`h-6 w-6 text-muted-foreground transition-transform ${
                          selectedLevel === level.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      <CardDescription className="text-base mt-2">
                        {level.description}
                      </CardDescription>
                    </CardHeader>

                    {selectedLevel === level.id && (
                      <CardContent className="space-y-6 border-t border-border pt-6">
                        {/* Skills */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="text-xl">🛠️</span>
                            Key Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {level.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Certifications */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Award className="h-5 w-5 text-accent" />
                            Recommended Certifications
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {level.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="border-accent">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Entry Points */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="text-xl">🚪</span>
                            Common Entry Points
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {level.entryPoints.map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="h-4 w-4 text-primary" />
                                {entry}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 border-t border-border">
                          <Button className="w-full" size="lg">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Explore Training for This Level
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps CTA */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Ready to Start Your Journey?</CardTitle>
            <CardDescription className="text-center text-lg">
              Explore detailed training programs, calculate your ROI, and discover hidden opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button size="lg" variant="default" className="h-auto py-6 flex flex-col gap-2">
                <span className="text-2xl">🎓</span>
                <span>Find Training Programs</span>
              </Button>
              <Button size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
                <span className="text-2xl">💰</span>
                <span>Calculate Your ROI</span>
              </Button>
              <Button size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
                <span className="text-2xl">🔍</span>
                <span>Unbox Opportunities</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
