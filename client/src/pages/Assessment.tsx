import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, TrendingUp, DollarSign, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const questions = [
  {
    id: 1,
    question: "What's your current background?",
    options: [
      { value: "manufacturing", label: "Manufacturing/Production" },
      { value: "military", label: "Military/Veteran" },
      { value: "trades", label: "Skilled Trades (Welding, Machining, etc.)" },
      { value: "tech", label: "Tech/IT" },
      { value: "other", label: "Other/Career Changer" }
    ]
  },
  {
    id: 2,
    question: "What's your highest level of education?",
    options: [
      { value: "high_school", label: "High School/GED" },
      { value: "some_college", label: "Some College" },
      { value: "associates", label: "Associate's Degree" },
      { value: "bachelors", label: "Bachelor's Degree or Higher" },
      { value: "certifications", label: "Industry Certifications Only" }
    ]
  },
  {
    id: 3,
    question: "How many years of relevant experience do you have?",
    options: [
      { value: "0-2", label: "0-2 years" },
      { value: "3-5", label: "3-5 years" },
      { value: "6-10", label: "6-10 years" },
      { value: "11-15", label: "11-15 years" },
      { value: "15+", label: "15+ years" }
    ]
  },
  {
    id: 4,
    question: "Which skills do you have? (Select the closest match)",
    options: [
      { value: "hands_on", label: "Hands-on: Welding, Machining, Assembly" },
      { value: "technical", label: "Technical: CAD, Programming, Automation" },
      { value: "problem_solving", label: "Problem-solving: Troubleshooting, Analysis" },
      { value: "leadership", label: "Leadership: Team Management, Project Coordination" },
      { value: "learning", label: "Fast Learner: Willing to Train" }
    ]
  },
  {
    id: 5,
    question: "What's your career goal timeline?",
    options: [
      { value: "immediate", label: "Immediate (0-6 months)" },
      { value: "short", label: "Short-term (6-12 months)" },
      { value: "medium", label: "Medium-term (1-2 years)" },
      { value: "long", label: "Long-term (2-5 years)" },
      { value: "exploring", label: "Just Exploring Options" }
    ]
  }
];

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [backgroundSelections, setBackgroundSelections] = useState<string[]>([]);
  const MAX_BACKGROUND_SELECTIONS = 3;
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const assessmentMutation = trpc.ai.assessCareer.useMutation();

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[questions[currentQuestion].id];
  const isBackgroundQuestion = questions[currentQuestion].id === 1;
  
  const toggleBackground = (value: string) => {
    setBackgroundSelections(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else if (prev.length < MAX_BACKGROUND_SELECTIONS) {
        return [...prev, value];
      }
      return prev;
    });
  };
  
  // Update answers when background selections change
  useEffect(() => {
    if (isBackgroundQuestion && backgroundSelections.length > 0) {
      setAnswers({ ...answers, 1: backgroundSelections.join(", ") });
    }
  }, [backgroundSelections, isBackgroundQuestion]);

  const handleNext = () => {
    // Special validation for background question
    if (isBackgroundQuestion && backgroundSelections.length === 0) {
      toast.error("Please select at least one background");
      return;
    }
    
    if (!isBackgroundQuestion && !currentAnswer) {
      toast.error("Please select an answer");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await assessmentMutation.mutateAsync({ responses: answers });
      setAssessmentResult(result);
      setShowResults(true);
      toast.success("Assessment complete!");
    } catch (error) {
      toast.error("Failed to analyze your assessment. Please try again.");
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setAssessmentResult(null);
  };

  if (showResults && assessmentResult) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Results Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">AI Analysis Complete</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              Your Hidden Career Path Revealed
            </h1>
            <p className="text-xl text-muted-foreground">
              Based on your background, here's what AI discovered about your mechatronics potential
            </p>
          </div>

          {/* Key Insights */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-cyan-500/30 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <TrendingUp className="h-5 w-5" />
                  Career Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{assessmentResult.careerLevel}</p>
                <p className="text-sm text-muted-foreground mt-2">{assessmentResult.careerLevelDescription}</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <DollarSign className="h-5 w-5" />
                  Salary Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{assessmentResult.salaryRange}</p>
                <p className="text-sm text-muted-foreground mt-2">Based on your profile</p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/30 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{assessmentResult.timeline}</p>
                <p className="text-sm text-muted-foreground mt-2">To reach target level</p>
              </CardContent>
            </Card>
          </div>

          {/* Top 3 Career Matches */}
          {assessmentResult.topMatches && assessmentResult.topMatches.length > 0 && (
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-2xl">🎯 Your Top Career Matches</CardTitle>
                <CardDescription>AI-analyzed career paths ranked by confidence score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentResult.topMatches.map((match: any, index: number) => (
                  <Card key={index} className="border-cyan-500/10 bg-card/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-cyan-400 mb-1">
                            {index + 1}. {match.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{match.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-purple-400">{match.confidenceScore}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-orange-400 mb-3">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">{match.salaryRange}</span>
                      </div>
                      {match.transferableSkills && match.transferableSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Your Transferable Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.transferableSkills.map((skill: string, skillIndex: number) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <Card className="border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-2xl">🤖 AI Career Analysis</CardTitle>
              <CardDescription>Personalized insights based on your responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Hidden Qualifications Discovered</h3>
                <p className="text-muted-foreground whitespace-pre-line">{assessmentResult.hiddenQualifications}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Recommended Path</h3>
                <p className="text-muted-foreground whitespace-pre-line">{assessmentResult.recommendedPath}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Next Steps</h3>
                <ul className="space-y-2">
                  {assessmentResult.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">{index + 1}.</span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
              <a href="/career-highway">Explore Career Highway</a>
            </Button>
            <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600">
              <a href="/ai-coach">Talk to AI Career Coach</a>
            </Button>
            <Button size="lg" variant="outline" onClick={handleRestart}>
              Take Assessment Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">AI Career Discovery</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            Where Do I Stand?
          </h1>
          <p className="text-xl text-muted-foreground">
            Answer 5 questions and let AI reveal your hidden mechatronics career path
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-2xl">{questions[currentQuestion].question}</CardTitle>
            <CardDescription>Select the option that best describes you</CardDescription>
          </CardHeader>
          <CardContent>
            {isBackgroundQuestion ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Select 1-{MAX_BACKGROUND_SELECTIONS} backgrounds that describe you ({backgroundSelections.length}/{MAX_BACKGROUND_SELECTIONS} selected)
                </p>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option) => {
                    const isSelected = backgroundSelections.includes(option.value);
                    const isDisabled = !isSelected && backgroundSelections.length >= MAX_BACKGROUND_SELECTIONS;
                    return (
                      <div
                        key={option.value}
                        onClick={() => !isDisabled && toggleBackground(option.value)}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : isDisabled
                            ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                            : 'border-border hover:border-cyan-500/50 hover:bg-cyan-500/5'
                        }`}
                      >
                        <Checkbox
                          id={option.value}
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => !isDisabled && toggleBackground(option.value)}
                        />
                        <Label
                          htmlFor={option.value}
                          className={`flex-1 cursor-pointer text-base ${
                            isDisabled ? 'cursor-not-allowed' : ''
                          }`}
                        >
                          {option.label}
                          {isSelected && <span className="ml-2 text-cyan-400">✓</span>}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <RadioGroup
                value={currentAnswer}
                onValueChange={(value) => setAnswers({ ...answers, [questions[currentQuestion].id]: value })}
              >
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {assessmentMutation.isPending && (
          <div className="text-center p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="text-lg font-semibold text-cyan-400">
              🔄 Analyzing your responses with AI...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take 10-15 seconds. Please wait.
            </p>
          </div>
        )}

        {assessmentMutation.isSuccess && !showResults && (
          <div className="text-center p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-green-400" />
            <p className="text-lg font-semibold text-green-400">
              ✅ Analysis Complete!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your personalized career insights are ready. Click below to view.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={(isBackgroundQuestion ? backgroundSelections.length === 0 : !currentAnswer) || assessmentMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isLastQuestion ? "Get My Results" : "Next Question"}
          </Button>
        </div>

        {/* Info Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>🔒 Your responses are analyzed in real-time using AI</p>
          <p className="mt-1">Results are personalized based on your unique background</p>
        </div>
      </div>
    </div>
  );
}
