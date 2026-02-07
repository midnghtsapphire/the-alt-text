import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, DollarSign, Award, ExternalLink, Search, Filter, Info, GraduationCap, Briefcase } from "lucide-react";

interface TrainingProgram {
  id: string;
  name: string;
  provider: string;
  location: string;
  state: "AZ" | "TX" | "OH" | "NY";
  type: "quick-start" | "apprenticeship" | "bootcamp" | "certification" | "vr-training";
  duration: string;
  cost: string;
  description: string;
  outcomes: string[];
  hiringPartners: string[];
  applicationUrl: string;
  chipsActFunded: boolean;
  noExperienceRequired: boolean;
  earnWhileLearn: boolean;
}

const trainingPrograms: TrainingProgram[] = [
  // Arizona Programs
  {
    id: "mcccd-quick-start",
    name: "Semiconductor Quick Start Program",
    provider: "Maricopa Community College District (MCCCD)",
    location: "Phoenix Metro Area",
    state: "AZ",
    type: "quick-start",
    duration: "2 weeks",
    cost: "Free (CHIPS Act funded)",
    description: "Rapid entry into semiconductor manufacturing. Covers cleanroom protocol, safety, basic equipment operation. No experience required.",
    outcomes: ["Cleanroom certification", "Safety training", "Direct interviews with TSMC/Intel", "Job placement assistance"],
    hiringPartners: ["TSMC", "Intel", "Amkor Technology"],
    applicationUrl: "https://www.maricopa.edu/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: false
  },
  {
    id: "mast-program",
    name: "Maricopa Accelerated Semiconductor Training (MAST)",
    provider: "Maricopa Community College District",
    location: "Phoenix Metro Area",
    state: "AZ",
    type: "bootcamp",
    duration: "6-12 weeks",
    cost: "Free to low-cost (grant-funded)",
    description: "Comprehensive semiconductor technician training. Hands-on equipment experience, process fundamentals, quality control.",
    outcomes: ["Semiconductor technician certification", "Equipment operation skills", "Process knowledge", "Guaranteed interviews"],
    hiringPartners: ["TSMC (6,000 manufacturing jobs)", "Intel Ocotillo", "Amkor (2,000 jobs)"],
    applicationUrl: "https://www.maricopa.edu/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: false
  },
  {
    id: "tsmc-apprenticeship",
    name: "TSMC Registered Apprenticeship",
    provider: "TSMC Arizona",
    location: "Phoenix",
    state: "AZ",
    type: "apprenticeship",
    duration: "2-4 years",
    cost: "Free - Earn $40k-$60k while training",
    description: "State-supported registered apprenticeship for semiconductor technicians. First of its kind in Arizona. Earn while you learn.",
    outcomes: ["DOL Registered Apprenticeship certificate", "Semiconductor technician skills", "Full-time employment at TSMC", "$60k+ starting salary"],
    hiringPartners: ["TSMC Arizona ($65B investment)"],
    applicationUrl: "https://www.tsmc.com/english/careers",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: true
  },
  {
    id: "asml-training-center",
    name: "ASML Technical Training Academy",
    provider: "ASML Phoenix",
    location: "Phoenix",
    state: "AZ",
    type: "certification",
    duration: "Varies (weeks to months)",
    cost: "Employer-sponsored or $5k-$15k",
    description: "Train on High-NA EUV lithography equipment. 1,000+ engineers trained annually. Elite semiconductor equipment training.",
    outcomes: ["High-NA EUV certification", "Lithography specialist skills", "$100k-$160k salary potential", "Equipment maintenance expertise"],
    hiringPartners: ["Intel", "TSMC", "Samsung", "Micron"],
    applicationUrl: "https://www.asml.com/en/careers",
    chipsActFunded: false,
    noExperienceRequired: false,
    earnWhileLearn: false
  },

  // Texas Programs
  {
    id: "tel-austin-vr",
    name: "Tokyo Electron VR/AR Training Center",
    provider: "Tokyo Electron (TEL)",
    location: "Austin",
    state: "TX",
    type: "vr-training",
    duration: "Varies (days to weeks)",
    cost: "Free to low-cost (CHIPS funded)",
    description: "$30M training facility using VR/AR. Train 2,200 people/year. 4x faster learning than classroom. Digital twins of real equipment.",
    outcomes: ["VR-certified equipment operation", "275% more confidence in skills", "Risk-free training", "Job placement assistance"],
    hiringPartners: ["Samsung", "Texas Instruments", "NXP Semiconductors"],
    applicationUrl: "https://www.tel.com/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: false
  },
  {
    id: "samsung-taylor",
    name: "Samsung Semiconductor Workforce Program",
    provider: "Samsung Austin Semiconductor",
    location: "Taylor & Austin",
    state: "TX",
    type: "apprenticeship",
    duration: "2-3 years",
    cost: "Free - Earn $35k-$50k while training",
    description: "Workforce development for $40B Taylor expansion. 12,000 construction + 3,500 manufacturing jobs. Registered apprenticeships available.",
    outcomes: ["Semiconductor technician certification", "Equipment operation", "Full-time employment", "$50k-$70k starting salary"],
    hiringPartners: ["Samsung ($40B investment)", "Construction partners"],
    applicationUrl: "https://www.samsung.com/us/sas/careers/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: true
  },
  {
    id: "ti-sherman",
    name: "Texas Instruments Technician Training",
    provider: "Texas Instruments",
    location: "Sherman",
    state: "TX",
    type: "bootcamp",
    duration: "8-16 weeks",
    cost: "Free (company-sponsored)",
    description: "Training for 300mm wafer fab technicians. Four new fabs in Sherman. Workforce development partnerships with local colleges.",
    outcomes: ["Wafer fab technician skills", "Cleanroom certification", "TI employment", "$45k-$60k starting salary"],
    hiringPartners: ["Texas Instruments ($30B investment)"],
    applicationUrl: "https://careers.ti.com/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: false
  },

  // Ohio Programs
  {
    id: "intel-ohio",
    name: "Intel Silicon Heartland Training Partnership",
    provider: "Intel + Columbus State Community College",
    location: "Columbus",
    state: "OH",
    type: "bootcamp",
    duration: "12-24 weeks",
    cost: "Free to low-cost (CHIPS funded)",
    description: "Training for Intel's $28B Silicon Heartland megafab. Two fabs creating thousands of technician jobs. Partnership with local colleges.",
    outcomes: ["Semiconductor technician certification", "Intel-specific training", "Job placement", "$50k-$70k starting salary"],
    hiringPartners: ["Intel ($28B investment)", "Regional suppliers"],
    applicationUrl: "https://www.cscc.edu/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: false
  },

  // New York Programs
  {
    id: "micron-clay",
    name: "Micron Clay Megafab Workforce Program",
    provider: "Micron + Onondaga Community College",
    location: "Clay (Syracuse area)",
    state: "NY",
    type: "bootcamp",
    duration: "12-20 weeks",
    cost: "Free (CHIPS Act funded)",
    description: "$100B megafab investment. Largest private investment in NY history. Comprehensive technician training with guaranteed interviews.",
    outcomes: ["Semiconductor technician certification", "Memory manufacturing skills", "Micron employment", "$55k-$75k starting salary"],
    hiringPartners: ["Micron ($100B investment)"],
    applicationUrl: "https://www.sunyocc.edu/",
    chipsActFunded: true,
    noExperienceRequired: true,
    earnWhileLearn: false
  },
  {
    id: "albany-euv",
    name: "EUV Accelerator R&D Training",
    provider: "Albany NanoTech Complex",
    location: "Albany",
    state: "NY",
    type: "certification",
    duration: "Varies",
    cost: "$5k-$20k (or employer-sponsored)",
    description: "Advanced EUV lithography R&D facility. Train on cutting-edge equipment. Bridge 'lab-to-fab' gap. High-value engineering roles.",
    outcomes: ["EUV lithography skills", "R&D experience", "Advanced packaging knowledge", "$80k-$120k salary potential"],
    hiringPartners: ["IBM", "GlobalFoundries", "Micron", "Startups"],
    applicationUrl: "https://sunypoly.edu/",
    chipsActFunded: true,
    noExperienceRequired: false,
    earnWhileLearn: false
  },

  // National Programs
  {
    id: "fame-apprenticeship",
    name: "FAME Apprenticeship (National)",
    provider: "Federation for Advanced Manufacturing Education",
    location: "Multiple states",
    state: "AZ", // Default for filtering, but available nationwide
    type: "apprenticeship",
    duration: "2 years",
    cost: "Free - Earn $30k+ while training (debt-free)",
    description: "Gold standard earn-while-learn model. 2-year apprenticeship combining classroom and on-the-job training. Zero debt, guaranteed job.",
    outcomes: ["Associate degree", "Advanced manufacturing skills", "Full-time employment", "$50k-$70k starting salary", "Zero student debt"],
    hiringPartners: ["Toyota", "Siemens", "Caterpillar", "100+ manufacturers"],
    applicationUrl: "https://www.fame-usa.com/",
    chipsActFunded: false,
    noExperienceRequired: true,
    earnWhileLearn: true
  }
];

