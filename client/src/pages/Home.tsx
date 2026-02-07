import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  BookOpen, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Sparkles,
  Brain,
  Zap,
  Target,
  DollarSign,
  Unlock,
  Settings,
  Cog
} from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section with AI Emphasis */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-b border-border">
        <div className="absolute inset-0 opacity-10">
          <Settings className="absolute top-20 left-10 h-32 w-32 text-primary animate-spin" style={{ animationDuration: '20s' }} />
          <Cog className="absolute top-40 right-20 h-24 w-24 text-accent animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          <Settings className="absolute bottom-20 left-1/3 h-28 w-28 text-primary animate-spin" style={{ animationDuration: '25s' }} />
        </div>
        
        <div className="container relative py-20 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* AI-Powered Badge */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Badge className="text-base md:text-lg px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary to-accent text-white border-0 rounded-lg" variant="default">
                <Brain className="h-4 md:h-5 w-4 md:w-5 mr-2 inline animate-pulse" />
                Merge with AI
              </Badge>
              <Badge className="text-base md:text-lg px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-accent to-primary text-white border-0 rounded-lg" variant="default">
                <Unlock className="h-4 md:h-5 w-4 md:w-5 mr-2 inline" />
                Unbox Career Gentrification
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Mechatronopolis
            </h1>
            <p className="text-lg md:text-xl font-semibold text-primary mb-2">
              Interdisciplinary Engineering: Mechanical | Electronics | Computer Science | Control Systems
            </p>
            <p className="text-base md:text-lg text-accent font-medium mb-4">
              Smart, Automated, Efficient Products. Sensors | Actuators | Software. Autonomous Machines.
            </p>
            
            {/* Discovery & Direction Message */}
            <div className="my-8 p-6 bg-card/80 backdrop-blur rounded-2xl border-2 border-primary/20 shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <span className="text-foreground">You Don't Know Where You Stand Today...</span>
              </h2>
              <h3 className="text-xl md:text-2xl font-bold mb-6 text-primary">
                ...But You'll Know Where You're Going with Mechatronics Hub
              </h3>
              <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                <Badge className="text-base px-4 py-2 bg-primary/10 text-primary border border-primary" variant="outline">
                  <Brain className="h-4 w-4 mr-2 inline" />
                  Merge with AI
                </Badge>
                <span className="text-2xl text-muted-foreground">+</span>
                <Badge className="text-base px-4 py-2 bg-accent/10 text-accent border border-accent" variant="outline">
                  <Unlock className="h-4 w-4 mr-2 inline" />
                  Unbox Gentrification
                </Badge>
                <span className="text-2xl text-muted-foreground">=</span>
                <Badge className="text-base px-4 py-2 bg-gradient-to-r from-primary to-accent text-white border-0" variant="default">
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Your $100k+ Path
                </Badge>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Most people <strong className="text-foreground">underestimate their position</strong> in the tech landscape. 
                You have <strong className="text-primary">hidden qualifications</strong> you don't even know about. 
                <strong className="text-accent">Transferable skills</strong> that are worth $100k+ in mechatronics. 
                Our AI <strong className="text-foreground">reveals where you really stand</strong> and shows you <strong className="text-primary">the exact path forward</strong>. AI doesn't replace you—it <strong className="text-accent">accelerates</strong> you. 
                No guessing. No uncertainty. Just clarity.
              </p>
            </div>

            {/* AI Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-primary transition-all">
                <Brain className="h-10 w-10 text-primary mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Discover Where You Stand</h3>
                <p className="text-sm text-muted-foreground">AI reveals your hidden position in the tech landscape.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-accent transition-all">
                <Target className="h-10 w-10 text-accent mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-2">See Where You're Going</h3>
                <p className="text-sm text-muted-foreground">Clear roadmap from your current position to $100k+ roles.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-primary transition-all">
                <DollarSign className="h-10 w-10 text-primary mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Know Your Path</h3>
                <p className="text-sm text-muted-foreground">Exact timeline, costs, and earnings. No uncertainty.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/career-highway">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all">
                  <Zap className="h-5 w-5 mr-2" />
                  Start Your AI Career Assessment
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explore Research
                </Button>
              </Link>
            </div>

            {/* Success Metrics */}
            <div className="mt-12 flex flex-wrap gap-6 justify-center text-center">
              <div className="bg-card/60 backdrop-blur px-6 py-4 rounded-lg border border-border">
                <div className="text-3xl font-bold text-primary">$75k</div>
                <div className="text-sm text-muted-foreground">Avg Salary Increase</div>
              </div>
              <div className="bg-card/60 backdrop-blur px-6 py-4 rounded-lg border border-border">
                <div className="text-3xl font-bold text-accent">18-36mo</div>
                <div className="text-sm text-muted-foreground">Transition Timeline</div>
              </div>
              <div className="bg-card/60 backdrop-blur px-6 py-4 rounded-lg border border-border">
                <div className="text-3xl font-bold text-primary">87%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How AI Gentrifies Your Career */}
      <section className="bg-gradient-to-b from-background to-card/50 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
              <Badge className="text-base px-4 py-2" variant="secondary">
                <Brain className="h-4 w-4 mr-2 inline" />
                Merge with AI
              </Badge>
              <Badge className="text-base px-4 py-2" variant="secondary">
                <Unlock className="h-4 w-4 mr-2 inline" />
                Unbox Gentrification
              </Badge>
            </div>
            <h2 className="text-4xl font-bold mb-4">Merge with AI to Unbox Hidden Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Traditional career advice is broken. <strong className="text-primary">Merge with AI</strong> to discover what humans miss. 
              <strong className="text-accent">Unbox career gentrification</strong> by revealing your hidden qualifications. 
              AI doesn't replace you—it <strong className="text-foreground">accelerates</strong> you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Old Way vs New Way */}
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <span className="text-2xl">❌</span>
                  The Old Way (Gatekeeping)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">• "You need a 4-year degree"</p>
                <p className="text-muted-foreground">• "You're too old to change careers"</p>
                <p className="text-muted-foreground">• "No relevant experience? No chance."</p>
                <p className="text-muted-foreground">• "Start at the bottom and work up"</p>
                <p className="text-muted-foreground">• "That'll take 10+ years"</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="h-6 w-6" />
                  The AI Way (Gentrification)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground">• <strong>AI finds your transferable skills</strong></p>
                <p className="text-foreground">• <strong>Experience is an asset, not a barrier</strong></p>
                <p className="text-foreground">• <strong>Hidden qualifications revealed</strong></p>
                <p className="text-foreground">• <strong>Fast-track pathways identified</strong></p>
                <p className="text-foreground">• <strong>18-36 months to $100k+</strong></p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Highway Preview */}
      <section className="py-20 bg-gradient-to-b from-card/50 to-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Infomechatronics Career Highway</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered roadmap from where you are to where you want to be
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link href="/career-highway">
              <Card className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary h-full">
                <CardHeader>
                  <div className="text-4xl mb-4">🚀</div>
                  <CardTitle>1. AI Assessment</CardTitle>
                  <CardDescription>
                    Chat with AI about your background, skills, and goals. Get personalized career matches in minutes.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/career-highway">
              <Card className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-accent h-full">
                <CardHeader>
                  <div className="text-4xl mb-4">🎯</div>
                  <CardTitle>2. Skills Gap Analysis</CardTitle>
                  <CardDescription>
                    AI identifies exactly what you need to learn, how long it takes, and what it costs.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/career-highway">
              <Card className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary h-full">
                <CardHeader>
                  <div className="text-4xl mb-4">💰</div>
                  <CardTitle>3. ROI & Action Plan</CardTitle>
                  <CardDescription>
                    See your break-even point, lifetime earnings, and step-by-step action plan.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link href="/career-highway">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent">
                <Brain className="h-5 w-5 mr-2" />
                Start Your AI Career Journey Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Explore the Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/training-locator">
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full">
                <CardHeader>
                  <GraduationCap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Training Programs</CardTitle>
                  <CardDescription>
                    Find earn-while-learn programs near you
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/nomad">
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full">
                <CardHeader>
                  <MapPin className="h-10 w-10 text-accent mb-2" />
                  <CardTitle>Nomad Map</CardTitle>
                  <CardDescription>
                    Discover high-opportunity cities
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/employers">
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full">
                <CardHeader>
                  <Briefcase className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Job Openings</CardTitle>
                  <CardDescription>
                    Browse mechatronics jobs nationwide
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/industrial-ladder">
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-accent mb-2" />
                  <CardTitle>Career Ladder</CardTitle>
                  <CardDescription>
                    See the $35k → $160k progression
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Gentrify Your Career?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let AI unbox your hidden potential and map your path to a $100k+ mechatronics career.
          </p>
          <Link href="/career-highway">
            <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-accent hover:shadow-2xl transition-all">
              <Sparkles className="h-6 w-6 mr-3" />
              Start Your Free AI Assessment
              <Sparkles className="h-6 w-6 ml-3" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
