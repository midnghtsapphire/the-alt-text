import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Brain, Sparkles, TrendingUp, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

const INDUSTRIES = [
  "Manufacturing", "Construction", "Automotive", "Aerospace", "Electronics",
  "IT/Software", "Healthcare", "Retail", "Food Service", "Logistics",
  "Military/Veterans", "Education", "Other"
];

const EDUCATION_LEVELS = [
  "High School/GED", "Some College", "Associate Degree", 
  "Bachelor's Degree", "Master's Degree", "Trade School/Apprenticeship"
];

const SKILLS = [
  "Machine Operation", "Quality Control", "Blueprint Reading", "Hand Tools",
  "Power Tools", "Computer Skills", "Problem Solving", "Team Leadership",
  "Troubleshooting", "Precision Measurement", "Welding", "CNC Operation",
  "Electrical Work", "Mechanical Assembly", "Programming", "CAD Software"
];

export default function AssessmentWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    currentRole: "",
    currentIndustry: "",
    yearsExperience: 5,
    educationLevel: "",
    skills: [] as string[],
    careerGoals: ""
  });

  const createAssessment = trpc.assessment.create.useMutation({
    onSuccess: (data) => {
      toast.success("Assessment complete! Analyzing your hidden position...");
      setLocation(`/assessment/results/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Assessment failed: ${error.message}`);
    }
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    createAssessment.mutate(formData);
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.currentRole && formData.currentIndustry;
      case 2:
        return true; // Years experience always has a value
      case 3:
        return formData.educationLevel;
      case 4:
        return formData.skills.length > 0;
      case 5:
        return formData.careerGoals.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-card/30 py-12">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 text-base px-4 py-2 bg-gradient-to-r from-primary to-accent text-white border-0">
              <Brain className="h-4 w-4 mr-2 inline animate-pulse" />
              AI-Powered Assessment
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Where Do I Stand?</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover your hidden position in the tech landscape. Answer 5 quick questions and let AI reveal your path to $100k+ careers.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Question Cards */}
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <><Target className="h-6 w-6 text-primary" /> Current Position</>}
                {step === 2 && <><TrendingUp className="h-6 w-6 text-accent" /> Experience Level</>}
                {step === 3 && <><Sparkles className="h-6 w-6 text-primary" /> Education</>}
                {step === 4 && <><Brain className="h-6 w-6 text-accent" /> Your Skills</>}
                {step === 5 && <><Target className="h-6 w-6 text-primary" /> Career Goals</>}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about your current role and industry"}
                {step === 2 && "How many years of work experience do you have?"}
                {step === 3 && "What's your highest level of education?"}
                {step === 4 && "Select all skills you have (even basic knowledge counts!)"}
                {step === 5 && "What are you hoping to achieve in your career?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Current Role & Industry */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentRole">Current Job Title</Label>
                    <Input
                      id="currentRole"
                      placeholder="e.g., Machine Operator, IT Support, Warehouse Manager"
                      value={formData.currentRole}
                      onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentIndustry">Current Industry</Label>
                    <Select
                      value={formData.currentIndustry}
                      onValueChange={(value) => setFormData({ ...formData, currentIndustry: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Years of Experience */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold text-primary mb-4">
                      {formData.yearsExperience}+
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">Years of Experience</p>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                      className="w-full max-w-md mx-auto"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                      <span>0</span>
                      <span>15</span>
                      <span>30+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Education Level */}
              {step === 3 && (
                <div className="space-y-4">
                  <Label>Select Your Education Level</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EDUCATION_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setFormData({ ...formData, educationLevel: level })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.educationLevel === level
                            ? "border-primary bg-primary/10 font-semibold"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Skills */}
              {step === 4 && (
                <div className="space-y-4">
                  <Label>Select All That Apply (Don't be modest!)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SKILLS.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/10 cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        <Checkbox
                          id={skill}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <label
                          htmlFor={skill}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.skills.length} skills
                  </p>
                </div>
              )}

              {/* Step 5: Career Goals */}
              {step === 5 && (
                <div className="space-y-4">
                  <Label htmlFor="careerGoals">What Do You Want to Achieve?</Label>
                  <Textarea
                    id="careerGoals"
                    placeholder="e.g., I want to earn $100k+, work with advanced technology, have job security, transition to a growing industry..."
                    value={formData.careerGoals}
                    onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                    rows={6}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific! This helps AI find the best matches for you.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || createAssessment.isPending}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || createAssessment.isPending}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {createAssessment.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : step === totalSteps ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Reveal My Position
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">AI-Powered Analysis</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Advanced matching algorithms
                </p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6 text-center">
                <Sparkles className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold">Hidden Qualifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Discover what you didn't know
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Career Matches</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Personalized recommendations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
