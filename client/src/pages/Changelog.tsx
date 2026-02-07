import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, FileText, BarChart3, MapPin, AlertCircle, CheckCircle2, Circle, ListTodo } from "lucide-react";
import { useState, useEffect } from "react";

const colorConfig = {
  red: {
    label: "RED - Pending Verification",
    description: "New content awaiting fact-checking and validation",
    badge: "bg-red-500 hover:bg-red-600",
    icon: AlertCircle,
  },
  blue: {
    label: "BLUE - Under Review",
    description: "Content being reviewed and validated",
    badge: "bg-blue-500 hover:bg-blue-600",
    icon: FileText,
  },
  yellow: {
    label: "YELLOW - Final Check",
    description: "Content in final verification stage",
    badge: "bg-yellow-500 hover:bg-yellow-600",
    icon: BarChart3,
  },
  green: {
    label: "GREEN - Verified & Live",
    description: "Fully verified content deployed to production",
    badge: "bg-green-500 hover:bg-green-600",
    icon: MapPin,
  },
};

const contentTypeLabels = {
  qa: "Q&A Item",
  statistic: "Statistic",
  resource: "Resource",
  location: "Location",
};

// Sample todo data - in production this would come from backend
const todoData = {
  p0: [
    { id: 1, title: "Build 'Where Do I Stand?' assessment tool", completed: false, category: "AI Features" },
    { id: 2, title: "Create AI Career Coach chatbot with OpenRouter", completed: false, category: "AI Features" },
    { id: 3, title: "Add success stories section with case studies", completed: false, category: "Content" },
    { id: 4, title: "Build automated affiliate link injector", completed: false, category: "Affiliate System" },
    { id: 5, title: "Add affiliate performance dashboard", completed: false, category: "Affiliate System" },
  ],
  p1: [
    { id: 6, title: "Expand Career Highway with more pathways", completed: false, category: "Career Tools" },
    { id: 7, title: "Add interactive salary calculator", completed: false, category: "Career Tools" },
    { id: 8, title: "Build resume analyzer with AI", completed: false, category: "AI Features" },
    { id: 9, title: "Create skills gap analysis tool", completed: false, category: "Career Tools" },
    { id: 10, title: "Add social sharing options", completed: false, category: "Features" },
  ],
  p2: [
    { id: 11, title: "Build employer talent discovery page", completed: false, category: "Talent Pipeline" },
    { id: 12, title: "Create job matching algorithm", completed: false, category: "Talent Pipeline" },
    { id: 13, title: "Add direct messaging system", completed: false, category: "Communication" },
    { id: 14, title: "Implement user reputation system", completed: false, category: "Community" },
    { id: 15, title: "Build contributor leaderboard", completed: false, category: "Community" },
  ],
  p3: [
    { id: 16, title: "Link citations to Q&A content", completed: false, category: "Content" },
    { id: 17, title: "Implement citation search", completed: false, category: "Search" },
    { id: 18, title: "Add notification system for deadlines", completed: false, category: "Features" },
    { id: 19, title: "Build PDF export functionality", completed: false, category: "Export" },
    { id: 20, title: "Create public progress view page", completed: false, category: "Sharing" },
  ],
  completed: [
    { id: 101, title: "Integrated cyberpunk logo with neon aesthetics", completed: true, category: "Design" },
    { id: 102, title: "Built comprehensive affiliate partners directory (52+ partners)", completed: true, category: "Affiliate System" },
    { id: 103, title: "Created Career Highway with 6-level roadmap", completed: true, category: "Career Tools" },
    { id: 104, title: "Implemented dual messaging: Merge with AI + Unbox Gentrification", completed: true, category: "Messaging" },
    { id: 105, title: "Applied dark cyberpunk color scheme with neon accents", completed: true, category: "Design" },
    { id: 106, title: "Built affiliate credentials management system", completed: true, category: "Affiliate System" },
    { id: 107, title: "Created interactive Nomad Opportunity Map", completed: true, category: "Career Tools" },
    { id: 108, title: "Implemented job probability calculator", completed: true, category: "Career Tools" },
    { id: 109, title: "Added cost of living comparison tool", completed: true, category: "Career Tools" },
    { id: 110, title: "Built comprehensive Q&A system with 238 sources", completed: true, category: "Content" },
  ],
};

