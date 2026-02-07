import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Award, MapPin, DollarSign, Clock, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CareerStep {
  id: string;
  role: string;
  salary: string;
  description: string;
  requiredCerts: string[];
  skills: string[];
  timeToAchieve: string;
  probabilityBoost: number;
  nextSteps: string[];
  hotspots: string[];
}

const careerLadder: CareerStep[] = [
  {
    id: "entry",
    role: "General Labor / Entry-Level",
    salary: "$35k - $45k",
    description: "Starting point for career changers, veterans, or those new to manufacturing. No experience required.",
    requiredCerts: ["High School Diploma or GED", "OSHA 10-Hour Safety Card (Optional but recommended)"],
    skills: ["Basic math", "Attention to detail", "Willingness to learn", "Physical stamina"],
    timeToAchieve: "Immediate - Start today",
    probabilityBoost: 0,
    nextSteps: [
      "Apply as delivery driver, forklift operator, or general laborer at manufacturing companies",
      "Prove work ethic on the job",
      "Ask employer about paid training programs"
    ],
    hotspots: ["Arizona (TSMC, Intel)", "Texas (Samsung, TI)", "Ohio (Intel Silicon Heartland)"]
  },
  {
    id: "operator",
    role: "CNC Operator / Manufacturing Technician",
    salary: "$46k - $57k",
    description: "Operate computer-controlled machines. Entry to skilled manufacturing with clear advancement path.",
    requiredCerts: [
      "CMfgA (Certified Manufacturing Associate) - $75 student / $195 non-member",
      "NIMS Level 1 (Measurement, Materials, Safety) - ~$150-$300",
      "OSHA 10-Hour Card - ~$50-$100"
    ],
    skills: ["Blueprint reading", "Basic CNC operation", "Quality inspection", "Shop math", "Safety protocols"],
    timeToAchieve: "2-6 months from entry-level",
    probabilityBoost: 20,
    nextSteps: [
      "Enroll in CMfgA exam prep (online, self-paced)",
      "Take NIMS Level 1 certification at local testing center",
      "Apply to CNC Operator roles at manufacturers in hotspot regions"
    ],
    hotspots: ["All megafab regions", "Midwest tool & die clusters", "Southeast automotive hubs"]
  },
  {
    id: "machinist",
    role: "Machinist / Semiconductor Technician",
    salary: "$57k - $70k",
    description: "Skilled technician role. Program machines, troubleshoot, maintain equipment. High demand in semiconductor fabs.",
    requiredCerts: [
      "NIMS Level 1 + Level 2 (CNC Mill/Lathe) - ~$300-$600 total",
      "Siemens MSCP Level 1 (Mechatronics) - ~$2,500 (16-week course)",
      "FAME Apprenticeship (2-year, earn $30k+ while training, debt-free)"
    ],
    skills: ["CNC programming (G-code)", "CAD/CAM basics", "Precision measurement", "Troubleshooting", "Equipment maintenance"],
    timeToAchieve: "1-2 years from operator level",
    probabilityBoost: 35,
    nextSteps: [
      "Apply to FAME apprenticeship (Federation for Advanced Manufacturing Education)",
      "OR take Siemens MSCP course at community college",
      "Learn G-code and CAM software (FreeMILL is free for learning)",
      "Target semiconductor technician roles in AZ, TX, OH, NY"
    ],
    hotspots: ["Arizona (TSMC 6k jobs)", "Texas (Samsung 3.5k jobs)", "Ohio (Intel)", "New York (Micron)"]
  },
  {
    id: "specialist",
    role: "Advanced Technician / Tool & Die Maker",
    salary: "$63k - $87k",
    description: "Specialized roles requiring hybrid skills. Create precision tools, dies, and molds. High-value 'versatile badass' combining mechanical, electrical, and software knowledge.",
    requiredCerts: [
      "CMfgT (Certified Manufacturing Technologist) - $245 member / $490 non-member",
      "AWS Welding Certification (if applicable) - ~$500-$1,000",
      "RJG Master Molder (for injection molding) - Employer-sponsored",
      "CAMF (Certified Additive Manufacturing Fundamentals) - ~$200-$400"
    ],
    skills: ["CAD/CAM proficiency", "GD&T (Geometric Dimensioning & Tolerancing)", "3D printing/additive manufacturing", "Metrology", "Multi-axis CNC", "Problem-solving"],
    timeToAchieve: "2-4 years from machinist level",
    probabilityBoost: 50,
    nextSteps: [
      "Master CAD software (SolidWorks, Fusion 360)",
      "Learn GD&T through YouTube crash courses or Udemy",
      "Add 3D printing skills (97% cost reduction for tooling)",
      "Target tool & die roles in aerospace, medical devices, automotive"
    ],
    hotspots: ["Washington ($78k median)", "Oregon ($75k)", "Midwest tool & die clusters"]
  },
  {
    id: "engineer",
    role: "Manufacturing Engineer / Tooling Engineer",
    salary: "$75k - $110k",
    description: "Design and optimize manufacturing processes. Bridge between shop floor and engineering. High-value 'Solution Provider' roles.",
    requiredCerts: [
      "Bachelor's degree (Mechanical/Manufacturing Engineering) - OR -",
      "Associate degree + 5+ years experience + certifications",
      "Lean Bronze/Green Belt - ~$300-$1,000",
      "ASQ Certified Quality Technician (CQT) - ~$400"
    ],
    skills: ["Process optimization", "Digital twins/simulation", "Project management", "Soft skills (EQ, active listening)", "Technical communication", "Data analysis"],
    timeToAchieve: "4-6 years total from entry-level",
    probabilityBoost: 65,
    nextSteps: [
      "Pursue associate or bachelor's degree (part-time while working)",
      "OR accumulate 5+ years experience with advanced certifications",
      "Develop soft skills: EQ, active listening, customer translation",
      "Learn simulation software and digital twin technology"
    ],
    hotspots: ["All major manufacturing hubs", "R&D facilities (Albany EUV, ASU Advanced Packaging)"]
  },
  {
    id: "specialist_high_na",
    role: "High-NA EUV Lithography Specialist",
    salary: "$100k - $160k+",
    description: "Elite semiconductor role. Maintain and operate $380M High-NA EUV lithography equipment. 'F-35 fighter jet' level complexity. Severe shortage driving premium pay.",
    requiredCerts: [
      "ASML Phoenix Training Center certification (1,000+ engineers/year capacity)",
      "Intel 14A process training (first commercial High-NA tool)",
      "Cleanroom protocol (ISO Class 1)",
      "Mechatronics + precision optics background"
    ],
    skills: [
      "Precision optics & alignment (0.7nm overlay accuracy)",
      "Thermal & mechanical control",
      "Process co-optimization (masks, etch, metrology)",
      "Contamination control (cleanroom ISO 1/5)",
      "Electro-mechanical integration",
      "Nanometer-level positioning"
    ],
    timeToAchieve: "6-10 years total from entry-level",
    probabilityBoost: 85,
    nextSteps: [
      "Work as semiconductor technician at Intel, TSMC, or Samsung",
      "Apply to ASML Phoenix Training Center",
      "Specialize in lithography equipment maintenance",
      "Target Intel 14A process roles (first commercial High-NA)"
    ],
    hotspots: ["Arizona (ASML Phoenix, Intel, TSMC)", "Oregon (Intel Hillsboro)", "New York (Albany EUV Accelerator)"]
  }
];

