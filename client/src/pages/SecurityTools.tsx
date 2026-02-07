import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Github, Star, TrendingUp, Shield, Search } from "lucide-react";
import { toast } from "sonner";

export default function SecurityTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: allTools, isLoading } = trpc.security.getAllTools.useQuery();
  
  // Parse JSON fields and filter tools
  const parsedTools = allTools?.map((tool: any) => ({
    ...tool,
    features: typeof tool.features === 'string' ? JSON.parse(tool.features) : tool.features,
    useCases: typeof tool.useCases === 'string' ? JSON.parse(tool.useCases) : tool.useCases,
  }));

  const tools = parsedTools?.filter((tool: any) => {
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesType = selectedType === "all" || tool.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const filteredQuery = {
  };

  const trackAffiliateMutation = trpc.security.trackClick.useMutation();

  const handleAffiliateClick = async (toolId: number, toolName: string, affiliateUrl: string) => {
    try {
      await trackAffiliateMutation.mutateAsync({ toolId });
      window.open(affiliateUrl, "_blank");
      toast.success(`Opening ${toolName}...`);
    } catch (error) {
      console.error("Failed to track affiliate click:", error);
      window.open(affiliateUrl, "_blank");
    }
  };

  const categories = [
    "All Categories",
    "Network Security & Monitoring",
    "Vulnerability & Web Security",
    "Endpoint Protection & Compliance",
    "Identity & Access Management",
    "Firewalls & Infrastructure",
    "Penetration Testing & Forensics",
    "AI & Threat Detection",
    "Emerging & Specialized Defense",
    "Advanced Vulnerability & API Security",
    "Cloud & Infrastructure Auditing",
    "Incident Response & Forensics",
    "Email & Cloud Security",
    "Security Awareness & Training",
    "Network & Privacy",
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Security Tools Catalog</h1>
        <p className="text-muted-foreground">
          Comprehensive directory of 50+ open-source and SaaS security tools for network defense, vulnerability scanning, and data protection
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.slice(1).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="open_source">Open Source</SelectItem>
              <SelectItem value="saas">SaaS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tools Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tools ({tools?.length || 0})</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="emerging">Emerging</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tools && tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {tool.name}
                          {tool.isPopular && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3" />
                              Popular
                            </Badge>
                          )}
                          {tool.isEmerging && (
                            <Badge variant="secondary" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Emerging
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{tool.category}</CardDescription>
                      </div>
                      <Badge variant={tool.type === "open_source" ? "default" : "secondary"}>
                        {tool.type === "open_source" ? "Open Source" : "SaaS"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    
                    {tool.features && Array.isArray(tool.features) && tool.features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Key Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.features.slice(0, 4).map((feature: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {tool.useCases && Array.isArray(tool.useCases) && tool.useCases.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Use Cases:</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.useCases.slice(0, 3).map((useCase: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {tool.websiteUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(tool.websiteUrl!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </Button>
                    )}
                    {tool.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(tool.githubUrl!, "_blank")}
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                    {tool.hasAffiliate && tool.affiliateUrl && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAffiliateClick(tool.id, tool.name, tool.affiliateUrl!)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No tools found</p>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools?.filter((t: any) => t.isPopular).map((tool: any) => (
              <Card key={tool.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {tool.name}
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      Popular
                    </Badge>
                  </CardTitle>
                  <CardDescription>{tool.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {tool.websiteUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tool.websiteUrl!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  )}
                  {tool.githubUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tool.githubUrl!, "_blank")}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="emerging" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools?.filter((t: any) => t.isEmerging).map((tool: any) => (
              <Card key={tool.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {tool.name}
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Emerging
                    </Badge>
                  </CardTitle>
                  <CardDescription>{tool.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {tool.websiteUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tool.websiteUrl!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  )}
                  {tool.githubUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tool.githubUrl!, "_blank")}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="affiliate" className="mt-6">
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              These security tools offer affiliate programs. When you purchase through our links, we may earn a commission at no additional cost to you. This helps support our platform and allows us to continue providing free resources.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools?.filter((t: any) => t.hasAffiliate).map((tool: any) => (
              <Card key={tool.id}>
                <CardHeader>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  {tool.affiliateCommission && (
                    <Badge variant="secondary" className="mb-2">
                      Commission: {tool.affiliateCommission}
                    </Badge>
                  )}
                </CardContent>
                <CardFooter>
                  {tool.affiliateUrl && (
                    <Button
                      className="w-full"
                      onClick={() => handleAffiliateClick(tool.id, tool.name, tool.affiliateUrl!)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
