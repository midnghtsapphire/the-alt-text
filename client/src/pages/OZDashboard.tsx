import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Brain, Code, FileText, Zap, Play, Download, RefreshCw, Upload, FileCode } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function OZDashboard() {
  const { toast } = useToast();
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeToReview, setCodeToReview] = useState('');
  const [reviewResults, setReviewResults] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // OZ Crews (multi-agent teams)
  const crews = [
    {
      id: 'research',
      name: 'Research Crew',
      icon: Brain,
      description: 'Analyze codebase patterns, identify issues, research best practices',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'code',
      name: 'Code Crew',
      icon: Code,
      description: 'Generate code, review quality, suggest improvements, fix bugs',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'documentation',
      name: 'Documentation Crew',
      icon: FileText,
      description: 'Create data dictionaries, ER diagrams, API docs, field mappings',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'automation',
      name: 'Automation Crew',
      icon: Zap,
      description: 'Automate workflows, create scripts, optimize processes',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  // Mock analysis history (replace with real tRPC when backend is ready)
  const analyses: any[] = [];

  const runAnalysis = async (crewId: string) => {
    setSelectedCrew(crewId);
    setIsAnalyzing(true);
    
    toast({
      title: "OZ Analysis Started",
      description: `Running ${crews.find(c => c.id === crewId)?.name} analysis with 5 LLMs...`,
    });

    // Simulate analysis (will be replaced with real tRPC call)
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Multi-LLM analysis finished. Results saved to Google Drive and GitHub.",
      });
    }, 3000);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">OZ Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          The Omnipotent Orchestrator - Multi-agent AI system for research, code analysis, documentation, and automation
        </p>
      </div>

      {/* Manual Code Review Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileCode className="h-6 w-6 text-[#D4AF37]" />
          Manual Code Review
        </h2>
        <p className="text-muted-foreground mb-4">
          Paste your code below for instant multi-LLM review. Get feedback from 3 different AI models simultaneously.
        </p>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your code here for review...\n\nExample:\nfunction calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}"
            value={codeToReview}
            onChange={(e) => setCodeToReview(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                if (!codeToReview.trim()) {
                  toast({
                    title: "No Code Provided",
                    description: "Please paste some code to review",
                    variant: "destructive",
                  });
                  return;
                }
                
                setIsReviewing(true);
                toast({
                  title: "Review Started",
                  description: "Analyzing your code with 3 AI models...",
                });
                
                // Simulate multi-LLM review (replace with actual API call)
                setTimeout(() => {
                  setReviewResults({
                    claude: "✅ **Security**: No vulnerabilities found\n⚠️ **Performance**: Consider memoizing this function if called frequently\n💡 **Best Practice**: Add TypeScript types for better type safety",
                    gpt4: "✅ **Code Quality**: Clean and readable\n⚠️ **Error Handling**: Add null/undefined checks for items array\n💡 **Suggestion**: Use optional chaining: items?.reduce(...)",
                    qwen: "✅ **Logic**: Correct implementation\n⚠️ **Edge Cases**: Handle empty array case explicitly\n💡 **Optimization**: Consider using for loop for better performance with large arrays",
                  });
                  setIsReviewing(false);
                  toast({
                    title: "Review Complete",
                    description: "3 AI models have analyzed your code",
                  });
                }, 2000);
              }}
              disabled={isReviewing || !codeToReview.trim()}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Review Code
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setCodeToReview('');
                setReviewResults(null);
              }}
              disabled={isReviewing}
            >
              Clear
            </Button>
          </div>
          
          {reviewResults && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Review Results</h3>
              <Tabs defaultValue="claude" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="claude">Claude 3.7</TabsTrigger>
                  <TabsTrigger value="gpt4">GPT-4</TabsTrigger>
                  <TabsTrigger value="qwen">Qwen 2.5</TabsTrigger>
                </TabsList>
                <TabsContent value="claude" className="space-y-4">
                  <Card className="p-4 bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">Claude 3.7 Sonnet Analysis</h4>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{reviewResults.claude}</div>
                  </Card>
                </TabsContent>
                <TabsContent value="gpt4" className="space-y-4">
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">GPT-4 Turbo Analysis</h4>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{reviewResults.gpt4}</div>
                  </Card>
                </TabsContent>
                <TabsContent value="qwen" className="space-y-4">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Qwen 2.5 Coder Analysis</h4>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{reviewResults.qwen}</div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </Card>

      {/* Inline Documentation (ADHD-friendly) */}
      <Card className="p-6 mb-8 bg-accent/50">
        <h2 className="text-xl font-semibold mb-3">How OZ Works</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Step 1:</strong> Select a crew below based on what you need</p>
          <p><strong>Step 2:</strong> Click "Run Analysis" to start the multi-agent system</p>
          <p><strong>Step 3:</strong> View real-time progress as multiple LLMs analyze your codebase</p>
          <p><strong>Step 4:</strong> Download comprehensive reports with side-by-side comparisons</p>
        </div>
      </Card>

      {/* Crew Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {crews.map((crew) => {
          const Icon = crew.icon;
          return (
            <Card 
              key={crew.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedCrew === crew.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCrew(crew.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${crew.bgColor}`}>
                  <Icon className={`h-6 w-6 ${crew.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{crew.name}</h3>
                  <p className="text-sm text-muted-foreground">{crew.description}</p>
                  <Button
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      runAnalysis(crew.id);
                    }}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && selectedCrew === crew.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analysis Progress (shown when running) */}
      {isAnalyzing && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Analysis in Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Claude 3.7 Sonnet</p>
                <div className="h-2 bg-secondary rounded-full mt-1">
                  <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
              <div className="flex-1">
                <p className="font-medium">GPT-4 Turbo</p>
                <div className="h-2 bg-secondary rounded-full mt-1">
                  <div className="h-full bg-green-500 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">Qwen 2.5 Coder</p>
                <div className="h-2 bg-secondary rounded-full mt-1">
                  <div className="h-full bg-purple-500 rounded-full w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Analysis History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Analysis History</h2>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {analyses && analyses.length > 0 ? (
            analyses.map((analysis: any) => {
              const crew = crews.find(c => c.id === analysis.analysisType);
              const Icon = crew?.icon || Code;
              return (
                <div key={analysis.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${crew?.color || 'text-gray-500'}`} />
                    <div>
                      <p className="font-medium">{crew?.name || analysis.analysisType} Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.status === 'completed' ? 'Completed' : analysis.status === 'running' ? 'Running...' : 'Failed'} - {new Date(analysis.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled={analysis.status !== 'completed'}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">No analyses yet. Run your first analysis above!</p>
          )}
        </div>
      </Card>

      {/* Multi-LLM Comparison Section */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Multi-LLM Model Comparison</h2>
        <p className="text-sm text-muted-foreground mb-4">
          OZ runs analysis through 5 different AI models simultaneously for comprehensive insights:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 border rounded-lg text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="font-semibold text-sm">Claude 3.7 Sonnet</p>
            <p className="text-xs text-muted-foreground mt-1">Latest Anthropic</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-sm">GPT-4 Turbo</p>
            <p className="text-xs text-muted-foreground mt-1">OpenAI</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="font-semibold text-sm">Qwen 2.5 Coder</p>
            <p className="text-xs text-muted-foreground mt-1">Uncensored</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <p className="font-semibold text-sm">Claude 3.5 Sonnet</p>
            <p className="text-xs text-muted-foreground mt-1">Anthropic</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="font-semibold text-sm">Gemini 2.0 Flash</p>
            <p className="text-xs text-muted-foreground mt-1">Google</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