export default function IndustrialLadder() {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("entry");

  const getCurrentStepIndex = () => {
    return careerLadder.findIndex(step => step.id === currentLevel);
  };

  const getNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex < careerLadder.length - 1 ? careerLadder[currentIndex + 1] : null;
  };

  const calculateTotalBoost = () => {
    const currentIndex = getCurrentStepIndex();
    const targetIndex = selectedStep ? careerLadder.findIndex(s => s.id === selectedStep) : currentIndex;
    
    let totalBoost = 0;
    for (let i = currentIndex + 1; i <= targetIndex; i++) {
      if (i < careerLadder.length) {
        totalBoost += careerLadder[i].probabilityBoost;
      }
    }
    return totalBoost;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">The Industrial Ladder</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Your step-by-step roadmap from entry-level to $160k+ High-NA specialist. No guesswork—just clear certifications, salary ranges, and time estimates.
        </p>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>The Blue Ocean Opportunity:</strong> 2.1 million manufacturing jobs will go unfilled by 2030. 
            The workers aren't missing—they lack <strong>certification and awareness</strong>. This ladder shows you exactly what to do next.
          </AlertDescription>
        </Alert>
      </div>

      {/* Current Level Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Where Are You Now?</CardTitle>
          <CardDescription>Select your current experience level to see your next step</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {careerLadder.slice(0, 3).map((step) => (
              <Button
                key={step.id}
                variant={currentLevel === step.id ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-start"
                onClick={() => setCurrentLevel(step.id)}
              >
                <span className="font-semibold text-left">{step.role}</span>
                <span className="text-sm text-muted-foreground">{step.salary}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Step Highlight */}
      {getNextStep() && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Your Next Move</CardTitle>
            </div>
            <CardDescription>
              From <strong>{careerLadder[getCurrentStepIndex()].role}</strong> to <strong>{getNextStep()!.role}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salary Increase
                </h3>
                <p className="text-2xl font-bold text-primary">{getNextStep()!.salary}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  +{getNextStep()!.probabilityBoost}% job probability boost
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time to Achieve
                </h3>
                <p className="text-lg">{getNextStep()!.timeToAchieve}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Required Certifications
              </h3>
              <ul className="space-y-2">
                {getNextStep()!.requiredCerts.map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">Action Steps</h3>
              <ol className="space-y-2">
                {getNextStep()!.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Hotspot Regions
              </h3>
              <div className="flex flex-wrap gap-2">
                {getNextStep()!.hotspots.map((location, idx) => (
                  <Badge key={idx} variant="secondary">{location}</Badge>
                ))}
              </div>
            </div>

            <Button className="w-full mt-6" size="lg">
              <span>Get Started: Apply for {getNextStep()!.role} Roles</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Full Career Ladder */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Complete Career Pathway</h2>
        <p className="text-muted-foreground mb-6">
          Click any role to see detailed requirements, skills, and action steps. Each step builds on the previous one.
        </p>
      </div>

      <div className="space-y-6">
        {careerLadder.map((step, index) => (
          <Card 
            key={step.id}
            className={`cursor-pointer transition-all ${
              selectedStep === step.id ? 'ring-2 ring-primary' : ''
            } ${currentLevel === step.id ? 'border-primary' : ''}`}
            onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <CardTitle className="text-xl">{step.role}</CardTitle>
                      {currentLevel === step.id && (
                        <Badge variant="default" className="mt-1">You are here</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="ml-11">{step.description}</CardDescription>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-primary">{step.salary}</p>
                  {step.probabilityBoost > 0 && (
                    <p className="text-sm text-muted-foreground">+{step.probabilityBoost}% boost</p>
                  )}
                </div>
              </div>
            </CardHeader>

            {selectedStep === step.id && (
              <CardContent className="ml-11 border-t pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Required Certifications
                    </h3>
                    <ul className="space-y-2">
                      {step.requiredCerts.map((cert, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {step.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">How to Get There</h3>
                  <ol className="space-y-3">
                    {step.nextSteps.map((nextStep, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-sm pt-0.5">{nextStep}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Best Locations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {step.hotspots.map((location, idx) => (
                      <Badge key={idx} variant="secondary">{location}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Time to achieve:</strong> {step.timeToAchieve}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="mt-8 bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Climbing?</h2>
          <p className="mb-6">
            The path from $35k to $160k is clear. Every certification adds 15-25% to your job probability. 
            The only question is: when do you start?
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" size="lg">
              Find Training Programs Near You
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Explore Apprenticeships
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Glossary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Glossary: What Do These Acronyms Mean?</CardTitle>
          <CardDescription>Manufacturing has a lot of jargon. Here's what everything means in plain English.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="font-semibold">CMfgA</dt>
              <dd className="text-sm text-muted-foreground">Certified Manufacturing Associate - Entry-level certification from SME</dd>
            </div>
            <div>
              <dt className="font-semibold">CMfgT</dt>
              <dd className="text-sm text-muted-foreground">Certified Manufacturing Technologist - Advanced certification requiring 4 years experience</dd>
            </div>
            <div>
              <dt className="font-semibold">NIMS</dt>
              <dd className="text-sm text-muted-foreground">National Institute for Metalworking Skills - Industry-standard machining certifications</dd>
            </div>
            <div>
              <dt className="font-semibold">FAME</dt>
              <dd className="text-sm text-muted-foreground">Federation for Advanced Manufacturing Education - Debt-free apprenticeship model, earn $30k+ while training</dd>
            </div>
            <div>
              <dt className="font-semibold">GD&T</dt>
              <dd className="text-sm text-muted-foreground">Geometric Dimensioning & Tolerancing - Language for specifying precision in manufacturing drawings</dd>
            </div>
            <div>
              <dt className="font-semibold">High-NA EUV</dt>
              <dd className="text-sm text-muted-foreground">High Numerical Aperture Extreme Ultraviolet Lithography - $380M machines for sub-2nm chip manufacturing</dd>
            </div>
            <div>
              <dt className="font-semibold">CAD/CAM</dt>
              <dd className="text-sm text-muted-foreground">Computer-Aided Design / Computer-Aided Manufacturing - Software for designing and programming CNC machines</dd>
            </div>
            <div>
              <dt className="font-semibold">OSHA</dt>
              <dd className="text-sm text-muted-foreground">Occupational Safety and Health Administration - Federal safety standards and training</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