export default function Changelog() {
  const { data: allVersions, isLoading: allLoading } = trpc.changelog.list.useQuery({});
  const { data: redVersions, isLoading: redLoading } = trpc.changelog.list.useQuery({ color: "red" });
  const { data: blueVersions, isLoading: blueLoading } = trpc.changelog.list.useQuery({ color: "blue" });
  const { data: yellowVersions, isLoading: yellowLoading } = trpc.changelog.list.useQuery({ color: "yellow" });
  const { data: greenVersions, isLoading: greenLoading } = trpc.changelog.list.useQuery({ color: "green" });

  const [selectedPriority, setSelectedPriority] = useState<string>("p0");

  const renderVersionList = (versions: any[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!versions || versions.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No content versions in this iteration yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {versions.map((version) => {
          const colorInfo = colorConfig[version.iterationColor as keyof typeof colorConfig];
          const Icon = colorInfo.icon;
          
          return (
            <Card key={version.id} className="border-l-4" style={{ borderLeftColor: `var(--${version.iterationColor}-500)` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={colorInfo.badge}>
                        <Icon className="h-3 w-3 mr-1" />
                        {version.iterationColor.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {contentTypeLabels[version.contentType as keyof typeof contentTypeLabels]}
                      </Badge>
                      <Badge variant="secondary">v{version.versionNumber}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {version.contentType} #{version.contentId}
                    </CardTitle>
                    {version.changeDescription && (
                      <CardDescription className="mt-2">
                        {version.changeDescription}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(version.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderTodoList = (items: typeof todoData.p0) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tasks in this priority level.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="py-4">
              <div className="flex items-start gap-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.title}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Changelog & Roadmap</h1>
          <p className="text-lg text-muted-foreground">
            Track completed features and upcoming development priorities for Mechatronopolis.
          </p>
        </div>

        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="roadmap" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Roadmap & Todo
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2">
              <FileText className="h-4 w-4" />
              Content Changelog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${selectedPriority === 'p0' ? 'border-red-500 bg-red-500/5' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedPriority('p0')}
                >
                  <CardHeader className="pb-3">
                    <Badge className="bg-red-500 hover:bg-red-600 w-fit mb-2">P0 - Critical</Badge>
                    <CardTitle className="text-2xl">{todoData.p0.length}</CardTitle>
                    <CardDescription className="text-xs">
                      Highest priority items
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${selectedPriority === 'p1' ? 'border-orange-500 bg-orange-500/5' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedPriority('p1')}
                >
                  <CardHeader className="pb-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600 w-fit mb-2">P1 - High</Badge>
                    <CardTitle className="text-2xl">{todoData.p1.length}</CardTitle>
                    <CardDescription className="text-xs">
                      Important features
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${selectedPriority === 'p2' ? 'border-yellow-500 bg-yellow-500/5' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedPriority('p2')}
                >
                  <CardHeader className="pb-3">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 w-fit mb-2">P2 - Medium</Badge>
                    <CardTitle className="text-2xl">{todoData.p2.length}</CardTitle>
                    <CardDescription className="text-xs">
                      Nice to have
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${selectedPriority === 'p3' ? 'border-blue-500 bg-blue-500/5' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedPriority('p3')}
                >
                  <CardHeader className="pb-3">
                    <Badge className="bg-blue-500 hover:bg-blue-600 w-fit mb-2">P3 - Low</Badge>
                    <CardTitle className="text-2xl">{todoData.p3.length}</CardTitle>
                    <CardDescription className="text-xs">
                      Future enhancements
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedPriority === 'p0' && 'P0 - Critical Priority'}
                  {selectedPriority === 'p1' && 'P1 - High Priority'}
                  {selectedPriority === 'p2' && 'P2 - Medium Priority'}
                  {selectedPriority === 'p3' && 'P3 - Low Priority'}
                </h2>
                {renderTodoList(todoData[selectedPriority as keyof typeof todoData] as typeof todoData.p0)}
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  Recently Completed
                </h2>
                {renderTodoList(todoData.completed)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="changelog" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(colorConfig).map(([color, config]) => {
                const Icon = config.icon;
                return (
                  <Card key={color} className="border-l-4" style={{ borderLeftColor: `var(--${color}-500)` }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5" />
                        <Badge className={config.badge}>{color.toUpperCase()}</Badge>
                      </div>
                      <CardTitle className="text-sm">{config.label}</CardTitle>
                      <CardDescription className="text-xs">
                        {config.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="red">RED</TabsTrigger>
                <TabsTrigger value="blue">BLUE</TabsTrigger>
                <TabsTrigger value="yellow">YELLOW</TabsTrigger>
                <TabsTrigger value="green">GREEN</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {renderVersionList(allVersions, allLoading)}
              </TabsContent>

              <TabsContent value="red" className="mt-6">
                {renderVersionList(redVersions, redLoading)}
              </TabsContent>

              <TabsContent value="blue" className="mt-6">
                {renderVersionList(blueVersions, blueLoading)}
              </TabsContent>

              <TabsContent value="yellow" className="mt-6">
                {renderVersionList(yellowVersions, yellowLoading)}
              </TabsContent>

              <TabsContent value="green" className="mt-6">
                {renderVersionList(greenVersions, greenLoading)}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