export default function TrainingLocator() {
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPrograms = trainingPrograms.filter(program => {
    const matchesState = selectedState === "all" || program.state === selectedState;
    const matchesType = selectedType === "all" || program.type === selectedType;
    const matchesSearch = searchTerm === "" || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesState && matchesType && matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    const badges = {
      "quick-start": { label: "Quick Start", variant: "default" as const },
      "apprenticeship": { label: "Apprenticeship", variant: "secondary" as const },
      "bootcamp": { label: "Bootcamp", variant: "outline" as const },
      "certification": { label: "Certification", variant: "outline" as const },
      "vr-training": { label: "VR Training", variant: "secondary" as const }
    };
    return badges[type as keyof typeof badges] || { label: type, variant: "outline" as const };
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Training Locator</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Find debt-free, short-term training programs in semiconductor megafab regions. Most programs are 2-24 weeks and lead directly to $50k-$70k jobs.
        </p>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>CHIPS Act Funded:</strong> Many of these programs are free or low-cost thanks to federal workforce development grants. 
            Look for the "CHIPS Funded" badge.
          </AlertDescription>
        </Alert>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{trainingPrograms.length}</p>
                <p className="text-sm text-muted-foreground">Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{trainingPrograms.filter(p => p.cost.includes("Free")).length}</p>
                <p className="text-sm text-muted-foreground">Free Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{trainingPrograms.filter(p => p.earnWhileLearn).length}</p>
                <p className="text-sm text-muted-foreground">Earn While Learn</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{trainingPrograms.filter(p => p.noExperienceRequired).length}</p>
                <p className="text-sm text-muted-foreground">No Experience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Program
          </CardTitle>
          <CardDescription>Filter by location, program type, or search by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search programs, providers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="OH">Ohio</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Program Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="quick-start">Quick Start (2 weeks)</SelectItem>
                      <SelectItem value="bootcamp">Bootcamp (8-24 weeks)</SelectItem>
                      <SelectItem value="apprenticeship">Apprenticeship (2-4 years)</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="vr-training">VR Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPrograms.length} of {trainingPrograms.length} programs
        </p>
      </div>

      {/* Programs List */}
      <div className="space-y-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    {program.chipsActFunded && (
                      <Badge variant="default">CHIPS Funded</Badge>
                    )}
                    {program.earnWhileLearn && (
                      <Badge variant="secondary">Earn While Learn</Badge>
                    )}
                    {program.noExperienceRequired && (
                      <Badge variant="outline">No Experience Required</Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">{program.provider}</CardDescription>
                </div>
                <Badge {...getTypeBadge(program.type)} className="md:ml-4">
                  {getTypeBadge(program.type).label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p className="mb-4">{program.description}</p>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{program.location}, {program.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{program.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-semibold">{program.cost}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">What You'll Get:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {program.outcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Hiring Partners:</h4>
                <div className="flex flex-wrap gap-2">
                  {program.hiringPartners.map((partner, idx) => (
                    <Badge key={idx} variant="secondary">{partner}</Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full md:w-auto" asChild>
                <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer">
                  Apply Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No programs found matching your filters.</p>
            <Button variant="outline" onClick={() => {
              setSelectedState("all");
              setSelectedType("all");
              setSearchTerm("");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>More ways to find training and apprenticeships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Apprenticeship.gov</h4>
              <p className="text-sm text-muted-foreground mb-2">
                U.S. Department of Labor's official apprenticeship search tool. Search by location and keyword (e.g., "Mechatronics," "Tool and Die," "Semiconductor").
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.apprenticeship.gov/" target="_blank" rel="noopener noreferrer">
                  Visit Apprenticeship.gov
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">SME (Society of Manufacturing Engineers)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Find certification programs, training providers, and online courses. Contact: 866.706.8665 | info@toolingu.com
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.sme.org/" target="_blank" rel="noopener noreferrer">
                  Visit SME
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">NIMS (National Institute for Metalworking Skills)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Industry-standard machining certifications. Find testing centers and certification pathways.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.nims-skills.org/" target="_blank" rel="noopener noreferrer">
                  Visit NIMS
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Glossary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Glossary: Understanding Program Types</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div>
              <dt className="font-semibold">Quick Start</dt>
              <dd className="text-sm text-muted-foreground">2-week intensive programs for rapid entry into semiconductor manufacturing. No experience required.</dd>
            </div>
            <div>
              <dt className="font-semibold">Bootcamp</dt>
              <dd className="text-sm text-muted-foreground">8-24 week comprehensive training programs. More in-depth than Quick Start, still shorter than traditional education.</dd>
            </div>
            <div>
              <dt className="font-semibold">Apprenticeship</dt>
              <dd className="text-sm text-muted-foreground">2-4 year earn-while-learn programs. Combine classroom instruction with on-the-job training. Often debt-free.</dd>
            </div>
            <div>
              <dt className="font-semibold">CHIPS Act Funded</dt>
              <dd className="text-sm text-muted-foreground">Programs receiving federal workforce development grants. Often free or low-cost for participants.</dd>
            </div>
            <div>
              <dt className="font-semibold">Earn While Learn</dt>
              <dd className="text-sm text-muted-foreground">Programs where you receive a salary while training. Typically $30k-$60k during training period.</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
